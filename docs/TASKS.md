# Tâches

Resp. : « dev » partout (un seul développeur). Diff. : F facile, M moyen, D difficile.

## Sprint 1 — socle en ligne (jours 1 à 4)
| ID | Tâche | Resp. | Dépend de | Diff. | Validation | État |
|----|-------|------|-----------|-------|------------|------|
| T01 | Projet Next.js, outillage, mise en page de base (tous les F) | dev | — | F | dev, lint, tests, build passent | ✅ |
| T02 | Déploiement vide sur Netlify, CI (tous les F) | dev | T01 | M | page visible en ligne, CI verte | ✅ |
| T03 | Schéma Drizzle et base Neon (F02–F17) | dev | T01 | M | migrations et données de test chargées | ✅ |
| T04 | Connexion admin (F13) | dev | T02, T03 | M | mauvais mot de passe refusé | 🟡 |

Écart : T02, https://ambasadaoro.netlify.app est public (envoi manuel, aperçus réservés à l’équipe) ; il sert la version de démonstration tant que les variables d’environnement ne sont pas saisies.
Écart : T04, restent `ADMIN_EMAIL`, le mot de passe réel et l'essai en ligne.

## Sprint 2 — annonces et catalogue (jours 5 à 9)
| ID | Tâche | Resp. | Dépend de | Diff. | Validation | État |
|----|-------|------|-----------|-------|------------|------|
| T05 | Admin annonces et photos (F14) | dev | T04 | M | annonce créée avec photos puis publiée | 🟡 |
| T06 | Accueil et fiche (F01, F04) | dev | T05 | F | « à la une » et fiche complète sur mobile | ✅ |
| T07 | Catalogue, filtres, recherche, tri, statuts, vues (F02, F03, F05) | dev | T05 | M | filtres combinés et pagination testés | ✅ |

Écart : T05, code fait et parcours créer / publier / retirer essayé sur une base locale ; l'envoi réel de photos reste à essayer (clés Cloudinary absentes).
Écart : T06 et T07, vérifiés en local sur mobile (360 à 375 px) et par les tests ; à revérifier en ligne (T16).

## Sprint 3 — achat (jours 10 à 15, le plus risqué)
| ID | Tâche | Resp. | Dépend de | Diff. | Validation | État |
|----|-------|------|-----------|-------|------------|------|
| T08 | Page règles et garantie (F12) | dev | T01 | F | liée à la commande, badge visible | ✅ |
| T09 | Commande et réservation 1 h (F06) | dev | T07, T08 | D | deux commandes simultanées : une seule passe | ✅ |
| T10 | ID de transaction et alerte e-mail (F07, F17) | dev | T09 | M | ID en double refusé, e-mail reçu | 🟡 |
| T11 | Admin commandes et litiges (F15) | dev | T10 | D | cycle complet jusqu'à livré et litige | ✅ |
| T12 | Suivi et historique local (F08) | dev | T09 | M | code et téléphone requis, essais limités | ✅ |

Écart : T08 à T12, parcours commande → ID → validation → livraison → litige essayé en local (base PGlite) ; à revérifier en ligne (T16).
Écart : T09, la commande simultanée est testée sur PGlite (une seule session) ; la garantie vient des index uniques, pas encore essayée sur Neon.
Écart : T10, ID en double refusé (test) ; la réception de l'e-mail d'alerte reste à vérifier avec la vraie clé Resend.

## Sprint 4 — confiance et finition (jours 16 à 20)
| ID | Tâche | Resp. | Dépend de | Diff. | Validation | État |
|----|-------|------|-----------|-------|------------|------|
| T13 | Favoris et bouton WhatsApp (F09, F10) | dev | T07 | F | message prérempli | ✅ |
| T14 | Avis (F11) | dev | T11, T12 | M | un seul avis par commande livrée | ✅ |
| T15 | Statistiques (F16) | dev | T11 | M | chiffres égaux aux données de test | ✅ |
| T16 | Recette sur le site déployé (tous les F) | dev | T01–T15 | M | critère de livraison du TEST_PLAN | 🟡 |

Écart : T13 à T15, favoris, avis, masquage et statistiques essayés en local sur mobile (375 px, base PGlite) et par les tests.
Écart : T16, non faite sur le site déployé. Restent : saisir les variables d’environnement sur Netlify, migrer et vérifier la base Neon, déployer, puis une commande de bout en bout avec un vrai téléphone (e-mail d’alerte, liens WhatsApp, photos).
