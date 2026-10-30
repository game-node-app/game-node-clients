# Design

## Context

See [proposal.md](proposal.md) and [the investigation](../../../docs/blog-redesign-investigation.md). The user confirms there are no live users or existing blog records. Replace the internal authoring directly; no released clients or content need migration.

Shared hooks omit locale; detail/tags use infinite staleness. Web prefetch duplicates keys, and `BlogPostDetailView` creates a read-only Tiptap editor with `immediatelyRender: false`. Cards/list items construct S3 URLs from entity metadata. Admin forms and shared cards use internal mutations. Existing focused tests use the mobile Vitest runner; wrapper generation reads the checked-in server OpenAPI snapshot. Community editors still need their existing dependencies.

## Goals / Non-Goals

**Goals:** use one localized API contract across web/mobile, render articles in initial web HTML and give staff CMS navigation plus private preview.

**Non-Goals:** compatibility fields/routes, content import, cache upgrades, polling, staged deployment, client CMS SDK/admin credentials, custom SSO and community-editor changes.

## Decisions

### 1. Consume the server's clean contract

The [server design](../../../../game-node-server/openspec/changes/migrate-blog-to-cms/design.md) owns CMS selection and delivery. Both repository-local changes use the same name with linked tasks. Server publishes OpenAPI and clients regenerate the wrapper from actual output rather than hand-editing generated code.

The API uses `blog/post` list/detail/tags with locale and the existing pagination envelope. Article data includes UUID, title, sanitized `content`, excerpt, explicit cover URL/alt, publication date, stable tags, GameNode author identity, optional shared game/rating facts and requested/resolved/available locales. Consume those fields directly. Remove entity-shaped image metadata and public draft-inclusion arguments instead of adapting them.

### 2. Locale belongs in requests and query identity

Use Next route locale on web and the existing shared language preference on mobile. Supply it to shared detail/list/tag hooks and SSR through the same small query-options/key definitions. Keys include locale and the article ID or list filters; no cache-version marker or migration hook is needed. Update every blog detail/layout/sidebar/feed/archive/home caller and direct prefetch.

Use the normal query lifecycle with finite freshness and refetch on mount/focus/reconnect; remove blog-specific infinite staleness. No interval refetch or custom offline-revocation workflow. Query identity isolates languages, while preview bypasses public and persisted caches. The fallback notice is localized UI, the article body uses `lang=resolvedLocale`, and translation links use only published available locales. Never mix translation fields.

### 3. Render safe HTML with existing presentation components

Render the backend-sanitized HTML in the shared detail view using current typography and responsive images. Remove reading-only Tiptap initialization and imports. Adapt the existing image expansion context to the rendered images, including keyboard focus/activation and alt text. The server sanitizes content/URLs; the renderer accepts only that blog DTO and does not reintroduce unsafe dynamic URLs.

Cards, featured/review cards and list items use explicit cover URLs/alts, excerpts and publication date. Keep author/game widgets. Leave the shared S3 helper and editor dependencies required by community authoring in place. Test with newly authored CMS English/Portuguese articles, reviews and images rather than an imagined import corpus.

### 4. SSR and metadata use the selected localized response

Update `apps/web/src/pages/blog/post/[postId]/index.tsx` to fetch with Next locale and shared query options. Use a throwing fetch, return Next `notFound` on API 404 and an error view with HTTP 503 on CMS failure. Dehydrate only published data. The shared HTML renderer produces the article body during SSR without an editor effect.

Use existing SEO conventions for title, excerpt description, language, canonical and alternates. Canonical targets the resolved locale using Next's default-locale URL convention; alternates list only published locales. Keep the current UUID route structure on web/mobile as the natural article navigation without redirects or compatibility routes.

### 5. Replace admin authoring with CMS navigation and preview

Admin blog navigation links to the configured staff CMS origin. Delete the internal blog list/create/edit/detail editor pages and components, shared write actions, unused exports and draft-inclusion callers. There is no bookmarked-route handoff or temporary internal writer. CMS accounts use separate login.

Add `/dashboard/blog/preview/[postId]?locale=...` for existing editorial GameNode roles. Fetch the exact-locale preview API client-side with no-store and local state; do not use public/persisted query hooks or draft SSR hydration. Clear content on identity/locale changes or authorization failure. Set private no-store and no-index headers/metadata. Reuse article presentation with explicit preview data/draft state. CMS can open this route without credentials in the URL; GameNode session authorization and backend-protected media handle access.

## Risks / Trade-offs

- CMS trial fails licensing, resources or writer acceptance → stop adoption and revise the choice before completing integration.
- Markup or accessible image behavior regresses → test CMS-authored bilingual articles, reviews and image round trips on both clients.
- SSR and client locale identity differ → share query options and test hydration/language switching with distinct translations.
- Draft content leaks → test preview authorization, identity changes and exclusion from public HTML/hydration/persistence.

## Implementation Plan

1. Participate in the server's CMS trial using new test content.
2. Regenerate the wrapper from the new contract; implement localized hooks and one web/mobile detail slice with SSR.
3. Update all reader callers, CMS navigation and private preview; delete internal forms/routes/actions.
4. Verify the paired server/client result and relevant builds before launch.
