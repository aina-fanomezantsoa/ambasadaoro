# Server Actions

Entrées validées avec Zod. Réponse : `{ ok: true, data }` ou `{ ok: false, error }` (message en français).

| Action | Rôle | Entrées → sortie | Erreurs |
|--------|------|------------------|---------|
| `createOrder` | public | annonce, nom, téléphone, acceptations → code et téléphone normalisé | indisponible, commande déjà active, trop de commandes |
| `submitPayment` | public + code et téléphone | opérateur, ID → statut | expirée, ID déjà utilisé |
| `trackOrder` | public | code, téléphone → état | introuvable, trop d'essais |
| `createReview` | public + code et téléphone | note, commentaire | non livrée, déjà noté |
| `addView` | public | annonce | — |
| `saveListing`, `publishListing`, `withdrawListing` | admin | champs d'annonce | champs manquants, non autorisé |
| `signUpload`, `addPhoto`, `deletePhoto` | admin | annonce ou photo | 8 photos atteintes, photo trop lourde ou mauvais format, dernière photo d'une annonce publiée |
| `acceptPayment`, `rejectPayment` | admin | paiement | déjà traité |
| `markDelivered`, `cancelOrder` | admin | commande | statut incompatible |
| `openDispute`, `closeDispute` | admin | commande, motif, issue | délai de 7 jours dépassé |
| `hideReview`, `showReview` | admin | avis | avis introuvable |

Toute action admin vérifie la session côté serveur. Le catalogue, la fiche et les statistiques sont lus par des Server Components.
