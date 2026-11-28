import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { beforeAll, expect, it } from "vitest";
import { HOME_TITLE, homeText, saveHomeText } from "../src/db/settings";

const db = drizzle(new PGlite());

// Starting PGlite can pass the default 10 s when all test files run at once.
beforeAll(() => migrate(db, { migrationsFolder: "drizzle" }), 30_000);

it("F19: default title until the admin chooses one, and again when emptied", async () => {
  expect(await homeText(db)).toEqual({ title: HOME_TITLE, bio: "" });
  await saveHomeText(db, { title: "Boutique", bio: "Bonjour" });
  expect(await homeText(db)).toEqual({ title: "Boutique", bio: "Bonjour" });
  await saveHomeText(db, { title: "", bio: "" });
  expect(await homeText(db)).toEqual({ title: HOME_TITLE, bio: "" });
});
