import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, Between } from 'typeorm';
import {
  Product,
  ProductStatus,
  PublishStatus,
  AvailabilityStatus,
} from '../entities/product.entity';
import { User } from '../entities/user.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { PaginationService } from '../common/services/pagination.service';
import { PaginatedResponse } from '../common/interfaces/pagination.interface';
import {
  ImageService,
  StorageLocation,
} from '../upload/services/image.service';
import { AppException } from '../common/exceptions/app.exception';
import { ErrorCodes } from '../common/exceptions/error-codes';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly paginationService: PaginationService,
    private readonly imageService: ImageService,
  ) {}

  /**
   * Create a new product
   * @param createProductDto Product data
   * @param userId User creating the product
   * @returns Created product
   */
  async create(
    createProductDto: CreateProductDto,
    userId: number,
  ): Promise<Product> {
    // Verify user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new AppException(
        'User not found',
        ErrorCodes.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        { userId },
      );
    }

    // Check if serial number already exists
    const existingProduct = await this.productRepository.findOne({
      where: { serialNumber: createProductDto.serialNumber },
    });

    if (existingProduct) {
      throw new AppException(
        'Product with this serial number already exists',
        ErrorCodes.PRODUCT_ALREADY_EXISTS,
        HttpStatus.CONFLICT,
        { serialNumber: createProductDto.serialNumber },
      );
    }

    // Validate auction dates if it's a bid auction
    if (createProductDto.auctionType === 'Bid') {
      if (
        !createProductDto.auctionStartDate ||
        !createProductDto.auctionEndDate
      ) {
        throw new AppException(
          'Auction start and end dates are required for bid auctions',
          ErrorCodes.INVALID_AUCTION_DATES,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (
        createProductDto.auctionStartDate >= createProductDto.auctionEndDate
      ) {
        throw new AppException(
          'Auction end date must be after start date',
          ErrorCodes.INVALID_AUCTION_DATES,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // Create the product
    const newProduct = new Product();
    Object.assign(newProduct, createProductDto);
    newProduct.userId = userId.toString();

    return await this.productRepository.save(newProduct);
  }

  /**
   * Find all products with pagination and filtering
   * @param queryDto Query parameters
   * @returns Paginated products
   */
  async findAll(
    queryDto: ProductQueryDto,
  ): Promise<PaginatedResponse<Product>> {
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.user', 'user');

    // Apply filters
    this.applyFilters(queryBuilder, queryDto);

    // Define searchable columns
    const searchColumns = [
      'product.modelName',
      'product.description',
      'product.manufacturer',
      'product.serialNumber',
      'product.sku',
    ];

    return await this.paginationService.paginate(
      queryBuilder,
      queryDto,
      searchColumns,
    );
  }

  /**
   * Find all published and active products (public endpoint)
   * @param queryDto Query parameters
   * @returns Paginated published products
   */
  async findPublished(
    queryDto: ProductQueryDto,
  ): Promise<PaginatedResponse<Product>> {
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.user', 'user')
      .where('product.status = :status', { status: PublishStatus.PUBLISHED })
      .andWhere('product.isActive = :isActive', { isActive: true });

    // Apply additional filters
    this.applyFilters(queryBuilder, queryDto);

    const searchColumns = [
      'product.modelName',
      'product.description',
      'product.manufacturer',
    ];

    return await this.paginationService.paginate(
      queryBuilder,
      queryDto,
      searchColumns,
    );
  }

  /**
   * Find products by user
   * @param userId User ID
   * @param queryDto Query parameters
   * @returns User's products
   */
  async findByUser(
    userId: string,
    queryDto: ProductQueryDto,
  ): Promise<PaginatedResponse<Product>> {
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.user', 'user')
      .where('product.userId = :userId', { userId });

    // Apply filters
    this.applyFilters(queryBuilder, queryDto);

    const searchColumns = [
      'product.modelName',
      'product.description',
      'product.manufacturer',
      'product.serialNumber',
      'product.sku',
    ];

    return await this.paginationService.paginate(
      queryBuilder,
      queryDto,
      searchColumns,
    );
  }

  /**
   * Find a single product by ID
   * @param id Product ID
   * @returns Product
   */
  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!product) {
      throw new AppException(
        'Product not found',
        ErrorCodes.PRODUCT_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        { id },
      );
    }

    return product;
  }

  /**
   * Find a published product by ID (public endpoint)
   * @param id Product ID
   * @returns Published product
   */
  async findPublishedOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: {
        id,
        status: PublishStatus.PUBLISHED,
        isActive: true,
      },
      relations: ['user'],
    });

    if (!product) {
      throw new AppException(
        'Product not found or not available',
        ErrorCodes.PRODUCT_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        { id },
      );
    }

    return product;
  }

  /**
   * Update a product
   * @param id Product ID
   * @param updateProductDto Update data
   * @param userId User updating the product
   * @returns Updated product
   */
  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    userId: string,
  ): Promise<Product> {
    const product = await this.findOne(id);

    // Check if user owns the product
    if (product.userId !== userId) {
      throw new AppException(
        'You do not have permission to update this product',
        ErrorCodes.INSUFFICIENT_PERMISSIONS,
        HttpStatus.FORBIDDEN,
        { productId: id, userId },
      );
    }

    // Check if serial number is being updated and if it already exists
    if (
      updateProductDto.serialNumber &&
      updateProductDto.serialNumber !== product.serialNumber
    ) {
      const existingProduct = await this.productRepository.findOne({
        where: { serialNumber: updateProductDto.serialNumber },
      });

      if (existingProduct) {
        throw new AppException(
          'Product with this serial number already exists',
          ErrorCodes.PRODUCT_ALREADY_EXISTS,
          HttpStatus.CONFLICT,
          { serialNumber: updateProductDto.serialNumber },
        );
      }
    }

    // Validate auction dates if updating to bid auction
    if (updateProductDto.auctionType === 'Bid') {
      const startDate =
        updateProductDto.auctionStartDate || product.auctionStartDate;
      const endDate = updateProductDto.auctionEndDate || product.auctionEndDate;

      if (!startDate || !endDate) {
        throw new AppException(
          'Auction start and end dates are required for bid auctions',
          ErrorCodes.INVALID_AUCTION_DATES,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (startDate >= endDate) {
        throw new AppException(
          'Auction end date must be after start date',
          ErrorCodes.INVALID_AUCTION_DATES,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // Update the product
    const updatedProduct = { ...product, ...updateProductDto };
    return await this.productRepository.save(updatedProduct);
  }

  /**
   * Delete a product
   * @param id Product ID
   * @param userId User deleting the product
   */
  async remove(id: number, userId: string): Promise<void> {
    const product = await this.findOne(id);

    // Check if user owns the product
    if (product.userId !== userId) {
      throw new AppException(
        'You do not have permission to delete this product',
        ErrorCodes.INSUFFICIENT_PERMISSIONS,
        HttpStatus.FORBIDDEN,
        { productId: id, userId },
      );
    }

    await this.productRepository.remove(product);
  }

  /**
   * Upload product image
   * @param productId Product ID
   * @param file Image file
   * @param userId User uploading the image
   * @returns Updated product with image URL
   */
  async uploadImage(
    productId: number,
    file: Express.Multer.File,
    userId: string,
  ): Promise<Product> {
    const product = await this.findOne(productId);

    // Check if user owns the product
    if (product.userId !== userId) {
      throw new AppException(
        'You do not have permission to update this product',
        ErrorCodes.INSUFFICIENT_PERMISSIONS,
        HttpStatus.FORBIDDEN,
        { productId, userId },
      );
    }

    if (!file) {
      throw new AppException(
        'No file provided',
        ErrorCodes.FILE_NOT_PROVIDED,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Upload to cloud storage
    const result = await this.imageService.uploadImage(file, {
      location: StorageLocation.CLOUDINARY,
      folder: `products/${productId}`,
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    });

    // Update product with image URL
    product.imageUrl = result.url;
    return await this.productRepository.save(product);
  }

  /**
   * Update product quantity after purchase
   * @param productId The product ID
   * @param quantityPurchased The quantity that was purchased
   * @returns The updated product
   */
  async updateProductQuantityAfterPurchase(
    productId: number,
    quantityPurchased: number
  ): Promise<Product> {
    const product = await this.findOne(productId);

    // Only update quantity for limited stock products
    if (product.stockType === 'limited') {
      if (product.quantity < quantityPurchased) {
        throw new AppException(
          `Insufficient stock for product`,
          ErrorCodes.INSUFFICIENT_STOCK,
          HttpStatus.BAD_REQUEST,
          { productId, requested: quantityPurchased, available: product.quantity }
        );
      }

      // Reduce available quantity
      product.quantity -= quantityPurchased;

      // If stock reaches 0, update availability status
      if (product.quantity === 0) {
        product.availability = 'Out of Stock';
      }

      return await this.productRepository.save(product);
    }

    return product;
  }

  /**
   * Get product statistics
   * @param userId Optional user ID to filter by user
   * @returns Product statistics
   */
  async getStatistics(userId?: number) {
    const baseQuery = this.productRepository.createQueryBuilder('product');

    if (userId) {
      baseQuery.where('product.user.id = :userId', { userId });
    }

    const [
      total,
      published,
      draft,
      online,
      offline,
      inStock,
      outOfStock,
      marketplace,
      retail,
    ] = await Promise.all([
      baseQuery.getCount(),
      baseQuery
        .clone()
        .where('product.status = :status', { status: PublishStatus.PUBLISHED })
        .getCount(),
      baseQuery
        .clone()
        .where('product.status = :status', { status: PublishStatus.DRAFT })
        .getCount(),
      baseQuery
        .clone()
        .where('product.productStatus = :status', {
          status: ProductStatus.ONLINE,
        })
        .getCount(),
      baseQuery
        .clone()
        .where('product.productStatus = :status', {
          status: ProductStatus.OFFLINE,
        })
        .getCount(),
      baseQuery
        .clone()
        .where('product.availability = :availability', {
          availability: AvailabilityStatus.IN_STOCK,
        })
        .getCount(),
      baseQuery
        .clone()
        .where('product.availability = :availability', {
          availability: AvailabilityStatus.OUT_OF_STOCK,
        })
        .getCount(),
      baseQuery
        .clone()
        .where('product.type = :type', { type: 'marketplace' })
        .getCount(),
      baseQuery
        .clone()
        .where('product.type = :type', { type: 'retail' })
        .getCount(),
    ]);

    return {
      total,
      byStatus: {
        published,
        draft,
      },
      byProductStatus: {
        online,
        offline,
      },
      byAvailability: {
        inStock,
        outOfStock,
      },
      byType: {
        marketplace,
        retail,
      },
    };
  }

  /**
   * Apply filters to query builder
   * @param queryBuilder TypeORM query builder
   * @param queryDto Query parameters
   */
  private applyFilters(
    queryBuilder: SelectQueryBuilder<Product>,
    queryDto: ProductQueryDto,
  ): void {
    const {
      type,
      cooling,
      manufacturer,
      productStatus,
      status,
      availability,
      auctionType,
      stockType,
      minPrice,
      maxPrice,
      minHashRate,
      maxHashRate,
      minPower,
      maxPower,
      isActive,
      hosting,
      userId,
    } = queryDto;

    if (type) {
      queryBuilder.andWhere('product.type = :type', { type });
    }

    if (cooling) {
      queryBuilder.andWhere('product.cooling = :cooling', { cooling });
    }

    if (manufacturer) {
      queryBuilder.andWhere(
        'LOWER(product.manufacturer) LIKE LOWER(:manufacturer)',
        {
          manufacturer: `%${manufacturer}%`,
        },
      );
    }

    if (productStatus) {
      queryBuilder.andWhere('product.productStatus = :productStatus', {
        productStatus,
      });
    }

    if (status) {
      queryBuilder.andWhere('product.status = :status', { status });
    }

    if (availability) {
      queryBuilder.andWhere('product.availability = :availability', {
        availability,
      });
    }

    if (auctionType) {
      queryBuilder.andWhere('product.auctionType = :auctionType', {
        auctionType,
      });
    }

    if (stockType) {
      queryBuilder.andWhere('product.stockType = :stockType', { stockType });
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.askPrice >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.askPrice <= :maxPrice', { maxPrice });
    }

    if (minHashRate !== undefined) {
      queryBuilder.andWhere('product.hashRate >= :minHashRate', {
        minHashRate,
      });
    }

    if (maxHashRate !== undefined) {
      queryBuilder.andWhere('product.hashRate <= :maxHashRate', {
        maxHashRate,
      });
    }

    if (minPower !== undefined) {
      queryBuilder.andWhere('product.power >= :minPower', { minPower });
    }

    if (maxPower !== undefined) {
      queryBuilder.andWhere('product.power <= :maxPower', { maxPower });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('product.isActive = :isActive', { isActive });
    }

    if (hosting !== undefined) {
      queryBuilder.andWhere('product.hosting = :hosting', { hosting });
    }

    if (userId) {
      queryBuilder.andWhere('product.userId = :userId', { userId });
    }
  }
}
