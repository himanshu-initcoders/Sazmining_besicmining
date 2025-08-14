import { 
  IsOptional, 
  IsString, 
  IsNumber, 
  IsBoolean, 
  IsUrl,
  IsEnum 
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ProductType,
  CoolingType,
  ProductStatus,
  PublishStatus,
  AvailabilityStatus,
  StockType,
} from '../../entities/product.entity';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsString()
  modelName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  hashRate?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  power?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  efficiency?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  dailyMiningCost?: number;

  @IsOptional()
  @IsBoolean()
  disableBuyNow?: boolean;

  @IsOptional()
  @IsEnum(ProductType)
  type?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(CoolingType)
  cooling?: string;

  @IsOptional()
  @IsString()
  manufacturer?: string;

  @IsOptional()
  @IsEnum(ProductStatus)
  productStatus?: string;

  @IsOptional()
  @IsEnum(PublishStatus)
  status?: string;

  @IsOptional()
  @IsEnum(AvailabilityStatus)
  availability?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  askPrice?: number;

  @IsOptional()
  @IsString()
  contractId?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  shippingPrice?: number;

  @IsOptional()
  @IsBoolean()
  hosting?: boolean;

  @IsOptional()
  @IsEnum(StockType)
  stockType?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  quantity?: number;
}