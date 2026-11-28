# Workflow : site de vente de comptes Clash of Clans

Créé le 2026-11-27. États : ⬜ à faire · 🟡 en cours · ✅ fait

| # | Étape | Sortie principale | Gate | État |
|---|-------|-------------------|------|------|
| 1 | Brief | REQUIREMENTS.md, DECISIONS.md | Périmètre MVP signé | ✅ |
| 2 | Stack | TECHNICAL_ARCHITECTURE.md | Stack choisie | ✅ |
| 3 | Conception | BUSINESS_RULES, USER_ROLES, DATABASE_SCHEMA, UI_UX, TASKS, ROADMAP, TEST_PLAN | Plan de sprints validé | ✅ |
| 4 | Setup | Projet initialisé, AGENTS.md, agents | dev + lint + tests OK | ✅ |
| 5 | GitHub | Dépôt, CI, protections | CI verte | ✅ |
| 6 | Dev | Fonctionnalités (une branche + PR par tâche) | Sprint fini | 🟡 |
| 7 | QA | Tests, sécurité, perf, a11y | Critère de livraison | ⬜ |
| 8 | Déploiement | Production en ligne | Prod vérifiée | ⬜ |
| 9 | Maintenance | OPERATIONS.md, sauvegardes | Runbook remis | ⬜ |

Sprint 3 codé (T08 à T12) ; reste le sprint 4.

## Questions ouvertes

- Étape 4 faite. Comptes externes à créer par l'utilisateur (voir .env.example).
- Points « à confirmer » listés dans ROADMAP.md.

## Risque à garder en tête

- La vente de comptes est interdite par les conditions d'utilisation de Supercell : bannissements possibles, récupération du compte par l'ancien propriétaire, refus de certains prestataires de paiement. Le site ne doit pas se présenter comme affilié à Supercell.
