# Schéma de base

PostgreSQL. Toutes les tables ont `id` et `created_at`.

## listings
`title` (requis), `description`, `price_ar` int (BR-03), `town_hall` int, `builder_hall` int?, `trophies` int?, `league` text?, `gems` int?, `xp_level` int?, `heroes` jsonb `{clé: niveau}` (BR-05), `skins` text?, `decorations` text?, `featured` bool, `status` (draft, published, sold, withdrawn), `sold_at`?, `views` int.
Index : `status`, `price_ar`, `town_hall`.

## listing_photos
`listing_id` (FK, cascade), `public_id` Cloudinary, `position`. Maximum 8 vérifié côté serveur.

## orders
`code` unique (BR-31), `listing_id` (FK, restrict : BR-07), `buyer_name`, `buyer_phone` (normalisé), `price_ar` (BR-14), `status` (awaiting_payment, to_verify, paid, delivered, cancelled, expired), `expires_at`?, `rejections` int, `accepted_rules_at`, `paid_at`?, `delivered_at`?.

Contraintes :
- unique partiel sur `listing_id` où `status` ∈ (awaiting_payment, to_verify) — BR-11
- unique partiel sur `buyer_phone` pour les mêmes statuts — BR-12

L'index ne connaît pas l'heure : avant d'insérer une commande, la même transaction passe à `expired` les commandes dépassées.

## payments
`order_id` (FK), `operator` (mvola, orange), `tx_id` normalisé, `status` (pending, accepted, rejected). Unique (`operator`, `tx_id`) — BR-17.

## disputes
`order_id` (FK, unique), `reason`, `status` (open, refunded, exchanged, rejected), `closed_at`?, `note`?.

## reviews
`order_id` (FK, unique : BR-34), `rating` 1–5 (check), `comment` ≤ 500, `hidden` bool.

## rate_limits
`key`, `window_start`, `count` — suivi de commande (BR-30).

## Calculé, jamais stocké
Réservé, note moyenne, CA, taux de litige.
