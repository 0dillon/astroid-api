import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { ZodType } from 'zod';
import { ValidationException } from '../exceptions/domain.exception';

/**
 * A pipe that validates and parses an incoming payload against a Zod schema.
 * Instantiated per-schema, e.g. `@Body(new ZodValidationPipe(createAgentSchema))`.
 * Rejects unknown/invalid data with a structured VALIDATION_ERROR.
 */
@Injectable()
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown, _metadata: ArgumentMetadata): T {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      throw new ValidationException('Request validation failed', details);
    }
    return result.data;
  }
}
