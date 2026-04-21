# Tempolis Outreach App

Local React Router outreach tracker backed by SQLite.

## Commands

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

## Workflow

- Use `npm run init` once to create `data/outreach.sqlite` and import the current CSV files from `tempolis/front/docs`.
- Use `/batch` to paste a Google Sheets-style table and generate/import the outreach plan with OpenRouter.
- Use the Today dashboard every morning to see accepted connections, reports to send, missing brief URLs, and follow-ups.
- The app does not automate LinkedIn. It keeps the process reliable and gives you exact messages to copy.
