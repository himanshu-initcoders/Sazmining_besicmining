import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsUrl,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {
  ProductType,
  CoolingType,
  ProductStatus,
  PublishStatus,
  AvailabilityStatus,
  StockType,
} from '../../entities/product.entity';

export class CreateProductDto {
  @IsOptional()
  @IsString()
  sku?: string;

  @IsString()
  @IsNotEmpty()
  serialNumber: string;

  @IsString()
  @IsNotEmpty()
  modelName: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean = true;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  hashRate: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  power: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  efficiency: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  disableBuyNow?: boolean = false;

  @IsOptional()
  @IsEnum(ProductType)
  type?: ProductType = ProductType.MARKETPLACE;

  @IsOptional()
  @IsEnum(CoolingType)
  cooling?: CoolingType = CoolingType.AIR;

  @IsString()
  @IsNotEmpty()
  manufacturer: string;

  @IsOptional()
  @IsEnum(ProductStatus)
  productStatus?: ProductStatus = ProductStatus.ONLINE;

  @IsOptional()
  @IsEnum(PublishStatus)
  status?: PublishStatus = PublishStatus.DRAFT;

  @IsOptional()
  @IsEnum(AvailabilityStatus)
  availability?: AvailabilityStatus = AvailabilityStatus.IN_STOCK;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  askPrice: number;

  @IsOptional()
  @IsString()
  contractId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  shippingPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  dailyMiningCost?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  hosting?: boolean = false;

  @IsOptional()
  @IsEnum(StockType)
  stockType?: StockType = StockType.LIMITED;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quantity?: number = 0;
}
