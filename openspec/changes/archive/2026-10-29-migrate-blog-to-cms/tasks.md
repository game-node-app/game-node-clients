# Tasks

Paired initiative: [server tasks](../../../../game-node-server/openspec/changes/migrate-blog-to-cms/tasks.md). The project has no live users or blog data. Both repositories consume the new contract before launch; no compatibility or data-preservation work is required.

## 1. Trial participation and generated contract

- [x] 1.1 Participate in the server's bilingual writer/image/revision trial using new CMS articles; record web/mobile HTML rendering results and confirm the adoption checks pass.
- [x] 1.2 Replace the wrapper OpenAPI input with actual server output and regenerate services/models/exports using `yarn wrapper:generate`; verify generated clients fetch the new public and preview contract without internal mutation methods or entity-shaped compatibility fields.
- [x] 1.3 Add bilingual published/draft/fallback/media/review/error fixtures for the existing Vitest runner; verify they express observable API scenarios rather than generated-type assertions.

## 2. Locale-aware reads

- [x] 2.1 Update shared detail/list/tag hooks and SSR query options to send explicit locale and use locale-specific keys; test language switching, filtered pagination and hydration with distinct English/Portuguese content.
- [x] 2.2 Remove blog-specific infinite staleness and use the normal query lifecycle without interval refetch; verify loading/empty/missing/error/retry states through focused reader tests.
- [x] 2.3 Add fallback notices, published language links and read-state labels in en/pt-BR, regenerate locale types and verify resolved article language plus published-only links in component tests.

## 3. Shared presentation and callers

- [x] 3.1 Replace the blog detail's read-only editor with server-sanitized HTML using existing styles/image expansion; test SSR-capable markup, keyboard image activation, safe link/media fixtures, alt text and responsive rendering without editor initialization.
- [x] 3.2 Update cards, featured/review cards, list items and detail metadata to use cover URLs/alts, excerpts and publication date; verify author/game/rating/tag presentation using new review fixtures.
- [x] 3.3 Update detail layout/sidebar, feed/archive/tag views, recent/home carousels and all direct blog callers to the localized contract; use component tests, repository search and type checks to catch obsolete entity/cover assumptions.

## 4. Web SSR, SEO and mobile navigation

- [x] 4.1 Update article SSR to fetch with Next locale and shared options; test initial HTML body, locale hydration and real 404/503 responses without swallowed fetch errors.
- [x] 4.2 Add localized metadata, resolved-locale canonical and published-only alternate links using existing SEO conventions; verify bilingual and English-fallback responses without JavaScript.
- [x] 4.3 Update web prefetches and mobile detail/archive/home readers to use the locale-aware contract; verify UUID navigation and language changes select the intended article content.

## 5. CMS navigation and private preview

- [x] 5.1 Link admin blog navigation to the configured CMS origin and delete internal blog list/create/edit/detail editor routes/components plus shared write/draft-inclusion controls and unused exports; verify no internal blog mutations remain and community editors/uploads still work.
- [x] 5.2 Add exact-locale protected admin preview with client-only no-store fetching, private no-store/no-index responses and no public/persisted query caching; test unauthorized denial and absence of draft SSR/hydration/persistence data.
- [x] 5.3 Reuse safe article presentation for preview with actual draft state and authenticated media; test logout, identity/locale changes and failed authorization clear prior preview content.
- [x] 5.4 Document CMS origin configuration, separate staff login and the paired server contract; verify the documented navigation and preview work against the configured CMS/API.

## 6. Integrated acceptance

- [x] 6.1 Run focused Vitest tests and relevant wrapper/UI/web/mobile/admin type/build checks; verify the paired CMS-to-reader result covers locale fallback, reviews/tags/pagination, SSR/SEO, preview denial, safe media and CMS errors using newly authored content.
