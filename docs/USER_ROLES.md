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

- Un seul admin : le compte Google dont l'e-mail vérifié est `ADMIN_EMAIL`. Tout autre compte est refusé.
- Aucun compte acheteur, aucune inscription. Changer d'admin = changer la variable d'environnement.
- L'admin ne peut pas supprimer une commande ni modifier le texte d'un avis.
