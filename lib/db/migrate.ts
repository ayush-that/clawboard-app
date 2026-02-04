import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

config({ path: ".env.local" });
config({ path: ".env" });

const runMigrate = async () => {
  if (!process.env.POSTGRES_URL) {
    process.exit(0);
  }

  const connection = postgres(process.env.POSTGRES_URL, { max: 1 });
  const db = drizzle(connection);

  await migrate(db, { migrationsFolder: "./lib/db/migrations" });
  process.exit(0);
};

runMigrate().catch(() => {
  process.exit(1);
});
