import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Ambasadaoro", template: "%s · Ambasadaoro" },
  description: "Comptes Clash of Clans à vendre à Madagascar, paiement Mobile Money.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="flex min-h-full flex-col text-sm">{children}</body>
    </html>
  );
}
