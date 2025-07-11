import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
} from '@nestjs/common';
import { AppException } from '../exceptions/app.exception';
import { ErrorCodes } from '../exceptions/error-codes';

@Injectable()
export class CustomParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const paramName = metadata.data || 'parameter';
    
    if (!value) {
      throw new AppException(
        `${paramName} is required`,
        ErrorCodes.INVALID_PARAMETER,
        400,
        { parameter: paramName, value }
      );
    }

    const parsed = parseInt(value, 10);
    
    if (isNaN(parsed)) {
      throw new AppException(
        `Invalid ${paramName}. Expected a valid number.`,
        ErrorCodes.INVALID_PARAMETER,
        400,
        { parameter: paramName, value, expected: 'number' }
      );
    }

    if (parsed <= 0) {
      throw new AppException(
        `Invalid ${paramName}. Expected a positive number.`,
        ErrorCodes.INVALID_PARAMETER,
        400,
        { parameter: paramName, value, expected: 'positive number' }
      );
    }

    return parsed;
  }
} 