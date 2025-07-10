import { IsNotEmpty, IsNumber, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateContractDto {
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsNotEmpty()
  @IsNumber()
  depositPrice: number;

  @IsOptional()
  @IsNumber()
  setupPrice?: number;

  @IsNotEmpty()
  @IsNumber()
  hostRate: number;

  @IsNotEmpty()
  @IsNumber()
  salesTaxPercent: number;
  
  @IsOptional()
  @IsBoolean()
  autoMaintenance?: boolean;
} 