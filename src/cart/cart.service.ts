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
  async addItemToCart(userId: number, productId: number, quantity: number): Promise<Cart> {
    // Get or create the cart
    let cart = await this.getCartByUserId(userId);
    
    // Check if product exists
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new AppException(
        `Product not found`,
        ErrorCodes.PRODUCT_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        { productId }
      );
    }
    
    // Check if item already exists in cart
    let cartItem = await this.cartItemRepository.findOne({
      where: { cartId: cart.id, productId }
    });
    
    if (cartItem) {
      // Update quantity if item exists
      cartItem.quantity += quantity;
      await this.cartItemRepository.save(cartItem);
    } else {
      // Create new cart item
      cartItem = this.cartItemRepository.create({
        cartId: cart.id,
        productId,
        quantity
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
  async updateCartItemQuantity(userId: number, itemId: number, quantity: number): Promise<Cart> {
    // Get the cart
    const cart = await this.getCartByUserId(userId);
    
    // Find the item
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId, cartId: cart.id }
    });
    
    if (!cartItem) {
      throw new AppException(
        `Cart item not found`,
        'CART_ITEM_NOT_FOUND',
        HttpStatus.NOT_FOUND,
        { itemId, cartId: cart.id, userId }
      );
    }
    
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      await this.cartItemRepository.remove(cartItem);
    } else {
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
      where: { id: itemId, cartId: cart.id }
    });
    
    if (!cartItem) {
      throw new AppException(
        `Cart item not found`,
        'CART_ITEM_NOT_FOUND',
        HttpStatus.NOT_FOUND,
        { itemId, cartId: cart.id, userId }
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
      where: { cartId: cart.id }
    });
    
    // Remove all items
    if (cartItems.length > 0) {
      await this.cartItemRepository.remove(cartItems);
    }
    
    // Return empty cart
    return this.getCartByUserId(userId);
  }
} 