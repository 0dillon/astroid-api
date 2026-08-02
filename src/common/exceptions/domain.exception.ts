import { HttpException } from '@nestjs/common';
import { ERROR_STATUS, ErrorCode } from '../constants/error-codes';

/**
 * Base class for every domain-level failure. Carries a machine-readable
 * `ErrorCode` that the global exception filter serialises into the standard
 * error envelope. Prefer these over raw NestJS HTTP exceptions in services.
 */
export class DomainException extends HttpException {
  public readonly code: ErrorCode;
  public readonly details?: unknown;

  constructor(code: ErrorCode, message: string, details?: unknown) {
    super(message, ERROR_STATUS[code] ?? 500);
    this.code = code;
    this.details = details;
  }
}

export class NotFoundException extends DomainException {
  constructor(entity: string, id?: string) {
    super(ErrorCode.NOT_FOUND, id ? `${entity} '${id}' not found` : `${entity} not found`);
  }
}

export class ValidationException extends DomainException {
  constructor(message: string, details?: unknown) {
    super(ErrorCode.VALIDATION_ERROR, message, details);
  }
}

export class ConflictException extends DomainException {
  constructor(message: string) {
    super(ErrorCode.CONFLICT, message);
  }
}

export class UnauthorizedException extends DomainException {
  constructor(message = 'Authentication required', code: ErrorCode = ErrorCode.UNAUTHORIZED) {
    super(code, message);
  }
}

export class ForbiddenException extends DomainException {
  constructor(message = 'Insufficient permissions') {
    super(ErrorCode.FORBIDDEN, message);
  }
}

export class PolicyViolationException extends DomainException {
  constructor(message: string, details?: unknown) {
    super(ErrorCode.POLICY_VIOLATION, message, details);
  }
}

export class BudgetExceededException extends DomainException {
  constructor(message: string, details?: unknown) {
    super(ErrorCode.BUDGET_EXCEEDED, message, details);
  }
}

export class RiskTooHighException extends DomainException {
  constructor(message: string, details?: unknown) {
    super(ErrorCode.RISK_TOO_HIGH, message, details);
  }
}
