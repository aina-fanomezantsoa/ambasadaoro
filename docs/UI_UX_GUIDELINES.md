# Interface

Mobile d'abord (360 px), français, identité gaming sombre. Aucun visuel Supercell.

## Tokens
| Rôle | Valeur |
|------|--------|
| Fond / surface | `#0f1117` / `#1a1d27` |
| Texte / texte secondaire | `#f4f4f5` / `#a1a1aa` |
| Accent (action) | or `#f5b301`, texte `#171200` |
| Disponible / réservé / vendu | `#22c55e` / `#f59e0b` / `#71717a` |
| Erreur | `#f87171` |

Police système pour le texte, une police de titre via `next/font`. Espacements par multiples de 4 px, rayon 8 px.

## Composants
Carte d'annonce, badge de statut (couleur **et** mot), badge « Garantie 7 jours », panneau de filtres (tiroir sur mobile), galerie, formulaire, bouton WhatsApp, étoiles, tableau admin.

## Écrans et états
| Écran | Vide | Chargement | Erreur |
|-------|------|------------|--------|
| Accueil | « Aucune offre à la une » | squelettes | message et réessayer |
| Catalogue | « Aucun compte » + effacer les filtres | squelettes | idem |
| Fiche | — | squelette | « Annonce introuvable » |
| Commande et paiement | — | bouton désactivé | « Déjà réservé », « ID déjà utilisé » |
| Suivi | liste locale vide | bouton désactivé | « Code ou téléphone incorrect » |
| Favoris | « Aucun favori » | squelettes | idem catalogue |
| Règles et garantie | — | — | — |
| Admin : annonces, commandes, litiges, avis, statistiques | « Rien à traiter » | squelettes | message détaillé |

## Accessibilité
Contraste AA, cibles de 44 px, labels visibles, focus visible, texte alternatif sur les photos, statut jamais indiqué par la couleur seule.
