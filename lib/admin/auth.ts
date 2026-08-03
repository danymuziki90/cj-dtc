import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth-portal/guards';

/**
 * Verify the admin token in an API route.
 * Re-exports the requireAdmin guard from the auth-portal.
 * Returns an object with an `error` property if unauthorized, or an `admin` object if successful.
 */
export async function verifyAdminToken(request: NextRequest) {
  return requireAdmin(request);
}
