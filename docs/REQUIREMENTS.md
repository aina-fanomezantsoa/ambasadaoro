# Exigences

Sources : [CAHIER_DES_CHARGES.md](CAHIER_DES_CHARGES.md), [DECISIONS.md](DECISIONS.md). Périmètre **à valider**.

## MVP (V1)

| ID | Fonction | Critère d'acceptation |
|----|----------|-----------------------|
| F01 | Accueil | Les annonces cochées « à la une » par l'admin s'affichent en premier |
| F02 | Catalogue et filtres | Filtres HDV, nombre et niveau des héros, ligue/trophées, maison des ouvriers, fourchette de prix en Ar ; combinables ; pagination |
| F03 | Recherche et tri | Recherche par texte ; tri par prix, popularité (vues) et HDV |
| F04 | Fiche compte | Photos du compte, prix, HDV, héros, trophées/ligue, gemmes, niveau XP, maison des ouvriers, skins, décors |
| F05 | Statuts visibles | Disponible, réservé et vendu sont affichés ; seul un compte disponible est commandable |
| F06 | Commande | Nom + téléphone ; un code de commande est donné ; l'annonce passe « réservé » 1 h ; deux acheteurs ne peuvent pas réserver le même compte |
| F07 | Paiement Mobile Money | Numéros MVola et Orange Money et montant affichés ; l'acheteur saisit seulement l'ID de transaction (ni capture ni vidéo) ; l'admin vérifie à la main (F15) ; sans ID après 1 h, l'annonce redevient disponible |
| F08 | Suivi et historique | Avec le code et le téléphone, l'acheteur voit l'état ; les commandes passées depuis l'appareil sont listées |
| F09 | Favoris | Ajout et retrait, conservés sur l'appareil |
| F10 | WhatsApp | Bouton sur chaque fiche avec un message citant l'annonce |
| F11 | Avis | Note sur 5 et commentaire, uniquement pour une commande livrée ; moyenne affichée |
| F12 | Confiance | Badge « Garantie 7 jours » et page règles, risques et garantie, acceptée avant la commande |
| F13 | Admin : accès | Connexion réservée au seul admin ; aucune page ou action admin accessible sans elle |
| F14 | Admin : annonces | Créer, modifier, publier, retirer ; brouillon invisible du public |
| F15 | Admin : commandes | Valider ou refuser un paiement, marquer livré, ouvrir et clore un litige (remboursement ou échange) |
| F16 | Admin : statistiques | Chiffre d'affaires, nombre de ventes, taux de litige, par mois |
| F17 | Alerte | E-mail à l'admin quand une référence de paiement est déposée |

## V2

- Autres vendeurs : inscription, modération des annonces avant publication, commissions
- Comptes acheteurs (favoris et historique synchronisés)
- Messagerie intégrée

## V3

- Vérification automatique des paiements Mobile Money, selon les API disponibles
- Autres langues et devises

## Exclus

- Stockage des identifiants des comptes de jeu (livraison à la main)
- Vidéo de vérification et envoi d'une preuve de paiement en image
- Paiement par carte ou crypto
- Application mobile native
- Logos et visuels officiels de Supercell, toute mention d'affiliation

## Contraintes non fonctionnelles

- Mobile d'abord, utilisable sur une connexion lente (images compressées)
- Français, prix en ariary
- Hébergement et sous-domaine gratuits, un seul développeur
- Données personnelles limitées au nom et au téléphone
- V1 en ligne en 2 à 3 semaines

## Risques

- Supercell interdit la vente de comptes : bannissement, récupération par l'ancien propriétaire, fermeture possible du site sur plainte. La page règles doit le dire à l'acheteur.
- Acheteurs mineurs possibles : exiger la confirmation « j'ai 18 ans ou l'accord d'un parent » (à confirmer avec le droit local).
- Un ID de transaction peut être inventé ou réutilisé : l'admin le vérifie sur son relevé Mobile Money, et un ID déjà utilisé est refusé.
