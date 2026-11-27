import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Ambasadaoro", template: "%s · Ambasadaoro" },
  description: "Comptes Clash of Clans à vendre à Madagascar, paiement Mobile Money.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <header className="border-b border-white/10 bg-surface p-4">
          <Link href="/" className="text-xl font-bold text-gold">
            Ambasadaoro
          </Link>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 p-4">{children}</main>
        <footer className="p-4 text-center text-sm text-muted">
          Ambasadaoro n&apos;est ni affilié à Supercell ni approuvé par Supercell.
        </footer>
      </body>
    </html>
  );
}
