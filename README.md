# Rfqly Web

Next.js App Router frontend for Rfqly — the marketing/landing page, the
interactive chat demo, and the internal staff console (async review queue +
real-time CSR takeover). Talks to the
[rfqly-api](https://github.com/noumanas/rfqly-api) backend, which was split
out of the same original monorepo into its own repo.

## Layout

- `app/page.tsx` — the marketing landing page (GSAP scroll animations,
  architecture diagram, floating chat widget).
- `app/demo/page.tsx` — the interactive "try it" page.
- `app/(staff)/review` — async review queue.
- `app/(staff)/live` — real-time CSR takeover console.

## Setup

```bash
pnpm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL to your running rfqly-api
pnpm dev                      # http://localhost:3000
```

## Deploying (Cloud Run)

`NEXT_PUBLIC_API_URL` gets inlined into the client bundle at **build time**
(Next.js convention for `NEXT_PUBLIC_*` vars), so it must be passed as a
Docker build arg, not a runtime env var — meaning `rfqly-api` needs to be
deployed first so you have its URL.

```bash
gcloud builds submit \
  --config cloudbuild.yaml \
  --substitutions=_NEXT_PUBLIC_API_URL=https://<your-rfqly-api-url>,_IMAGE=gcr.io/<PROJECT_ID>/rfqly-web \
  .

gcloud run deploy rfqly-web \
  --image gcr.io/<PROJECT_ID>/rfqly-web \
  --region <REGION> \
  --allow-unauthenticated
```

(`gcloud builds submit --tag` doesn't support `--build-arg`, hence the
`cloudbuild.yaml` here instead of the one-liner used for `rfqly-api`.)

Alternatively, deploy on Vercel as a normal Next.js app — just set
`NEXT_PUBLIC_API_URL` as a project env var pointing at wherever `rfqly-api`
is hosted (Cloud Run, Railway, etc.).

## Not yet wired up

- No auth on `/(staff)` routes — anyone with the URL can view/take over
  conversations. Fine for a private pilot link, not for public sharing.
- The marketing page's "Get in touch" is a placeholder mailto — swap for a
  real address or lead-capture form once a domain is picked.
