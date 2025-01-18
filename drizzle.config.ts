
import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config();

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error("DATABASE_URL is required");
}

export default defineConfig({
  out: "./migrations",
  schema: "./db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    connectionString: dbUrl,
  },
});
