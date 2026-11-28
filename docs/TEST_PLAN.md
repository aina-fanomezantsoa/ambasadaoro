# Plan de test

## Automatiques (Vitest, sur une base de test pour les contraintes)
| Règle | Test |
|-------|------|
| BR-02, BR-03, BR-04 | publication incomplète, prix hors bornes, 9e photo : refusés |
| BR-10, BR-11 | deux commandes simultanées : une seule créée |
| BR-12 | seconde commande active du même téléphone refusée |
| BR-13, BR-14 | acceptation manquante refusée ; prix figé |
| BR-15, BR-16 | expiration sans ID ; aucune expiration avec ID |
| BR-17 | même ID avec casse ou espaces différents refusé |
| BR-18 | second refus annule la commande |
| BR-19, BR-20, BR-21 | transitions interdites refusées |
| BR-30, BR-31 | 6e essai bloqué ; codes non séquentiels |
| BR-32, BR-34 | litige au 8e jour et second avis refusés |
| BR-40 | brouillon et retiré absents du public |
| BR-06 | vendu masqué au 8e jour |
| BR-43, BR-44 | chiffres sur un jeu de données connu |
| F13 | chaque action admin refusée sans session admin |

## Manuels
- Permissions : pages `/admin` sans connexion et avec un mauvais mot de passe.
- Téléphone réel sur réseau mobile : catalogue, filtres, fiche, vignettes, brouillon WhatsApp, image d'accueil.
- Photos : trop lourde, mauvais format, 9e photo.
- Corrections : annuler une commande, refuser un ID, retirer une annonce.
- E-mail d'alerte reçu et liens WhatsApp corrects.

## Critère de livraison
Tous les tests passent **sur le site déployé**, pas seulement en local, et un contact WhatsApp a été fait avec un vrai téléphone depuis une fiche.
