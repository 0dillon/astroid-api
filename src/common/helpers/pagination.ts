import { z } from 'zod';
import { PaginationMeta } from '../interfaces/api-response.interface';

/** Standard query parameters supported by every list endpoint. */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  filter: z.string().optional(),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export interface PrismaPagination {
  skip: number;
  take: number;
  orderBy: Record<string, 'asc' | 'desc'>;
}

/** Translates validated pagination query params into Prisma arguments. */
export function toPrismaPagination(query: PaginationQuery, allowedSortFields: string[]): PrismaPagination {
  const sort = allowedSortFields.includes(query.sort) ? query.sort : 'createdAt';
  return {
    skip: (query.page - 1) * query.limit,
    take: query.limit,
    orderBy: { [sort]: query.order },
  };
}

/** Builds pagination metadata for the response envelope. */
export function buildPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
