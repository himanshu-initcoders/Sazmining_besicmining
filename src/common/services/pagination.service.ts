import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import { PaginationDto } from '../dto/pagination.dto';
import { PaginatedResponse } from '../interfaces/pagination.interface';

@Injectable()
export class PaginationService {
  async paginate<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T> | Repository<T>,
    paginationDto: PaginationDto,
    searchColumns?: string[],
  ): Promise<PaginatedResponse<T>> {
    const { page = 1, limit = 10, search, sortBy, order } = paginationDto;

    // Convert Repository to QueryBuilder if needed
    let finalQueryBuilder: SelectQueryBuilder<T>;
    if (queryBuilder instanceof Repository) {
      finalQueryBuilder = queryBuilder.createQueryBuilder();
    } else {
      finalQueryBuilder = queryBuilder;
    }

    // Apply search if provided and searchColumns are specified
    if (search && searchColumns?.length) {
      finalQueryBuilder.andWhere(
        new Array(searchColumns.length)
          .fill('LOWER($1) LIKE LOWER(:search)')
          .map((condition, index) =>
            condition.replace('$1', searchColumns[index]),
          )
          .join(' OR '),
        { search: `%${search}%` },
      );
    }

    // Apply sorting if provided
    if (sortBy) {
      const alias = finalQueryBuilder.alias;
      finalQueryBuilder.orderBy(`${alias}.${sortBy}`, order);
    }

    // Get total count before pagination
    const total = await finalQueryBuilder.getCount();

    // Apply pagination
    const items = await finalQueryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
