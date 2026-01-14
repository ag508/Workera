import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Default tenant ID that matches the seeder
const DEFAULT_TENANT_ID = '11111111-1111-1111-1111-111111111111';

export function getTenantId(): string {
  // Check localStorage for tenant ID (useful for multi-tenant scenarios)
  if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('tenantId');
      if (stored) return stored;
  }
  return DEFAULT_TENANT_ID;
}
