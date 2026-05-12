import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Pakai DIRECT_URL untuk migration (bypass pgbouncer)
    url: process.env.DIRECT_URL || process.env.DATABASE_URL!,
  },
});
