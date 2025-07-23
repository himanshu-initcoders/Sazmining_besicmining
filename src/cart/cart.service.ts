import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cart-item.entity';
import { User } from '../entities/user.entity';
import { Product } from '../entities/product.entity';
import { AppException } from '../common/exceptions/app.exception';
import { ErrorCodes } from '../common/exceptions/error-codes';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * Create a new cart for a user
   * @param userId The user ID to create the cart for
   * @returns The newly created cart
   */
  async createCartForUser(userId: number): Promise<Cart> {
    const cart = this.cartRepository.create({
      userId,
      items: [],
    });

    return await this.cartRepository.save(cart);
  }

  /**
   * Get a user's cart with all items
   * @param userId The user ID
   * @returns The user's cart with items
   */
  async getCartByUserId(userId: number): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      // Create a new cart if one doesn't exist
      return this.createCartForUser(userId);
    }

    return cart;
  }

  /**
   * Add an item to the user's cart
   * @param userId The user ID
   * @param productId The product ID to add
   * @param quantity The quantity to add
   * @returns The updated cart
   */
  async addItemToCart(
    userId: number,
    productId: number,
    quantity: number,
  ): Promise<Cart> {
    // Get or create the cart
    const cart = await this.getCartByUserId(userId);

    // Check if product exists
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new AppException(
        `Product not found`,
        ErrorCodes.PRODUCT_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        { productId },
      );
    }

    // Check if product is published and active
    if (product.status !== 'Published' && product.status !== 'Mining' || !product.isActive) {
      throw new AppException(
        `Product is not available for purchase`,
        ErrorCodes.PRODUCT_NOT_AVAILABLE,
        HttpStatus.BAD_REQUEST,
        { productId },
      );
    }

    // Check if product is in stock
    if (product.availability === 'Out of Stock') {
      throw new AppException(
        `Product is out of stock`,
        ErrorCodes.PRODUCT_OUT_OF_STOCK,
        HttpStatus.BAD_REQUEST,
        { productId },
      );
    }

    // Check if product is online
    if (product.productStatus !== 'Online') {
      throw new AppException(
        `Product is currently ${product.productStatus}`,
        ErrorCodes.PRODUCT_OFFLINE,
        HttpStatus.BAD_REQUEST,
        { productId, status: product.productStatus },
      );
    }

    // Check quantity availability for limited stock products
    // if (product.stockType === 'limited') {
    //   // Check if there's enough stock available
    //   if (product.quantity < quantity) {
    //     throw new AppException(
    //       `Not enough stock available. Requested: ${quantity}, Available: ${product.quantity}`,
    //       ErrorCodes.INSUFFICIENT_STOCK,
    //       HttpStatus.BAD_REQUEST,
    //       { productId, requested: quantity, available: product.quantity },
    //     );
    //   }
    // }

    // Check if item already exists in cart
    let cartItem = await this.cartItemRepository.findOne({
      where: { cartId: cart.id, productId },
    });

    if (cartItem) {
      // Check if the updated quantity exceeds available stock
      if (product.stockType === 'limited' && cartItem.quantity + quantity > product.quantity) {
        throw new AppException(
          `Not enough stock available. Requested: ${cartItem.quantity + quantity}, Available: ${product.quantity}`,
          ErrorCodes.INSUFFICIENT_STOCK,
          HttpStatus.BAD_REQUEST,
          { 
            productId, 
            requested: cartItem.quantity + quantity, 
            available: product.quantity 
          },
        );
      }

      // Update quantity if item exists
      cartItem.quantity += quantity;
      await this.cartItemRepository.save(cartItem);
    } else {
      // Create new cart item
      cartItem = this.cartItemRepository.create({
        cartId: cart.id,
        productId,
        quantity,
      });
      await this.cartItemRepository.save(cartItem);
    }

    // Return updated cart
    return this.getCartByUserId(userId);
  }

  /**
   * Update the quantity of an item in the cart
   * @param userId The user ID
   * @param itemId The cart item ID
   * @param quantity The new quantity
   * @returns The updated cart
   */
  async updateCartItemQuantity(
    userId: number,
    itemId: number,
    quantity: number,
  ): Promise<Cart> {
    // Get the cart
    const cart = await this.getCartByUserId(userId);

    // Find the item
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId, cartId: cart.id },
    });

    if (!cartItem) {
      throw new AppException(
        `Cart item not found`,
        'CART_ITEM_NOT_FOUND',
        HttpStatus.NOT_FOUND,
        { itemId, cartId: cart.id, userId },
      );
    }

    // Get the product to check availability
    const product = await this.productRepository.findOne({
      where: { id: cartItem.productId },
    });

    if (!product) {
      throw new AppException(
        `Product not found`,
        ErrorCodes.PRODUCT_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        { productId: cartItem.productId },
      );
    }

    // Check if product is still available
    if (product.status !== 'Published' || !product.isActive) {
      throw new AppException(
        `Product is no longer available for purchase`,
        ErrorCodes.PRODUCT_NOT_AVAILABLE,
        HttpStatus.BAD_REQUEST,
        { productId: cartItem.productId },
      );
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      await this.cartItemRepository.remove(cartItem);
    } else {
      // Check if there's enough stock
      if (product.stockType === 'limited' && quantity > product.quantity) {
        throw new AppException(
          `Not enough stock available. Requested: ${quantity}, Available: ${product.quantity}`,
          ErrorCodes.INSUFFICIENT_STOCK,
          HttpStatus.BAD_REQUEST,
          { productId: cartItem.productId, requested: quantity, available: product.quantity },
        );
      }

      // Update quantity
      cartItem.quantity = quantity;
      await this.cartItemRepository.save(cartItem);
    }

    // Return updated cart
    return this.getCartByUserId(userId);
  }

  /**
   * Remove an item from the cart
   * @param userId The user ID
   * @param itemId The cart item ID
   * @returns The updated cart
   */
  async removeItemFromCart(userId: number, itemId: number): Promise<Cart> {
    // Get the cart
    const cart = await this.getCartByUserId(userId);

    // Find the item
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId, cartId: cart.id },
    });

    if (!cartItem) {
      throw new AppException(
        `Cart item not found`,
        'CART_ITEM_NOT_FOUND',
        HttpStatus.NOT_FOUND,
        { itemId, cartId: cart.id, userId },
      );
    }

    // Remove the item
    await this.cartItemRepository.remove(cartItem);

    // Return updated cart
    return this.getCartByUserId(userId);
  }

  /**
   * Clear all items from a user's cart
   * @param userId The user ID
   * @returns The empty cart
   */
  async clearCart(userId: number): Promise<Cart> {
    const cart = await this.getCartByUserId(userId);

    // Find all items in the cart
    const cartItems = await this.cartItemRepository.find({
      where: { cartId: cart.id },
    });

    // Remove all items
    if (cartItems.length > 0) {
      await this.cartItemRepository.remove(cartItems);
    }

    // Return empty cart
    return this.getCartByUserId(userId);
  }
}
