# Ambasadaoro

Boutique de comptes Clash of Clans (Next.js). Voir [AGENTS.md](AGENTS.md) et [docs/](docs/).

```bash
npm install
cp .env.example .env   # puis remplir
npm run admin:password # mot de passe admin, à reporter dans .env
npm run db:migrate
npm run db:seed        # données de démonstration, base de test uniquement
npm run dev
```
