import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  ValidationPipe as NestValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { AppException } from '../exceptions/app.exception';
import { ErrorCodes } from '../exceptions/error-codes';

@Injectable()
export class CustomValidationPipe extends NestValidationPipe {
  constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const formattedErrors = errors.map((error) => {
          const constraints = error.constraints
            ? Object.values(error.constraints)
            : [];
          
          return {
            field: error.property,
            messages: constraints,
            value: error.value,
          };
        });

        throw new AppException(
          'Validation failed',
          ErrorCodes.VALIDATION_ERROR,
          400,
          {
            violations: formattedErrors,
          }
        );
      },
    });
  }
} 