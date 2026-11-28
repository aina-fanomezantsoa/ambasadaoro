import type { Metadata } from "next";

export const metadata: Metadata = { title: "Règles et garantie" };

const SECTIONS = [
  [
    "Les risques à connaître avant d'acheter",
    [
      "Les conditions d'utilisation de Supercell interdisent la vente et l'achat de comptes.",
      "Le compte acheté peut être banni, ou récupéré par son ancien propriétaire.",
      "Cette boutique peut fermer à la suite d'une plainte.",
    ],
  ],
  [
    "Garantie 7 jours",
    [
      "Si le compte est récupéré dans les 7 jours suivant la livraison : remboursement ou échange.",
      "Un bannissement n'est pas couvert, quelle que soit sa date.",
      "Pour faire jouer la garantie, contactez-nous avec votre code de commande avant la fin des 7 jours.",
    ],
  ],
  [
    "Achat et paiement",
    [
      "Contactez-nous sur WhatsApp depuis la fiche du compte.",
      "Le paiement se fait par MVola ou Orange Money. Nous le vérifions à la main.",
      "Le compte est remis à la main, par WhatsApp ou par appel. Aucun identifiant de jeu n'est enregistré sur ce site.",
    ],
  ],
  [
    "Vous et vos données",
    [
      "Vous devez avoir 18 ans, ou l'accord d'un parent.",
      "Le site ne vous demande aucune donnée personnelle pour acheter : l'échange se fait sur WhatsApp.",
      "Ambasadaoro n'est ni affilié à Supercell ni approuvé par Supercell.",
    ],
  ],
] as const;

export default function RulesPage() {
  return (
    <div className="mx-auto max-w-[720px] px-4 py-8">
      <h1 className="text-xl font-bold lg:text-3xl">Règles, risques et garantie</h1>
      {SECTIONS.map(([title, items]) => (
        <section key={title} className="mt-6 rounded-3xl bg-surface p-5">
          <h2 className="text-lg font-semibold">{title}</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 leading-6 text-muted">
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
