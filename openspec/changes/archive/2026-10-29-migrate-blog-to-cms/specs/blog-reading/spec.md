## Purpose

Provide consistent localized blog reading on web and mobile with accessible article presentation and server-rendered discoverability.

## ADDED Requirements

### Requirement: Locale-aware reads and caches
Every blog list, detail, tag and home-feed read SHALL send the web route locale or mobile language preference and isolate cached results by that locale. SSR hydration SHALL use the same query identity as client reads.

#### Scenario: Switch language on an article
- **WHEN** a reader changes from English to Portuguese
- **THEN** the article and surrounding feeds/tags request `pt-BR` without showing cached English as if it were a Portuguese translation

#### Scenario: Hydrated page
- **WHEN** a Portuguese web article is rendered on the server and hydrated
- **THEN** the client reads the same locale-specific cached response without replacing it with an English request

### Requirement: Visible whole-article fallback
Readers SHALL render the API-selected translation without composing fields from different languages, show a localized fallback notice when requested and resolved locales differ, and mark the article body with its resolved language. Translation links SHALL target only published available locales.

#### Scenario: Portuguese unavailable
- **WHEN** the API resolves a Portuguese request to published English
- **THEN** English title/body/description are shown together with a translated fallback notice and the article language is English

### Requirement: Safe accessible article presentation
Readers SHALL render server-sanitized HTML without an editing runtime and support typography, safe links, responsive images, alt text, keyboard-accessible image expansion, author attribution, stable tags, review facts and selected publication date. Media SHALL use explicit API URLs.

#### Scenario: Illustrated review
- **WHEN** a CMS-authored review is opened on web or mobile
- **THEN** headings/lists/links render, images load with alt text and accessible expansion, and author/game/rating are available

### Requirement: Server-rendered article content and localized SEO
Web detail routes SHALL include the article body in initial HTML and provide selected-language title/description, a canonical URL for the resolved translation and alternate links only for published locales. Missing eligible content SHALL return HTTP 404; upstream failures SHALL render an error with HTTP 503.

#### Scenario: View source without JavaScript
- **WHEN** a published localized article is fetched without executing JavaScript
- **THEN** its body and localized metadata are present in the HTML

#### Scenario: Fallback canonical
- **WHEN** the Portuguese route resolves to English fallback
- **THEN** canonical points to the English article route and no Portuguese alternate advertises an unpublished translation

#### Scenario: Missing article versus unavailable service
- **WHEN** the API returns 404 or 503
- **THEN** the web route returns the corresponding status and an appropriate missing-content or service-error page

### Requirement: Article navigation and read states
Web and mobile SHALL navigate to article detail by UUID. Lists and details SHALL distinguish loading, empty, missing and failed requests; retry SHALL remain possible for service errors.

#### Scenario: Mobile article navigation
- **WHEN** a reader opens an article from a mobile blog list
- **THEN** detail loads that article's UUID using the current language preference
