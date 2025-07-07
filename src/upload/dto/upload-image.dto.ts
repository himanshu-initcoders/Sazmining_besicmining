import { IsEnum, IsOptional, IsArray, IsNumber, IsString, Min } from 'class-validator';
import { StorageLocation } from '../services/image.service';
import { Transform } from 'class-transformer';

export class UploadImageDto {
  @IsEnum(StorageLocation)
  location: StorageLocation;

  @IsOptional()
  @IsString()
  folder?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  maxSize?: number;

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(type => type.trim());
    }
    return value;
  })
  allowedMimeTypes?: string[];
} 