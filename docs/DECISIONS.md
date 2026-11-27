# Décisions

Statut : ✅ validé · 🟡 provisoire · ❓ ouvert

## Série 1 — modèle de vente (2026-11-27)

| # | Sujet | Décision | Statut |
|---|-------|----------|--------|
| 1 | Vendeurs | Le propriétaire seul vend son stock, un seul admin | ✅ |
| 2 | Paiement | Mobile Money hors site : l'acheteur dépose la référence, validation à la main | ✅ |
| 3 | Public | Madagascar : prix en ariary, français, surtout sur téléphone | ✅ |
| 4 | Stock | 20 à 200 comptes en vente : recherche, filtres (HDV, prix), pagination | ✅ |

## Série 2 — commande et fiche compte (2026-11-27)

| # | Sujet | Décision | Statut |
|---|-------|----------|--------|
| 5 | Compte acheteur | Aucun : nom + téléphone, suivi par code de commande | ✅ |
| 6 | Opérateurs | MVola et Orange Money | ✅ |
| 7 | Livraison | À la main (WhatsApp / appel) ; aucun identifiant de compte de jeu stocké sur le site | ✅ |
| 8 | Fiche compte | Prix, photos, description, HDV, héros, trophées/ligue, gemmes, niveau XP, maison des ouvriers, skins et décors | ✅ |

## Série 3 — réservation, garantie, planning (2026-11-27)

| # | Sujet | Décision | Statut |
|---|-------|----------|--------|
| 9 | Réservation | Annonce bloquée 1 h après commande ; remise en vente sans référence de paiement | ✅ |
| 10 | Garantie | 7 jours : remboursement ou échange si le compte est récupéré ; rien pour un bannissement | ✅ |
| 11 | Date visée | V1 en ligne en 2 à 3 semaines | ✅ |
| 12 | Budget | Gratuit : hébergement gratuit, sous-domaine gratuit | ✅ |

## Série 4 — cahier des charges (2026-11-27)

| # | Sujet | Décision | Statut |
|---|-------|----------|--------|
| 13 | Marketplace | V1 : le propriétaire seul. Autres vendeurs, modération et commissions en V2 (confirme 1) | ✅ |
| 14 | Espace acheteur | V1 sans compte : favoris sur l'appareil, historique via les codes de commande (confirme 5) | ✅ |
| 15 | Chat | Bouton WhatsApp avec message prérempli ; messagerie intégrée en V2 | ✅ |
| 16 | Vidéo | Vidéo de vérification téléversée sur le site | ✅ |
| 17 | Style | Identité gaming, fond sombre, accents or, sans visuels officiels | 🟡 |
| 18 | Nom | Ambasadaoro | ✅ |
| 19 | Alerte commande | E-mail à l'admin | 🟡 |
| 20 | Taille des fichiers | Vidéo 50 Mo max, 8 photos de 5 Mo max par annonce, à cause du stockage gratuit | 🟡 |
| 21 | Avis | Déposés avec le code d'une commande livrée, un par commande, masquables par l'admin | 🟡 |
| 22 | Automatisation | Automatiques : réservation, expiration, statuts, alertes. Manuels : validation du paiement, livraison | 🟡 |
| 23 | Popularité | Nombre de vues de la fiche | 🟡 |
| 24 | Anti-abus | Une seule réservation active par numéro de téléphone | 🟡 |

❓ restants : 0.

## Série 5 — stack (2026-11-27)

| # | Sujet | Décision | Statut |
|---|-------|----------|--------|
| 25 | Framework | Next.js seul, front et back dans le même projet | ✅ |
| 26 | Périmètre MVP | F01 à F17 acceptés (l'utilisateur est passé à la stack sans correction) | 🟡 |
| 27 | Hébergement | Netlify gratuit ; Vercel Hobby écarté (usage commercial interdit), Cloudflare écarté (10 ms de calcul) | ✅ |
| 28 | Vidéo | Pas de vidéo. Remplace 16 et la limite vidéo de 20 | 🟡 |
| 31 | Preuve de paiement | ID de transaction seul, unique, validé à la main dans l'admin | ✅ |
| 32 | Photos des annonces | Conservées : seules la preuve en image et la vidéo sont retirées | ✅ |

## Série 6 — conception (2026-11-27)

| # | Sujet | Décision | Statut |
|---|-------|----------|--------|
| 33 | Après l'ID | Le compte reste réservé jusqu'à la décision de l'admin | ✅ |
| 34 | ID refusé | Un nouvel essai sous 1 h ; second refus = commande annulée | ✅ |
| 35 | Comptes vendus | Visibles 7 jours | ✅ |
| 36 | Héros | Liste fixe dans le code, niveau vide = non débloqué | ✅ |
| 29 | Base et ORM | Neon + Drizzle ; Supabase et Prisma écartés pour rester léger | 🟡 |
| 30 | Auth, photos, e-mail | Better Auth (Google), Cloudinary, Resend ; mot de passe maison écarté | 🟡 |
