import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
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
      const httpException = exception as HttpException;
      status = httpException.getStatus();
      const response = httpException.getResponse();

      if (typeof response === 'object' && response.hasOwnProperty('error')) {
        errorResponse = response as ApiResponse<null>;
      } else {
        errorResponse.error = {
          code: `HTTP_${status}`,
          message: httpException.message,
        };
      }
    } else if (exception instanceof Error) {
      errorResponse.error = {
        code: 'INTERNAL_SERVER_ERROR',
        message: exception.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? exception.stack : undefined,
      };
    }

    response.status(status).json(errorResponse);
  }
} 