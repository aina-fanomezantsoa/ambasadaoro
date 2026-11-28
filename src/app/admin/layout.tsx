import Link from "next/link";
import { Shield } from "../icons";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-20 bg-header/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-4 lg:h-20">
          <Link
            href="/admin"
            className="flex min-h-11 items-center gap-2 text-xl font-bold lg:text-2xl"
          >
            <Shield className="size-8 text-accent" />
            Ambasadaoro
          </Link>
          {/* A new tab, so the admin stays open next to the visitor side. */}
          <a
            href="/"
            target="_blank"
            className="flex min-h-11 items-center rounded-3xl bg-accent px-5 font-medium text-on-accent"
          >
            Voir le site
          </a>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </>
  );
}
