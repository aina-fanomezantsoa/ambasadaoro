# Règles métier

« (à confirmer) » = hypothèse posée par défaut.

## Annonces
- **BR-01** Une annonce est `brouillon`, `publiée`, `vendue` ou `retirée` ; « réservée » se déduit d'une commande active.
- **BR-02** Publication impossible sans titre, prix, HDV et au moins 1 photo (à confirmer).
- **BR-03** Le prix est un entier en ariary, de 1 000 à 100 000 000 (à confirmer).
- **BR-04** 8 photos au maximum, 5 Mo chacune, JPEG, PNG ou WebP.
- **BR-05** Les héros viennent d'une liste fixe : Roi des barbares, Reine des archers, Grand gardien, Championne royale, Prince gargouille. Niveau vide = non débloqué.
- **BR-06** Une annonce vendue reste visible 7 jours après la validation du paiement, puis disparaît du public.
- **BR-07** Une annonce ayant au moins une commande n'est jamais supprimée, seulement retirée.

## Commandes et paiement
- **BR-10** Seule une annonce publiée et sans commande active est commandable.
- **BR-11** Une annonce a au plus une commande active (`attente_paiement`, `à_vérifier`).
- **BR-12** Un numéro de téléphone a au plus une commande active.
- **BR-13** La commande exige un nom, un téléphone malgache valide, l'acceptation des règles et la confirmation « 18 ans ou accord d'un parent ».
- **BR-14** Le prix est copié dans la commande ; modifier l'annonce ne le change pas.
- **BR-15** Sans ID de transaction 1 h après la commande, elle expire et l'annonce redevient disponible.
- **BR-16** Après envoi de l'ID, la commande n'expire plus : elle attend la décision de l'admin.
- **BR-17** Un ID de transaction ne sert qu'une fois par opérateur, sans tenir compte des espaces ni de la casse.
- **BR-18** Au premier refus, l'acheteur a 1 h pour un nouvel essai ; au second, la commande est annulée.
- **BR-19** La validation du paiement passe la commande à `payée` et l'annonce à `vendue`.
- **BR-20** Seule une commande `payée` peut être marquée `livrée`.
- **BR-21** L'admin peut annuler une commande non livrée ; l'annonce redevient publiée.

## Suivi, garantie, avis
- **BR-30** Le suivi exige le code de commande et le téléphone ; 5 essais par 15 minutes (à confirmer).
- **BR-31** Le code de commande est aléatoire, non séquentiel, d'au moins 8 caractères.
- **BR-32** Un litige s'ouvre au plus 7 jours après la livraison ; issues : `remboursé`, `échangé`, `rejeté`.
- **BR-33** La garantie couvre la récupération du compte, pas le bannissement.
- **BR-34** Un avis (note de 1 à 5, 500 caractères max) par commande livrée ; l'admin peut le masquer, pas le modifier.

## Catalogue et statistiques
- **BR-40** Le public ne voit ni les brouillons ni les annonces retirées.
- **BR-41** Les filtres se combinent (ET). Le tri par défaut place les disponibles avant les réservés et les vendus.
- **BR-42** Popularité = nombre de vues de la fiche, une par appareil et par jour (à confirmer).
- **BR-43** CA du mois = somme des commandes livrées, moins les remboursées.
- **BR-44** Taux de litige = litiges non rejetés ÷ commandes livrées du mois de livraison.
