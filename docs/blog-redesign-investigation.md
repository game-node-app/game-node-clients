# Blog redesign investigation

Investigated 2026-10-28. Scope: the current clients monorepo, the sibling `game-node-server` backend, checked-in deployment configuration, and current official CMS documentation. This is a recommendation, not an implementation or a production capacity assessment.

## Recommendation

Use a self-hosted CMS for editorial production, with **Directus as the first proof-of-concept candidate**. Keep GameNode's web/mobile blog presentation and let NestJS provide a small locale-aware read API over CMS content. Replace the custom admin blog screens with a link to the CMS.

This is better than expanding the in-house system if the trial confirms acceptable writing/translation workflows, licensing, and resource usage. Buying an editor alone would leave us maintaining translations, media management, revision recovery, publication permissions, previews, and the surrounding admin UI. A CMS removes most of that editorial work. It adds one service to operate and a small integration to maintain; it does not remove all blog development.

Do not commit to deployment based on vendor memory minima. If the host cannot accommodate one CMS process safely, retain the backend and make a narrow in-house improvement instead. Do not build two editorial backends in parallel.

## What the code actually does

- **Editorial UI:** [BlogPostCreateEditForm.tsx](/home/cassi/projects/game-node-clients/apps/admin/src/components/blog/BlogPostCreateEditForm.tsx:32) owns title, tags, cover upload, draft state, game selection, and rating. Saving is manual; there is no autosave or revision recovery in this form. [BlogPostEditor.tsx](/home/cassi/projects/game-node-clients/apps/admin/src/components/blog/editor/BlogPostEditor.tsx:28) wraps Mantine/Tiptap, serializes HTML, and uploads pasted/dropped images through the community-post upload endpoint. The editor technology itself is established; the custom workflow around it is the maintenance burden.
- **Persistence:** [BlogPost](/home/cassi/projects/game-node-server/src/blog/blog-post/entity/blog-post.entity.ts:20) stores one title/body and one draft flag per UUID, linked to a GameNode profile, tags, cover image, and optional game review. There is no locale, translation group, slug, excerpt, publication timestamp, or revision model in these blog entities. `createdAt` is used for ordering and display.
- **API:** [BlogPostController](/home/cassi/projects/game-node-server/src/blog/blog-post/blog-post.controller.ts:36) exposes public list/detail/tags plus role-protected writes. Listing accepts tag, draft inclusion, and pagination, with no language parameter. Review identity depends on both a literal `review` tag and review metadata.
- **Clients:** [shared hooks](/home/cassi/projects/game-node-clients/packages/ui/src/components/blog/hooks/useBlogPosts.ts:21), cards, feeds, archive, detail, review widgets, and home-page carousels serve web and mobile. Detail rendering instantiates a read-only Tiptap editor from HTML. Cover URLs assume the existing S3 filename/extension shape.
- **Existing localization:** [the shared locale package](/home/cassi/projects/game-node-clients/packages/locales/src/i18n.ts:5) supports `en` and `pt-BR`; Next also configures those route locales. This translates interface labels, not article data. Blog query keys and SSR fetches do not include locale, so changing only the API would still leave incorrect cached content after a language switch.
- **SEO/rendering:** [the web article route](/home/cassi/projects/game-node-clients/apps/web/src/pages/blog/post/[postId]/index.tsx:13) prefetches data server-side, but the article body is rendered by a client-created editor. No article-specific SEO metadata is set in that route. A redesign should render the body in the initial HTML and supply localized title, description, canonical, and alternate-language links.

Two backend findings matter whichever direction we choose:

1. [The author-permission check](/home/cassi/projects/game-node-server/src/blog/blog-post/blog-post.service.ts:125) calls async `checkUserHasRole` without `await`. Its Promise is truthy, so this check does not enforce the intended author/admin restriction. The controller still restricts writes to editorial roles; this is not an anonymous-write finding. Fix it if the existing write path remains active.
2. [Saving a post](/home/cassi/projects/game-node-server/src/blog/blog-post/blog-post.service.ts:162), deleting its previous review, and creating its replacement are separate operations without a surrounding transaction. A later failure can leave a partially updated article/review. Frontend/backend validation also disagrees: three versus ten tags, and a zero rating is accepted by the form but the review DTO declares a positive value. These are source-review findings, not reproduced HTTP tests.

## Why Directus is the first candidate

Directus supplies a relational [translation interface](https://directus.com/docs/guides/content/translations) and [side-by-side translation editing](https://directus.com/docs/guides/data-model/interfaces). Its [WYSIWYG field stores HTML](https://directus.com/docs/guides/data-model/rich-text), which is closer to our current data than converting every article into a new block format. Its current editor uses Tiptap, but that does not guarantee identical supported markup. Test an import/edit/save round trip before accepting migration fidelity.

Its Docker distribution supports MySQL and SQLite, S3-compatible storage, and a single instance without mandatory Redis. The [requirements](https://directus.com/docs/self-hosting/requirements) list a 512 MB container minimum and a recommended configuration with 2 GB; these are vendor guidance, not observed consumption for GameNode. Configure [S3 storage](https://directus.com/docs/configuration/files) with separate CMS credentials and an isolated bucket or prefix. Existing storage can remain self-hosted; no hosted CMS or translation service is required.

**Licensing is a decision gate.** Current documentation describes MSCL licensing and a limited free core, rather than the older blanket BSL advice. The [pricing FAQ](https://directus.com/pricing) says organizations under $5M annual revenue and fewer than 50 employees qualify for a free self-hosted Open Innovation Grant. Verify eligibility, obtain the appropriate grant/key, and record the selected version's terms and limits before adoption. Do not assume eligibility from our infrastructure budget or conflate paid cloud pricing with self-hosting cost. See the [current license](https://directus.com/license).

## Other options considered

**Strapi Community** is the strongest alternative if Directus's license/limits are unacceptable and the host has enough capacity. It is [MIT-licensed and free to self-host](https://strapi.io/hosting), with [free content internationalization](https://docs.strapi.io/cms/features/internationalization). However, its [deployment guidance](https://docs.strapi.io/cms/deployment) lists 2 GB RAM minimum and 4 GB+ recommended. It also requires a project/admin build. It is harder to justify as the first trial under the stated infrastructure constraint. Advanced review workflows/history have separate plan restrictions; do not promise them as Community features.

**Payload** has good TypeScript alignment, [field localization](https://payloadcms.com/docs/configuration/localization), and a [rich-text editor](https://payloadcms.com/docs/fields/rich-text). Its [official adapters](https://payloadcms.com/docs/database/overview) cover PostgreSQL, MongoDB, and SQLite, not MySQL. SQLite avoids a separate database server, but we still take on a code-configured CMS application and HTML/editor-format migration. It is viable, but offers less immediate reuse of our existing storage model than Directus. Do not embed it into the existing Pages Router apps merely to avoid a separate process without checking its Next integration requirements.

**WordPress** is credible if writers strongly prefer its publishing experience. It is [GPL-licensed](https://wordpress.org/about/license/) and can reuse MySQL infrastructure. It would add PHP operations, translation-plugin maintenance, and custom game-review/author integration. Polylang has a free language endpoint, while its documented [post translation REST integration](https://polylang.pro/documentation/support/developers/rest-api/) is a Pro feature. Do not assume the complete headless multilingual workflow is free. This is a fallback worth a writer trial, not the smallest default integration for this stack.

**Ghost** has an appealing writing experience, but its [official multilingual guidance](https://ghost.org/docs/faq/translation/) recommends separate installations for different language content or external translation services for equivalent content. That is a poor fit for linked translations on limited self-hosted infrastructure.

**Improving the in-house system** adds no CMS process and preserves current integrations. The smallest version would retain Tiptap, introduce a `blog_post_translation` table keyed by article/locale, add independent translation publication states, autosave/recovery, and locale-aware reads. This still leaves us owning the authoring experience. Choose it only if CMS resource/licensing/editorial trials fail; avoid implementing a general-purpose CMS.

## Proposed ownership and content model

Editors use a dedicated self-hosted CMS origin. Public web/mobile clients continue to call NestJS. NestJS queries the CMS over the private service network using a read-only, published-content policy and returns a small GameNode response. No CMS admin token reaches a client. Keep separate staff CMS accounts initially; public GameNode authentication stays in Better Auth. Custom SSO is outside the initial scope.

CMS-owned article data:

- A stable article UUID; existing IDs can be retained during import.
- Shared author reference, cover, stable tag identifiers, optional `gameId` and rating.
- Translation records with unique `(articleId, locale)`, title, HTML body, excerpt, localized image alt text, draft/published status, and publication date.

Start with existing UUID routes to avoid requiring slug migration. Keep stable `review` tag identifiers for existing filters even if display labels become localized. Game-review facts belong to the article rather than being duplicated across language variants.

GameNode remains authoritative for game records and public profiles. Store their identifiers in CMS metadata; do not connect Directus to the application database or give it write access to game/profile tables. Configure basic constraints in the CMS and validate external references before publication, using a small hook only where configuration cannot do it. Provide a game lookup/autocomplete through the existing API rather than copying the game catalog into the CMS. Preserve author attribution independently of CMS login identity.

For delivery, accept an explicit locale and return `requestedLocale`, `resolvedLocale`, and published `availableLocales`. If a requested translation is missing or unpublished, fall back to a complete published English translation, visibly identifying the fallback; never mix individual fields across languages or return draft text. If no published fallback exists, omit from lists and return not found on detail. Apply the same selection rule before pagination/counting, with one list entry per article. Validate supported locale values at the API boundary.

Add locale to every blog query/cache key, including SSR prefetches and home-page feeds. Use the Next route locale on web and the shared language preference on mobile. Retain mobile UUID deep links. Render supported sanitized HTML with shared typography/image handling instead of loading the full editing runtime for reading. Preserve links, images, lightbox behavior, accessibility, and safe URL handling; changing to raw HTML without a sanitization boundary is not acceptable.

Draft previews use a separate authenticated, non-cacheable path. CMS permissions must restrict unpublished translation records as well as parent articles; [Directus public reads do not automatically mean published-only](https://directus.com/docs/guides/auth/access-control). Cover and inline images require an explicit visibility policy too: hiding article text does not make already-public media private.

## Infrastructure fit and limits of the evidence

[Production Compose](/home/cassi/projects/game-node-server/docker-compose.prod.yml:1) declares two API replicas, two MySQL services, cache Redis, queue Redis, and Manticore. The Redis ceilings are 2 GB and 20 GB; ceilings are not reserved or observed RAM. No reliable available-memory inventory is checked in. An OpenSpec design mentions a future 4-vCPU/8-GB machine, explicitly not an available server; it is not evidence of current headroom.

The checked-in database image is MySQL 8.3, while Directus documents LTS database support. Confirm compatibility against the pinned CMS version. Use a dedicated CMS database/user on a supported existing MySQL server only if compatible. Otherwise trial a persistent SQLite volume for this single-instance editorial service; do not upgrade the application's MySQL just to make the CMS trial work. Back up the content database and assets together and test restoration.

Start with one pinned CMS container, no CMS-specific Redis, no Kubernetes, no background translation workers, and no local AI model. Limit upload sizes and image transformations, retain bounded revisions/logs, and avoid repeated image transformation on public reads. Short-lived cached reads can use the existing application cache; locale and publication visibility must be part of the cache boundary. Expiry must bound how long an unpublished article remains visible. Avoid content synchronization jobs and duplicated writable article tables.

The trial must measure startup, idle usage, writing in two languages, image upload/processing, concurrent public reads, and behavior alongside representative API/import/search activity. Watch host available memory, swap/OOM events, database load, and API responsiveness. An editor process that starts within 512 MB is not proof the deployment is safe. If safe headroom is absent, use the in-house fallback.

## Smallest staged migration

1. **Prove the workflow:** on isolated local infrastructure, create an English article, Portuguese translation, and game review; import a representative existing HTML article. Have an actual writer exercise images, recovery/versioning, and independent publication. Confirm licensing, selected database support, and measured resource fit.
2. **Build one vertical slice:** CMS content through NestJS to one web/mobile detail view, including locale fallback, draft denial, media URLs, game/author resolution, and SSR body output. Use a deliberately small public DTO; regenerate `@repo/wrapper` from the backend rather than hand-editing generated types.
3. **Migrate and reconcile:** export all existing posts, drafts, authors, tags, review facts, dates, and image references. Assign each article's actual source language; do not assume every existing post is English. Preserve originals and media, make imports repeatable by stable ID, and compare counts plus representative renderings. Inventory content volume before estimating migration effort.
4. **Complete callers:** update shared detail/layout/cards/feeds/archive/tags/home carousels; web routes, SSR metadata and error responses; mobile language switching/deep links; admin navigation; generated exports and API fixtures. Remove old create/edit/delete controls and endpoints only after all clients use the new ownership model. Keep community posts and their upload/editor dependencies intact.
5. **Cut over once:** freeze old editorial writes, import the final changes, switch reads, verify published/draft behavior, and retain a restorable backup. Before new CMS edits, rollback can switch reads back. After edits begin, rollback needs reconciliation/export of those edits; the old database is no longer current.

Acceptance checks should cover anonymous draft access (including missing translations), per-language publication/fallback, pagination without duplicated articles, locale cache isolation, game-review validation, safe HTML/image round trips, old UUID links, SSR article content, staff preview permissions, and backup restoration. Do not spend effort testing generated types against themselves.

## Decision still needed after investigation

The recommended next step is a small Directus trial, not a full rewrite. Adoption depends on three facts not established here: the real infrastructure headroom, the staff/license eligibility, and whether writers find its configured authoring workflow substantially better. If it passes, the CMS approach removes more owned software than it adds. If it fails, improve the current editor and translation model narrowly.

No application code, deployment, live data, or OpenSpec artifacts were changed. No CMS was installed, workload benchmark run, HTTP exploit reproduced, or production backup restored. Current official documentation was checked; future licensing/version changes and migration markup loss remain risks to verify during the trial.
