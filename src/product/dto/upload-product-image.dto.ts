import { IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class UploadProductImageDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  productId: number;
} 