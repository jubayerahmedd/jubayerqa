import {defineConfig} from 'prisma/config';

// Used only by the Prisma CLI (generate, migrate) — never imported at
// runtime. The Worker itself builds its own adapter per request from
// `env.DATABASE_URL` (see src/lib/db.ts), per site-database.md.
//
// Plain `process.env` access (not the `env()` helper, which throws if the
// variable is unset): the platform's Build step runs `prisma generate` with
// no database available at all, so DATABASE_URL/SHADOW_DATABASE_URL are only
// present when `migrate`/`studio` actually need them, at which point Migrate
// (a separate Deployment step) provides a real one. `generate` never reads
// `datasource` in the first place, so an empty string here is harmless.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL ?? '',
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL ?? '',
  },
});
