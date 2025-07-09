import { IsOptional, IsEnum, IsNumber, IsString, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ProductType, CoolingType, ProductStatus, PublishStatus, AvailabilityStatus, AuctionType, StockType } from '../../entities/product.entity';

export class ProductQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ProductType)
  type?: ProductType;

  @IsOptional()
  @IsEnum(CoolingType)
  cooling?: CoolingType;

  @IsOptional()
  @IsString()
  manufacturer?: string;

  @IsOptional()
  @IsEnum(ProductStatus)
  productStatus?: ProductStatus;

  @IsOptional()
  @IsEnum(PublishStatus)
  status?: PublishStatus;

  @IsOptional()
  @IsEnum(AvailabilityStatus)
  availability?: AvailabilityStatus;

  @IsOptional()
  @IsEnum(AuctionType)
  auctionType?: AuctionType;

  @IsOptional()
  @IsEnum(StockType)
  stockType?: StockType;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minHashRate?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxHashRate?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minPower?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxPower?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  hosting?: boolean;

  @IsOptional()
  @IsString()
  userId?: string;
} 