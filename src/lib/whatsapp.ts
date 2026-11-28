/** A WhatsApp chat link with the shop, optionally prefilled; null while no number is set. */
export function whatsappHref(message?: string) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "");
  if (!number) return null;
  return `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}
