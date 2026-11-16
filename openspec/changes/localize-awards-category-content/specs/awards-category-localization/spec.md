# Spec Delta

## Purpose

Defines how web and mobile show Awards category names and descriptions in the user's interface language, and how the admin app writes per-locale category content.

## ADDED Requirements

### Requirement: Category content follows the interface language
Wherever web or mobile show an Awards category's name or description, they SHALL show the translation whose `locale` matches the current interface language (`en` or `pt-BR`). When there is no matching translation (an empty or missing `translations` array), they SHALL show the base `name` and `description`. The name and the description SHALL come from the same source, so a locale entry is never mixed with base text.

#### Scenario: English user with an English translation
- **WHEN** the interface language is `en` and a category has an `en` translation
- **THEN** the ballot, nominations, shared ballot, results and category list show the `en` name and description

#### Scenario: Missing translation falls back
- **WHEN** the interface language is `en` and a category has only a `pt-BR` translation
- **THEN** the category's base `name` and `description` are shown

#### Scenario: Category without translations
- **WHEN** a category's `translations` is empty, or missing because the server is older
- **THEN** the base `name` and `description` are shown, as before this change

#### Scenario: Switching language
- **WHEN** the user switches the interface language from `en` to `pt-BR` while on an Awards page
- **THEN** category names and descriptions update to the `pt-BR` entry, or to the base text, without reloading the data

### Requirement: Interpolated copy uses the localized name
Interface strings that embed a category name SHALL use the localized name. Examples are the ballot vote bar's "Your vote in {category}" and "Confirm and go to {next}".

#### Scenario: Vote bar in English
- **WHEN** the interface language is `en`, the active category has an `en` translation, and so does the next category
- **THEN** the vote bar text uses both `en` names

### Requirement: Admins edit per-locale content
The admin category form SHALL offer optional English and Portuguese (`pt-BR`) name and description fields next to the required base name and description, prefilled from the category's `translations` when an existing category is edited. On save, the form SHALL send `translations` as the full array of locales whose two fields are filled, so a locale left empty is removed and all empty sends `[]`.

#### Scenario: Edit prefill
- **WHEN** an admin opens an existing category that has an `en` translation
- **THEN** the English fields show the stored values

#### Scenario: Save both locales
- **WHEN** an admin fills in English and Portuguese names and descriptions and saves
- **THEN** the request contains `translations` with an `en` item and a `pt-BR` item

#### Scenario: Clearing translations
- **WHEN** an admin empties every translation field of a category that had translations and saves
- **THEN** the request sends `translations: []`, and later reads show the base text

### Requirement: Admin blocks incomplete locales
The admin category form SHALL block submission when a locale has exactly one of its two fields filled, showing a validation message on the empty field.

#### Scenario: Incomplete locale blocked
- **WHEN** an admin fills the English name but leaves the English description empty
- **THEN** the form does not submit and shows an error on the English description

### Requirement: Admin shows translation coverage
The admin category list for an event SHALL indicate, for each category, which locales (`en`, `pt-BR`) have translations, so missing content is visible before voting opens.

#### Scenario: Partially translated event
- **WHEN** an event has a category with only a `pt-BR` translation
- **THEN** the admin list marks `en` as missing for that category
