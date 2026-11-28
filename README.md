# Ambasadaoro

Boutique de comptes Clash of Clans (Next.js). Voir [AGENTS.md](AGENTS.md) et [docs/](docs/).

```bash
npm install
cp .env.example .env   # puis remplir
npm run admin:password # choisir le mot de passe admin, reporter le hachage dans .env
npm run db:migrate
npm run db:seed        # données de démonstration, base de test uniquement ; « -- <dossier> » ajoute ses images
npm run dev
```
