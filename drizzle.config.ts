import { defineConfig } from "drizzle-kit";

if (!"postgres://brookejoseph@localhost:5432/brooke") {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgres://brookejoseph@localhost:5432/brooke",
  },
});
