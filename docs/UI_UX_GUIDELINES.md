# Interface

Mobile d'abord (360 px), français, identité gaming sombre. Référence de mise en page : la page « Comptes Clash of Clans » de u7buy.com (vue le 2026-11-27). On en reprend la structure, jamais le logo, les images, les textes ni la marque ; aucun visuel Supercell.

## Tokens
| Rôle | Valeur |
|------|--------|
| Fond / carte / champ | `#0f1115` / `#1b202b` / `#222936` |
| En-tête / champ de recherche | `#050509` / `#171b24` |
| Texte / texte secondaire | `#ffffff` / `#919cac` |
| Accent (action) | orange `#ff5733`, texte `#1c0a03` |
| Disponible / réservé / vendu | `#22c55e` / `#f59e0b` / `#71717a` |
| Erreur | `#f87171` |

Arial, 14 px. Espacements par multiples de 4 px. Rayons : cartes 24 px, champs et boutons en pilule.

## Page catalogue (accueil et liste)
De haut en bas :
1. En-tête fixe : « Ambasadaoro », « Comment acheter », « Questions fréquentes », WhatsApp ; dessous, onglet « Comptes ». « Règles et garantie » et, dans la barre d’onglets (visible sur mobile), « Ma commande ». « Favoris » dans la barre d’onglets.
2. Fil d'Ariane et titre (par défaut « Acheter un compte Clash of Clans ») et paragraphe « bio », tous deux modifiables dans l'admin.
3. Champ de recherche, puis à côté deux filtres en pilules, appliqués dès le choix : HDV, et « Héros » qui déplie les cinq héros. Derrière le titre et les filtres, l'image de fond choisie dans l'admin, assombrie.
4. Nombre de comptes disponibles, pastille « Garantie 7 jours » et menu de tri.
5. Grille de cartes : 1 colonne sur mobile, 2 sur tablette, 3 sur ordinateur.
6. Sous la grille : « Comment acheter » et questions fréquentes (textes originaux).
7. Bouton d’aide flottant WhatsApp, affiché si `NEXT_PUBLIC_WHATSAPP_NUMBER` est rempli.

Les annonces « à la une » ouvrent la grille de l'accueil (F01).

## Carte d'annonce
« Android et iOS » · titre sur 2 lignes · photo 16:10 (nombre de photos à ajouter avec les photos) · pastilles (HDV, niveaux des héros) · prix en Ar et statut · séparateur pointillé · vendeur et « Garantie 7 jours ».

## Administration
Pas de navigation publique : en-tête « Ambasadaoro » et bouton « Voir le site » (nouvel onglet). Menu : Nouvelle annonce, Accueil (titre, bio, image), Avis, Statistiques, Se déconnecter.

## Fiche compte
Une grande photo, les autres en vignettes dessous (toucher une vignette l'affiche en grand). Puis prix, statut, toutes les caractéristiques et le bouton principal « Contacter sur WhatsApp » (compte disponible seulement).

## Écarts voulus avec la référence
Texte foncé sur l’orange (contraste AA). Pas de bouton « Vendre », de connexion, de fiches vendeurs, de « livraison instantanée », d'autres jeux, de devises multiples ni de badge d'avis tiers : un seul vendeur, livraison à la main, ariary seulement.

## Écrans et états
| Écran | Vide | Chargement | Erreur |
|-------|------|------------|--------|
| Accueil et catalogue | « Aucun compte » + effacer les filtres | squelettes de cartes | message et réessayer |
| Fiche | — | squelette | « Annonce introuvable » |
| Paiement d'une commande existante | — | bouton désactivé | « ID déjà utilisé » |
| Suivi | liste locale vide | bouton désactivé | « Code ou téléphone incorrect » |
| Favoris | « Aucun favori » | squelettes | idem catalogue |
| Règles et garantie | — | — | — |
| Admin : annonces, commandes, litiges, avis, statistiques | « Rien à traiter » | squelettes | message détaillé |

## Accessibilité
Contraste AA, cibles de 44 px, labels visibles (y compris sur les filtres), focus visible, texte alternatif sur les photos, statut jamais indiqué par la couleur seule, aucun défilement horizontal de la page.
