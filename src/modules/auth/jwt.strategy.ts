import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthConfig } from '../../config/auth.config';
import {
  AuthenticatedUser,
  JwtAccessPayload,
} from '../../common/interfaces/authenticated-user.interface';

/**
 * Validates the access-token JWT on protected routes and resolves the
 * {@link AuthenticatedUser} principal attached to the request. Signature and
 * expiry are checked by passport-jwt; this strategy maps claims to the
 * principal. Session revocation is enforced separately by the auth service on
 * refresh, keeping the hot-path stateless.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    const auth = config.getOrThrow<AuthConfig>('auth');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: auth.accessSecret,
    });
  }

  validate(payload: JwtAccessPayload): AuthenticatedUser {
    if (!payload?.sub || !payload.organizationId) {
      throw new UnauthorizedException('Malformed access token');
    }
    return {
      id: payload.sub,
      organizationId: payload.organizationId,
      email: payload.email,
      role: payload.role,
      sessionId: payload.sessionId,
    };
  }
}
