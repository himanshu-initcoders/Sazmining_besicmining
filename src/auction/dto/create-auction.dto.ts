import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAuctionDto {
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @IsNotEmpty()
  @IsNumber()
  productPrice: number;

  @IsOptional()
  @IsString()
  auctionStatus?: string;
  
  @IsOptional()
  @IsString()
  contractId?: string;
} 