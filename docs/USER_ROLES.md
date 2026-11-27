# Rôles

| Action | Visiteur / acheteur | Admin |
|--------|:---:|:---:|
| Voir le catalogue publié, favoris | oui | oui |
| Commander, envoyer un ID | oui (sa commande, avec code et téléphone) | non nécessaire |
| Suivre une commande, laisser un avis | oui (la sienne) | non |
| Créer, publier, retirer une annonce | non | oui |
| Valider ou refuser un paiement, livrer, annuler | non | oui |
| Gérer les litiges, masquer un avis | non | oui |
| Voir noms, téléphones, statistiques | non | oui |

- Un seul admin : l'e-mail `ADMIN_EMAIL` et le mot de passe dont le hachage est `ADMIN_PASSWORD_HASH`. Tout autre essai est refusé.
- Aucun compte acheteur, aucune inscription. Changer d'admin ou de mot de passe = changer les variables d'environnement (`npm run admin:password` donne le hachage du mot de passe choisi) ; les sessions ouvertes sont alors fermées.
- L'admin ne peut pas supprimer une commande ni modifier le texte d'un avis.
