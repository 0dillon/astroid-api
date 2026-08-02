import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'astroid:isPublic';

/** Marks a route as publicly accessible, bypassing the global JWT auth guard. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
