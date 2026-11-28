import "server-only";
import { env } from "./env";

/** F17: e-mail to the admin through Resend. */
export async function alertAdmin(subject: string, text: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env("RESEND_API_KEY")}`,
      "content-type": "application/json",
    },
    // shortcut: Resend's shared sender only reaches the Resend account's own address,
    // so ADMIN_EMAIL must be that address; verify a domain to change it.
    body: JSON.stringify({
      from: "Ambasadaoro <onboarding@resend.dev>",
      to: env("ADMIN_EMAIL"),
      subject,
      text,
    }),
  });
  if (!response.ok) throw new Error(`Resend : ${response.status} ${await response.text()}`);
}
