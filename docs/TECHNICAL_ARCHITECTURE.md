# Architecture technique : Ambasadaoro

Versions et quotas relevés par recherche web le 2026-11-27, à revérifier à l'installation. Stack **à valider**.

## Stack

| Couche | Choix |
|--------|-------|
| Framework | Next.js 16 (App Router), TypeScript strict : front et back |
| Écritures | Server Actions, validées avec Zod ; pas d'API séparée |
| Style | Tailwind CSS |
| Base | PostgreSQL sur Neon (gratuit : 1 Go, 100 CU-heures par mois) |
| ORM | Drizzle, migrations versionnées |
| Admin | Better Auth, connexion Google limitée à `ADMIN_EMAIL` (aucun mot de passe à gérer) |
| Photos | Cloudinary, envoi signé, compression automatique |
| Preuve de paiement | ID de transaction en texte, contrainte unique en base |
| E-mail | Resend, vers la seule adresse de l'admin |
| Hébergement | Netlify gratuit (300 crédits par mois) |
| Qualité | ESLint, Prettier, Vitest, GitHub Actions |

Non vérifiés à ce jour : Resend, Better Auth, Drizzle, conditions commerciales de Netlify et coût en crédits d'un déploiement.

## Dossiers

```
src/app/(public)/   accueil, catalogue, fiche, commande, suivi, règles
src/app/admin/      annonces, commandes, statistiques
src/db/             schéma et requêtes
src/lib/            règles métier, validation, auth
```

## Flux et règles techniques

- Lecture : Server Components ; filtres, tri et page dans l'URL.
- Réservation : une contrainte unique en base empêche deux commandes actives sur un même compte.
- Expiration : une réservation porte `expires_at` et est ignorée une fois dépassée. Pas de tâche planifiée.
- Favoris et codes de commande : `localStorage`.
- Chaque action admin vérifie la session côté serveur.
- Suivi de commande : code aléatoire non devinable et téléphone, avec limite d'essais.
- Erreurs : message en français pour l'utilisateur, détail dans les journaux serveur.
- Nommage : code en anglais, interface en français, montants en ariary entiers.

## Variables d'environnement

`DATABASE_URL`, `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ADMIN_EMAIL`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `RESEND_API_KEY`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `MVOLA_NUMBER`, `ORANGE_MONEY_NUMBER`

## Volontairement non fait

API publique, comptes acheteurs, messagerie, paiement intégré, cache externe, application mobile.

## Coût mensuel estimé

| | Maintenant | Trafic × 10 |
|---|---|---|
| Total | 0 | Hébergement payant probable (Netlify Pro, environ 20 $) ; base et photos à surveiller |

## Risques

- Netlify : site suspendu jusqu'au mois suivant si les crédits sont épuisés. Plan B : offre payante ou autre hébergeur Node.
- Cloudinary : 25 crédits par mois partagés entre stockage, transformations et bande passante.
- Les hébergeurs et services peuvent refuser une activité contraire aux conditions de Supercell : garder des sauvegardes de la base hors de ces services.
