/** A WhatsApp chat link with the shop, optionally prefilled; null while no number is set. */
export function whatsappHref(message?: string) {
  // wa.me needs the international form: a local 03… number would open the wrong chat.
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "").replace(
    /^(00261|0)/,
    "261",
  );
  if (!number) return null;
  return `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}
