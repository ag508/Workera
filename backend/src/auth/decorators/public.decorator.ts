import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator to mark endpoints as public (no authentication required)
 * Use this on controllers or handler methods that should be accessible without a JWT token
 *
 * @example
 * @Public()
 * @Get('health')
 * healthCheck() {
 *   return { status: 'ok' };
 * }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
