import { SetMetadata } from '@nestjs/common';

export enum UserRole {
  HIRING_MANAGER = 'HIRING_MANAGER',
  RECRUITER = 'RECRUITER',
  HRBP = 'HRBP',
  FINANCE_APPROVER = 'FINANCE_APPROVER',
  DEPT_HEAD = 'DEPT_HEAD',
  EXECUTIVE = 'EXECUTIVE',
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
  AUDITOR = 'AUDITOR',
}

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify which roles can access an endpoint
 *
 * @example
 * @Roles(UserRole.SYSTEM_ADMIN, UserRole.HRBP)
 * @Get('admin/settings')
 * getAdminSettings() {
 *   return this.settingsService.getAll();
 * }
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
