import type { FastifyRequest } from 'fastify';

/**
 * Resolve tenant slug from request.
 *
 * DEV:
 *  - Uses X-Tenant-Slug header (Postman, localhost)
 *
 * PROD:
 *  - wilnan.yourapp.com      → wilnan
 *  - pos.wilnan.com          → wilnan
 *  - admin.wilnan.com        → wilnan
 */
export function resolveTenantSlug(req: FastifyRequest): string | null {
  // Development override
  if (process.env.NODE_ENV !== 'production') {
    const devSlug = req.headers['x-tenant-slug'];
    if (typeof devSlug === 'string' && devSlug.length > 0) {
      return devSlug;
    }
  }

  const host = req.headers.host;
  if (!host) return null;

  // Remove port (e.g. localhost:3000)
  const cleanHost = host.split(':')[0];
  const parts = cleanHost.split('.');

  // Expect at least subdomain.domain
  if (parts.length < 2) return null;

  // Always take second-to-last segment
  return parts[parts.length - 2];
}
