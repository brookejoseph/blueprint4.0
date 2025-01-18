import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@db/schema";
import { WebSocket } from "ws";


if (!"postgres://brookejoseph@localhost:5432/brooke") {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const db = drizzle({
  connection: "postgres://brookejoseph@localhost:5432/brooke",
  schema,
  webSocket: {
    constructor: WebSocket,
    connectionString: "postgres://brookejoseph@localhost:5432/brooke"
  }
});