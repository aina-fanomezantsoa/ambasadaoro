import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { expect, it } from "vitest";
import { allowAttempt } from "../src/db/rate-limit";

it("F13: login attempts are limited per key, until the window ends", async () => {
  const client = new PGlite();
  const db = drizzle(client);
  await migrate(db, { migrationsFolder: "drizzle" });

  const tries = [];
  for (let i = 0; i < 6; i++) tries.push(await allowAttempt(db, "a", 5, 15));
  expect(tries).toEqual([true, true, true, true, true, false]);
  expect(await allowAttempt(db, "b", 5, 15)).toBe(true);

  await client.query("update rate_limits set window_start = now() - interval '16 minutes'");
  expect(await allowAttempt(db, "a", 5, 15)).toBe(true);
  await client.close();
}, 30_000);
