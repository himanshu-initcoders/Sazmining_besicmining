import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaginatedResponse } from '../dto/pagination.dto';

@Injectable()
export class PaginationInterceptor<T> implements NestInterceptor<T, PaginatedResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<PaginatedResponse<T>> {
    return next.handle().pipe(
      map(response => {
        if (!response?.data || !response?.meta) {
          return response;
        }

        return {
          data: response.data,
          meta: {
            total: response.meta.total,
            page: response.meta.page,
            lastPage: Math.ceil(response.meta.total / response.meta.limit),
            limit: response.meta.limit,
          },
        };
      }),
    );
  }
} 