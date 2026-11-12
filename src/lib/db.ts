/**
 * The Site Database (Prisma Postgres), server-only.
 *
 * A new client per request, per site-database.md: the Worker has no
 * persistent process to hold a connection pool across requests, so there is
 * nothing to gain from a module-level singleton and real cost to getting it
 * wrong across concurrent requests.
 */
import {PrismaPostgresAdapter} from '@prisma/adapter-ppg';

import {PrismaClient} from '../generated/prisma/client';

export function getDb(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // Mirrors site-database.md: an empty DATABASE_URL means the Site
    // Database isn't enabled for this community yet.
    throw new Error(
      'DATABASE_URL is not set. Ask the owner to enable the Site Database (Custom code page, beside Open Editor), then reopen the editor.'
    );
  }
  const adapter = new PrismaPostgresAdapter({connectionString});
  return new PrismaClient({adapter});
}
