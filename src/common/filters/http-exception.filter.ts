import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '../interfaces/api-response.interface';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: ApiResponse<null> = {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
      },
      timestamp: new Date().toISOString(),
    };

    if (exception instanceof HttpException) {
      const httpException = exception;
      status = httpException.getStatus();
      const response = httpException.getResponse();

      // Handle our custom AppException format
      if (typeof response === 'object' && response.hasOwnProperty('error')) {
        errorResponse = response as ApiResponse<null>;
      } 
      // Handle validation errors from class-validator
      else if (exception instanceof BadRequestException && typeof response === 'object') {
        const validationResponse = response as any;
        
        if (validationResponse.message && Array.isArray(validationResponse.message)) {
          // Multiple validation errors
          errorResponse.error = {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: {
              violations: validationResponse.message,
            },
          };
        } else if (validationResponse.message) {
          // Single validation error
          errorResponse.error = {
            code: 'VALIDATION_ERROR',
            message: validationResponse.message,
          };
        } else {
          errorResponse.error = {
            code: 'BAD_REQUEST',
            message: httpException.message,
          };
        }
      }
      // Handle other HTTP exceptions
      else {
        errorResponse.error = {
          code: `HTTP_${status}`,
          message: httpException.message,
        };
      }
    } else if (exception instanceof Error) {
      errorResponse.error = {
        code: 'INTERNAL_SERVER_ERROR',
        message: exception.message || 'Internal server error',
        details:
          process.env.NODE_ENV === 'development' ? exception.stack : undefined,
      };
    }

    response.status(status).json(errorResponse);
  }
}
