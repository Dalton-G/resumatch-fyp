# Helpful Prisma commands in case I forget:
1. `npx prisma migrate dev` -> create a migration and push it to Supabase
2. `npx prisma generate` -> create a new prisma client for development
3. `npx prisma db push` -> push to Supabase without creating a migration, don't use in prod
4. `npx prisma migrate reset` -> resets the entire database, including dropping db, table, data, etc
5. `npx prisma format` -> to format your prisma.schema file
6. `npx prisma validate` -> to validate prisma schema without applying anything/committing to db