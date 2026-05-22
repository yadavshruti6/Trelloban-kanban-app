# Trelloban

Trelloban is a Trello-style Kanban workspace built with Next.js 14, Express, Prisma, MySQL, Zustand, dnd-kit, and Tailwind CSS.

## What is persisted

The app now persists the board graph through MySQL:

- boards
- lists
- cards
- labels
- checklist items
- members
- card-member relations
- attachments
- comments
- activities

The frontend hydrates from the API on load and syncs optimistic edits back to the backend.

## Architecture

- `apps/web` is the Next.js UI.
- `apps/api` is the Express API.
- Prisma owns the database schema and migrations.
- The web store keeps UI state locally, but board data is rehydrated from the API and synced back after each mutation.
- Drag and drop uses `dnd-kit` with optimistic reordering and board-level persistence.

## Local setup

1. Install dependencies from the repository root.

```bash
npm install
```

2. Create a MySQL database and configure environment variables.

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/trelloban"
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

3. Run Prisma migrations and seed data.

```bash
npm run prisma:generate --workspace apps/api
npm run prisma:migrate --workspace apps/api
npm run seed
```

4. Start both apps.

```bash
npm run dev
```

## Verification

Run the following before shipping changes:

```bash
npx tsc -p apps/web/tsconfig.json --noEmit --ignoreDeprecations 5.0
npm run build --workspace apps/api
```

## Deployment

### Vercel

- Deploy `apps/web` to Vercel.
- Set `NEXT_PUBLIC_API_URL` to your API URL.
- Make sure the web app points to the deployed API, not localhost.

### Render or Railway

- Deploy `apps/api` as a Node service.
- Set `DATABASE_URL` to your managed MySQL instance.
- Run Prisma migrations on deploy.
- Expose the API at a public URL and copy it into `NEXT_PUBLIC_API_URL` for the web app.

## Notes

- The workspace hydration endpoint returns the full normalized board graph.
- Board title edits, card edits, checklist updates, member assignment, and drag-drop all sync to MySQL.
- The repo includes a seed script for a starter workspace.
