import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // Check if data has pagination info
        const response: ApiResponse<T> = {
          success: true,
          timestamp: new Date().toISOString(),
        };
        
        // Handle paginated responses
        if (data && typeof data === 'object' && 'data' in data && 'meta' in data) {
          response.data = data.data;
          response.meta = data.meta;
        } else {
          response.data = data;
        }
        
        return response;
      }),
    );
  }
}
