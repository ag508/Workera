import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTenantId(): string {
  // TODO: Replace with actual tenant retrieval from Auth Context or Token
  if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('tenantId');
      if (stored) return stored;
  }
  return "default-tenant-id";
}
