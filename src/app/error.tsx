"use client"; // error boundaries must be client components

export default function ErrorPage({ retry }: { error: unknown; retry: () => void }) {
  return (
    <div role="alert" className="mx-auto max-w-sm px-4 py-10 text-center">
      <p>Une erreur est survenue.</p>
      <button
        onClick={() => retry()}
        className="mt-4 h-11 rounded-3xl bg-accent px-5 font-medium text-on-accent"
      >
        Réessayer
      </button>
    </div>
  );
}
