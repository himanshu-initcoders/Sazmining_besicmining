import { IsNumber, IsNotEmpty } from 'class-validator';

export class GetSidebarDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;
} 