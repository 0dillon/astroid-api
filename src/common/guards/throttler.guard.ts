import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

/**
 * Rate-limit guard that scopes the counter to the authenticated organization
 * (falling back to the client IP for anonymous auth endpoints). Auth routes
 * override the default tier to 10/min via `@Throttle`; the API default is
 * 120/min, configured on the ThrottlerModule.
 */
@Injectable()
export class AstroidThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, unknown>): Promise<string> {
    const request = req as unknown as Request & { user?: AuthenticatedUser };
    const org = request.user?.organizationId;
    if (org) {
      return `org:${org}`;
    }
    const forwarded = request.headers?.['x-forwarded-for'];
    const ip =
      (Array.isArray(forwarded) ? forwarded[0] : forwarded) ??
      request.ip ??
      request.socket?.remoteAddress ??
      'anonymous';
    return `ip:${ip}`;
  }
}
