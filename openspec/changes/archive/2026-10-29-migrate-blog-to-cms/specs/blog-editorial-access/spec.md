## Purpose

Direct editorial staff to the CMS and provide isolated draft previews while removing internal blog authoring.

## ADDED Requirements

### Requirement: CMS editorial navigation
Authorized staff SHALL receive a clearly labeled link to the configured CMS origin from admin blog navigation. Public GameNode authentication MUST remain independent of CMS staff login.

#### Scenario: Staff opens blog navigation
- **WHEN** an editorial user selects the admin blog navigation item
- **THEN** it opens the CMS rather than an internal blog editor

### Requirement: Remove internal blog authoring
Clients SHALL remove internal blog creation, editing, cover update, deletion, list/editor routes, public draft-inclusion controls and unused exports. Community-post authoring, editors, uploads and shared dependencies SHALL remain functional.

#### Scenario: Article card
- **WHEN** a blog card is rendered
- **THEN** it offers no internal edit/delete action and makes no internal mutation request

#### Scenario: Community post editing
- **WHEN** a user creates a community post with an image
- **THEN** the existing editor and upload behavior remain available

### Requirement: Authenticated private preview
Staff preview SHALL use a separate authenticated GameNode route and API request scoped by article UUID and exact translation locale. Preview SHALL show draft state, use no public/persisted query cache, send no draft content into SSR hydration, and emit private no-store and no-index responses. CMS admin credentials MUST NOT enter a client bundle or URL.

#### Scenario: Authorized draft preview
- **WHEN** an authenticated editor opens a draft preview in a specified language
- **THEN** only that translation is rendered with a draft label and its content is absent from public/persisted caches

#### Scenario: Unauthorized preview
- **WHEN** a signed-out user or user without editorial privileges follows a preview link
- **THEN** access is denied without draft content in HTML, hydration state or prior preview state
