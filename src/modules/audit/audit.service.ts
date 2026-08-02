import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuditRepository, CreateAuditLogData } from './audit.repository';
import {
  buildPaginationMeta,
  PaginationQuery,
  toPrismaPagination,
} from '../../common/helpers/pagination';
import { Paginated } from '../../common/interfaces/api-response.interface';

const SORTABLE = ['createdAt', 'action', 'entity'];

/**
 * Writes and queries the immutable audit trail. Records Who / When / Where /
 * Why / Old / New for every important action. Never updates or deletes.
 */
@Injectable()
export class AuditService {
  constructor(private readonly repository: AuditRepository) {}

  record(data: CreateAuditLogData) {
    return this.repository.create(data);
  }

  async list(organizationId: string, query: PaginationQuery) {
    const where: Prisma.AuditLogWhereInput = { organizationId };
    if (query.search) {
      where.OR = [
        { action: { contains: query.search, mode: 'insensitive' } },
        { entity: { contains: query.search, mode: 'insensitive' } },
        { entityId: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.filter) {
      where.entity = query.filter;
    }
    const pagination = toPrismaPagination(query, SORTABLE);
    const { items, total } = await this.repository.findManyAndCount(where, pagination);
    return new Paginated(items, buildPaginationMeta(total, query.page, query.limit));
  }

  findById(organizationId: string, id: string) {
    return this.repository.findById(organizationId, id);
  }
}
