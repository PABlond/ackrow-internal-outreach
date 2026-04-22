# Tempolis Outreach App

React Router outreach tracker backed by local SQLite by default, or Turso/libSQL when `DATABASE_URL` is configured.

## Commands

Use Node 22.13.0 or newer:

```sh
nvm use
```

```sh
npm run init
npm run dev
```

Open http://localhost:4377.

To use the AI batch analyzer, either export env vars:

```sh
export OPENROUTER_API_KEY=...
npm run dev
```

Or create a local `.env` from `.env.example`.

The default model is `google/gemini-2.5-flash-lite`. You can override it with `OPENROUTER_MODEL`.

## Database

By default the app uses local SQLite:

```env
DATABASE_URL=
DATABASE_AUTH_TOKEN=
```

To share the same CRM across machines, use Turso:

```env
DATABASE_URL=libsql://your-db.turso.io
DATABASE_AUTH_TOKEN=...
```

Push the current local SQLite data to Turso:

```sh
npm run push:turso
```

On another machine, install the app, copy the same `DATABASE_URL` and `DATABASE_AUTH_TOKEN` into `.env`, then run `npm run dev`.

## Workflow

- Use `npm run init` once to create `data/outreach.sqlite` and import the current CSV files from `tempolis/front/docs` when working locally.
- Use `/batch` to paste a Google Sheets-style table and generate/import the outreach plan with OpenRouter.
- Use the Today dashboard every morning to see accepted connections, reports to send, missing brief URLs, and follow-ups.
- The app does not automate LinkedIn. It keeps the process reliable and gives you exact messages to copy.
