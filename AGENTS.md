<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Ambasadaoro

Boutique de comptes Clash of Clans, un seul vendeur-admin, public à Madagascar. Interface et docs en français, code en anglais.

## Stack
Next.js 16 (App Router), TypeScript strict, Tailwind 4, Drizzle + PostgreSQL (Neon), Better Auth (Google, sans base), Zod, Vitest, Netlify.
`cacheComponents` et `partialPrefetching` sont activés (next.config.ts) : toute lecture dynamique va sous `<Suspense>` ou `use cache`.

## Commandes
`npm run dev` · `lint` · `typecheck` · `test` · `format` · `build` · `db:generate` · `db:migrate` · `db:seed`

## Sources de vérité (docs/)
REQUIREMENTS, DECISIONS, BUSINESS_RULES (BR-xx), DATABASE_SCHEMA, USER_ROLES, UI_UX_GUIDELINES, API_DOCUMENTATION, TASKS (Txx), TEST_PLAN. Le code suit les docs.

## Conventions
- Écritures : Server Actions passant par `action()` de `src/lib/action.ts`.
- Admin : `await requireAdmin()` en premier dans chaque page et action.
- Base : `db()` ; toute modification de schéma passe par `db:generate` (jamais de SQL à la main sur la base).
- Règles métier pures dans `src/lib/rules.ts`, avec un test citant la BR.
- Montants en ariary entiers. Secrets en variables d'environnement, `.env.example` à jour.

## Commits
En français, préfixe de tâche (`T05: …`), une idée par commit.

## À ne pas faire
- Stocker des identifiants de comptes de jeu.
- Utiliser des visuels ou logos Supercell, ou laisser croire à une affiliation.
- Ajouter une fonction hors REQUIREMENTS sans décision tracée.
