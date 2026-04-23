# Aura Finance Backend

## Local Run on Windows 11

1. Start Docker Desktop.
2. From `D:\work\FINANCE-TRACKER\backend`, run `npm run db:up`.
3. Run `npm run prisma:generate`.
4. Run `npm run prisma:migrate`.
5. Run `npm run prisma:seed`.
6. Run `npm run dev`.

## Notes

- Docker PostgreSQL is exposed on `localhost:5433` to avoid conflicts with a local Windows PostgreSQL service on `5432`.
- If you already have an old container running on `5432`, restart it with `npm run db:down`, then `npm run db:up`.

## Demo Account

- Email: `demo@aurafinance.local`
- Password: `demodemo`
