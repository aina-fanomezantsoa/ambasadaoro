import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "@/lib/env";
import * as schema from "./schema";

const create = () => drizzle(env("DATABASE_URL"), { schema });
const store = globalThis as unknown as { db?: ReturnType<typeof create> };

// Lazy so the build works without a database; one pool survives dev reloads.
export const db = () => (store.db ??= create());
