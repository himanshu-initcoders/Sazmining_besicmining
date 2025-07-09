import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor';

@Controller('products')
@UseInterceptors(ClassSerializerInterceptor, TransformInterceptor)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // PUBLIC ENDPOINTS (No authentication required)

  /**
   * Get all published products (public endpoint)
   * GET /products/public
   */
  @Get('public')
  async findPublishedProducts(@Query() queryDto: ProductQueryDto) {
    return this.productService.findPublished(queryDto);
  }

  /**
   * Get a single published product by ID (public endpoint)
   * GET /products/public/:id
   */
  @Get('public/:id')
  async findPublishedProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findPublishedOne(id);
  }

  /**
   * Get product statistics (public endpoint)
   * GET /products/public/statistics
   */
  @Get('public/statistics')
  async getPublicStatistics() {
    return this.productService.getStatistics();
  }

  // PROTECTED ENDPOINTS (Authentication required)

  /**
   * Create a new product
   * POST /products
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createProductDto: CreateProductDto, @Request() req) {
    return this.productService.create(createProductDto, req.user.id);
  }

  /**
   * Get all products (admin only) or user's products
   * GET /products
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Query() queryDto: ProductQueryDto, @Request() req) {
    // If user is admin, show all products, otherwise show only user's products
    if (req.user.role === UserRole.ADMIN) {
      return this.productService.findAll(queryDto);
    } else {
      return this.productService.findByUser(req.user.id, queryDto);
    }
  }

  /**
   * Get current user's products
   * GET /products/my
   */
  @Get('my')
  @UseGuards(JwtAuthGuard)
  async findMyProducts(@Query() queryDto: ProductQueryDto, @Request() req) {
    return this.productService.findByUser(req.user.id, queryDto);
  }

  /**
   * Get products by user ID (admin only)
   * GET /products/user/:userId
   */
  @Get('user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findProductsByUser(
    @Param('userId') userId: string,
    @Query() queryDto: ProductQueryDto,
  ) {
    return this.productService.findByUser(userId, queryDto);
  }

  /**
   * Get product statistics for current user
   * GET /products/my/statistics
   */
  @Get('my/statistics')
  @UseGuards(JwtAuthGuard)
  async getMyStatistics(@Request() req) {
    return this.productService.getStatistics(req.user.id);
  }

  /**
   * Get product statistics for specific user (admin only)
   * GET /products/user/:userId/statistics
   */
  @Get('user/:userId/statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getUserStatistics(@Param('userId') userId: number) {
    return this.productService.getStatistics(userId);
  }

  /**
   * Get all product statistics (admin only)
   * GET /products/statistics
   */
  @Get('statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllStatistics() {
    return this.productService.getStatistics();
  }

  /**
   * Get a single product by ID
   * GET /products/:id
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const product = await this.productService.findOne(id);

    // Users can only see their own products (unless admin)
    if (req.user.role !== UserRole.ADMIN && product.userId !== req.user.id) {
      return this.productService.findPublishedOne(id);
    }

    return product;
  }

  /**
   * Update a product
   * PATCH /products/:id
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req,
  ) {
    return this.productService.update(id, updateProductDto, req.user.id);
  }

  /**
   * Delete a product
   * DELETE /products/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    await this.productService.remove(id, req.user.id);
    return { message: 'Product deleted successfully' };
  }

  /**
   * Upload product image
   * POST /products/:id/image
   */
  @Post(':id/image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    return this.productService.uploadImage(id, file, req.user.id);
  }
}
