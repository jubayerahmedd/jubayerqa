import {defineConfig, env} from 'prisma/config';

// Used only by the Prisma CLI (generate, migrate) — never imported at
// runtime. The Worker itself builds its own adapter per request from
// `env.DATABASE_URL` (see src/lib/db.ts), per site-database.md.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
    shadowDatabaseUrl: env('SHADOW_DATABASE_URL'),
  },
});
