import { UserRole } from '@prisma/client';

/** The authenticated principal attached to each request by the JWT strategy. */
export interface AuthenticatedUser {
  id: string;
  organizationId: string;
  email: string;
  role: UserRole;
  sessionId?: string;
}

/** Shape of the JWT access-token payload. */
export interface JwtAccessPayload {
  sub: string;
  organizationId: string;
  email: string;
  role: UserRole;
  sessionId?: string;
}

/** Shape of the JWT refresh-token payload. */
export interface JwtRefreshPayload {
  sub: string;
  sessionId: string;
}
