import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCodes } from './error-codes';

export class AppException extends HttpException {
  constructor(
    message: string,
    errorCode: ErrorCodes | string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    details?: any,
  ) {
    super(
      {
        success: false,
        error: {
          code: errorCode,
          message,
          details,
        },
        timestamp: new Date().toISOString(),
      },
      statusCode,
    );
  }
} 