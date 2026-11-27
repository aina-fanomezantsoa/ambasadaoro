import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mt-4 rounded-3xl bg-surface p-10 text-center">
      <p>Annonce introuvable.</p>
      <Link href="/" className="mt-2 inline-block min-h-11 py-3 font-semibold text-accent">
        Voir les comptes disponibles
      </Link>
    </div>
  );
}
