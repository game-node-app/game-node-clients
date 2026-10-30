# Proposal

## Why

Shared blog readers ignore article locale, render bodies through an editing runtime and depend on internal authoring. Follow `docs/blog-redesign-investigation.md` to keep GameNode's web/mobile presentation while a self-hosted CMS owns writing. The project is not live, has no current users and has no blog data; compatibility and content migration are unnecessary.

## What Changes

- Consume a clean CMS-backed NestJS contract through regenerated `@repo/wrapper` services, models and exports.
- Include `en`/`pt-BR` locale in blog requests, query keys and web SSR prefetches; show when published English is selected as a complete fallback.
- Render sanitized HTML with shared typography, accessible media, author attribution and review widgets, and use explicit API cover URLs.
- Render article bodies in initial web HTML with localized metadata, canonical/alternate links and proper missing/error responses.
- **BREAKING:** delete internal blog admin forms/routes and shared write controls. Link admin navigation to the CMS and provide a separate protected preview.

## Capabilities

### New Capabilities

- `blog-reading`: localized web/mobile reads, locale cache isolation, fallback, accessible HTML/media, SSR and SEO.
- `blog-editorial-access`: CMS navigation, removal of internal authoring and protected non-cacheable preview.

### Modified Capabilities

None. This repository has no main capability specifications yet.

## Impact

- `packages/wrapper/input/server_swagger.json` and generated services/models/exports; shared blog hooks, cards, lists, feeds, archives, review widgets, home carousels and barrel exports; localized labels/types.
- Web routes/SSR, mobile blog readers, admin navigation and preview; remove internal blog form/editor routes and components. Preserve community editors and uploads.
- Counterpart: [server proposal](../../../../game-node-server/openspec/changes/migrate-blog-to-cms/proposal.md). Server owns the CMS and API; clients owns consumption/presentation. Both are updated before launch.
- No old-client adapters, bookmarked-route handoffs, persisted-cache upgrades, polling or staged deployment. No custom SSO, slug system, automatic translation or general visual redesign.
