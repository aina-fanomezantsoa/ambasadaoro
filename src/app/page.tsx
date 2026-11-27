import Link from "next/link";
import { Suspense } from "react";
import type { Params } from "@/lib/catalogue";
import { Catalogue } from "./catalogue";
import { ChevronRight } from "./icons";

const STEPS = [
  "Choisissez un compte disponible et commandez avec votre nom et votre numéro : il vous est réservé 1 heure.",
  "Payez par MVola ou Orange Money, puis saisissez l'ID de la transaction.",
  "Nous vérifions le paiement et vous remettons le compte par WhatsApp ou par appel.",
];

const FAQ = [
  [
    "Que couvre la garantie de 7 jours ?",
    "Si le compte est récupéré par son ancien propriétaire dans les 7 jours suivant la livraison : remboursement ou échange. Un bannissement n'est pas couvert.",
  ],
  [
    "Acheter un compte est-il autorisé par Supercell ?",
    "Non. Les conditions d'utilisation de Supercell l'interdisent : le compte peut être banni ou perdu.",
  ],
  [
    "Faut-il créer un compte sur ce site ?",
    "Non. Un code de commande et votre numéro suffisent pour suivre l'achat.",
  ],
];

export default function Home({ searchParams }: { searchParams: Promise<Params> }) {
  return (
    <>
      <div className="bg-[radial-gradient(ellipse_at_top,#2a3142_0%,transparent_70%)]">
        <div className="mx-auto max-w-[1200px] px-4 pt-5">
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-1 text-xs text-muted">
            <Link href="/">Accueil</Link>
            <ChevronRight className="size-3" />
            <span className="text-foreground">Comptes Clash of Clans</span>
          </nav>
          <h1 className="mt-3 text-lg font-semibold lg:mb-4 lg:text-[32px] lg:leading-10 lg:font-bold">
            Acheter un compte Clash of Clans
          </h1>
          <p className="mt-3 rounded-2xl border border-reserved/40 px-4 py-2 text-xs text-reserved">
            Site en construction : la commande en ligne n&apos;est pas encore ouverte.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-4">
        <Suspense
          fallback={
            <div role="status" className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <span className="sr-only">Chargement des comptes…</span>
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-96 animate-pulse rounded-3xl bg-surface" />
              ))}
            </div>
          }
        >
          <Catalogue searchParams={searchParams} />
        </Suspense>

        <section id="comment-acheter" className="mt-16 scroll-mt-40">
          <h2 className="text-xl font-bold">Comment acheter</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 leading-6 text-muted">
            {STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <section id="faq" className="mt-10 scroll-mt-40">
          <h2 className="text-xl font-bold">Questions fréquentes</h2>
          {FAQ.map(([question, answer]) => (
            <details key={question} className="mt-3 rounded-3xl bg-surface px-5">
              <summary className="flex min-h-12 cursor-pointer items-center py-2 font-semibold">
                {question}
              </summary>
              <p className="pb-5 leading-6 text-muted">{answer}</p>
            </details>
          ))}
        </section>
      </div>
    </>
  );
}
