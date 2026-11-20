---
"web": minor
"mobile": minor
---

Ship the changes merged in #151 and #153, whose releases did not run because main's checks were failing:

- Redesign the home "Trending games" section with a featured game spotlight (blurred screenshot background, large cover, summary) and a selector of smaller covers that rotates every 10 seconds. The spotlight keeps a fixed height, pauses while focused and has a pause button; the Explore trending shelf uses the same style and both show a retry when loading fails.
- Add the Aura Story template to Wrapped, ported from Echo: a brand-colored glow on the dark ground behind a tilted row of the top covers, the hours as a large accent figure and four panel tiles.
- Improve text contrast on brand-orange controls: filled buttons, icons and indicators now use dark text (5.3:1 instead of 3.6:1), and light badges use a slightly lighter orange that reaches 4.5:1.
- Mobile: redesign GameNode + IA, Posts, Achievements, Stats, Journal and Reviews screens with the grouped-card style used in Settings, with the same 16px margins on every screen. GameNode + IA now starts on Claude.ai, with terminal assistants under "Other assistants". Journal months follow the app language.
- Mobile: redesign the Settings screen: four grouped cards (Account, Library & display, Platforms & import, Apps & tools) with icon rows, a violet supporter entry and 44px connection actions.
- Web: parity with mobile: localised month names, an empty state and an "add a game" shortcut in the journal, loading and empty states in the posts feed, gray/green library stats chart with a legend, a friendly retry message when a platform connection fails to load, and readable dark text on orange chips and segmented controls.
