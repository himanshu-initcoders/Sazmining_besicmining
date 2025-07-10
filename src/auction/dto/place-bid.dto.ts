import { IsNotEmpty, IsNumber } from 'class-validator';

export class PlaceBidDto {
  @IsNotEmpty()
  @IsNumber()
  auctionId: number;

  @IsNotEmpty()
  @IsNumber()
  bidPrice: number;
} 