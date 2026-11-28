import Link from "next/link";
import { whatsappHref } from "@/lib/whatsapp";
import { Chat, Shield } from "../icons";

const whatsapp = whatsappHref();

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-20 bg-header/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-6 px-4 lg:h-20">
          <Link href="/" className="flex min-h-11 items-center gap-2 text-xl font-bold lg:text-2xl">
            <Shield className="size-8 text-accent" />
            Ambasadaoro
          </Link>
          <nav
            aria-label="Principal"
            className="hidden gap-6 font-semibold md:flex [&>a]:flex [&>a]:min-h-11 [&>a]:items-center"
          >
            <Link href="/#comment-acheter">Comment acheter</Link>
            <Link href="/#faq">Questions fréquentes</Link>
            <Link href="/regles">Règles et garantie</Link>
          </nav>
          {whatsapp && (
            <a
              href={whatsapp}
              className="ml-auto flex min-h-11 items-center gap-2 rounded-3xl bg-accent px-5 font-medium text-on-accent"
            >
              <Chat className="size-4" />
              WhatsApp
            </a>
          )}
        </div>
        <div className="border-t border-white/5">
          <div className="mx-auto flex h-14 max-w-[1200px] items-center gap-6 px-4">
            <span className="flex items-center gap-2 font-semibold max-sm:sr-only">
              <Shield className="size-6 text-muted" />
              Clash of Clans
            </span>
            <Link
              href="/"
              className="flex h-full items-center border-b-2 border-accent px-2 font-medium md:mx-auto"
            >
              Comptes
            </Link>
            <Link href="/favoris" className="ml-auto flex min-h-11 items-center md:ml-0">
              Favoris
            </Link>
            <Link href="/suivi" className="flex min-h-11 items-center font-medium">
              Ma commande
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-16 border-t border-white/5 p-6 text-center text-xs text-muted">
        Ambasadaoro n&apos;est ni affilié à Supercell ni approuvé par Supercell.
        <Link href="/regles" className="mx-auto flex min-h-11 w-fit items-center underline">
          Règles, risques et garantie
        </Link>
      </footer>

      {whatsapp && (
        <a
          href={whatsapp}
          className="fixed right-3 bottom-6 z-20 flex size-14 flex-col items-center justify-center rounded-2xl bg-accent text-xs font-semibold text-on-accent shadow-lg"
        >
          <Chat className="size-5" />
          Aide
        </a>
      )}
    </>
  );
}
