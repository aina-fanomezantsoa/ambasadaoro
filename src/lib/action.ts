import { unstable_rethrow } from "next/navigation";
import { z } from "zod";

export type Result<T> = { ok: true; data: T } | { ok: false; error: string };

/** An error whose message is safe to show to the user. */
export class UserError extends Error {}

/** Every Server Action goes through here: validation, then one error shape. */
export function action<S extends z.ZodType, T>(schema: S, run: (input: z.output<S>) => Promise<T>) {
  return async (input: unknown): Promise<Result<T>> => {
    const parsed = schema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Champs invalides." };
    try {
      return { ok: true, data: await run(parsed.data) };
    } catch (error) {
      unstable_rethrow(error); // redirect() works by throwing
      if (error instanceof UserError) return { ok: false, error: error.message };
      console.error(error);
      return { ok: false, error: "Une erreur est survenue. Réessayez." };
    }
  };
}
