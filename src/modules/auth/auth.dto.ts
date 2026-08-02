import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const registerSchema = z.object({
  organizationName: z.string().min(2).max(120),
  name: z.string().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(200),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});
export type RefreshInput = z.infer<typeof refreshSchema>;

// ── Swagger DTOs (documentation only; validation is done by Zod pipes) ──

export class RegisterDto {
  @ApiProperty({ example: 'Acme Robotics' })
  organizationName!: string;

  @ApiProperty({ example: 'Ada Lovelace' })
  name!: string;

  @ApiProperty({ example: 'ada@acme.com' })
  email!: string;

  @ApiProperty({ example: 'a-strong-passphrase', minLength: 8 })
  password!: string;
}

export class LoginDto {
  @ApiProperty({ example: 'ada@acme.com' })
  email!: string;

  @ApiProperty({ example: 'a-strong-passphrase' })
  password!: string;
}

export class RefreshDto {
  @ApiProperty()
  refreshToken!: string;
}

export class TokenPairDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  refreshToken!: string;

  @ApiProperty({ example: 900, description: 'Access-token lifetime in seconds' })
  expiresIn!: number;

  @ApiPropertyOptional()
  tokenType?: string;
}
