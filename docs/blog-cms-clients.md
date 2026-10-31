# CMS blog clients

Staff open **Blog CMS** in the admin navigation. Configure
`NEXT_PUBLIC_BLOG_CMS_URL` with the staff CMS origin (local MySQL: `http://localhost:8056`).
CMS staff accounts have a separate login from GameNode.

Web and mobile use the GameNode server (`NEXT_PUBLIC_SERVER_URL` / existing mobile
server configuration), never CMS delivery or administrator tokens. The paired
server contract is `game-node-server/server_swagger.json`; regenerate with
`yarn wrapper:generate` after copying its actual output into the wrapper input.
Public list, detail and tags send `locale=en|pt-BR`. The response selects one whole
published translation, with requested/resolved/available locales, explicit media
URLs, excerpt and publication date. English is the only fallback.

Staff preview is `/dashboard/blog/preview/<article UUID>?locale=en|pt-BR`.
Sign into GameNode with admin/mod/editor privileges. The backend enforces access
and exact-locale selection. Preview requests run only in the browser, use
`credentials: include` and `cache: no-store`, and never enter React Query or SSR
hydration. Identity, locale and authorization changes discard prior content.
Responses set private no-store and noindex headers. Private media remains served
by the authenticated GameNode preview media endpoint.

The old internal blog authoring routes are removed. Community editors and their
uploads remain independent. The server setup and CMS adoption evidence are in
`../game-node-server/docs/blog-cms.md` and `blog-cms-trial.md`.

## Client verification (2026-10-29)

Run against the real stack: MySQL Directus at `http://localhost:8056` (grant-less
recreate of the existing volumes, reader tokens provisioned with
`provision-readers.py`), the NestJS API on port 5000 with
`BLOG_CMS_URL`/`BLOG_CMS_PUBLIC_URL=http://localhost:8056`, the delivery and
preview tokens, and `BLOG_PUBLIC_MEDIA_PATH` pointing at the directory
bind-mounted as the CMS public media folder (a named Docker volume is not
readable from a host-run server). Five new articles were authored through the
CMS API: bilingual, English-only, review (game + rating), English-published
with Portuguese draft, and draft-only; bodies include a `<script>` tag and an
inline image.

- API: Portuguese list returns Portuguese where published and the English
  article otherwise (`resolvedLocale: "en"`); the partial and draft-only
  articles never expose draft translations; tag counts and `tag=review`
  pagination match; scripts are removed; media URLs are explicit.
- Web SSR (`next dev`): article HTML contains the body without JavaScript,
  `lang` matches the resolved locale, canonical targets the resolved locale and
  alternates list only published locales; draft-only returns 404; stopping the
  CMS makes API and page return 503 and the page recovers on restart. `/blog`,
  `/pt-BR/blog` and `/blog/archive` render. This found and fixed a 500 on `/blog`:
  the list query key held `undefined`, which Next cannot serialize in
  dehydrated state (regression test added).
- Preview: anonymous requests get 401, a user without an editorial role gets
  403, and an `editor` returns the exact-locale draft (no fallback) with
  `private, no-store`; draft cover and inline images load only with the session.
  The admin preview route serves `private, no-store` and `noindex`.
- Builds and checks: focused Vitest suites (14 tests), `tsc --noEmit` for ui,
  locales, web, mobile and admin, and production builds of web, mobile and admin
  all pass. The earlier admin Turbopack font failure did not recur.

Not verified: the browser-rendered admin preview with a live Better Auth
browser session and the mobile app on a device; the licensed custom-policy
configuration was not re-activated (no key available), the existing policies
worked unchanged.
