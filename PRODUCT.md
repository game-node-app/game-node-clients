# Product

<!-- impeccable:product-schema 1 -->

This file covers what GameNode is and who it serves. `DESIGN.md` covers how it looks, and `AGENTS.md` covers how the code is set up. It applies to every client in this repo: `apps/web`, `apps/mobile` and `apps/admin`.

## Platform

web

The Android app (Ionic + Capacitor) renders the same `@repo/ui` views as the website and keeps GameNode's own design language instead of adopting Material. iOS is announced as "coming soon" but has not shipped.

## Users

GameNode serves players everywhere, not one market. The interface ships in English and Brazilian Portuguese. It serves three kinds of player equally, and no one of them takes priority over the others:

- **Multi-platform completionist.** Plays across several stores and consoles and wants one accurate record of hours, sessions, achievements and progress.
- **Backlog organizer.** Plans what to play next and keeps a tidy library: statuses, collections, time to beat and a wishlist.
- **Social reviewer.** Comes for ratings, reviews, posts and following friends, and uses the library to support that.

The same person often moves between all three modes, so a surface built for one should not get in the way of the other two.

Secondary audience: the GameNode team uses `apps/admin` to moderate reports and to manage achievements, awards, blog posts, games and users.

## Product Purpose

A player's history is scattered across stores, consoles and spreadsheets. GameNode brings Steam, PlayStation, Xbox, Epic Games, Nintendo and GOG libraries together into one profile that belongs to the player. That profile holds playtime, reviews and achievements, and shows what they're playing and what they've finished.

Success means a player trusts GameNode as the complete record of their gaming life and keeps coming back to it, whether to log, plan, review or see what friends are playing.

## Positioning

- Free to organize. Today the product copy promises that the library, imports, reviews, journal and achievements cost nothing "and will stay that way".
- Open source. All client code is public on GitHub.
- Funded by the community, not by advertising. Supporter subscriptions pay for servers and development. Supporter perks are profile extras (theme, badge and title, video cover, animated avatar border, live Steam status, a place on the Supporters wall) plus unlimited collections.
- A multi-platform sync with playtime and per-platform achievements, combined with a social layer and an AI-assistant connection (MCP).

## Operating Context

- Platform connections and imports (Steam, PSN, Xbox, Epic, Nintendo, GOG). Some of them use step-by-step linking guides (`apps/web/public/img/*-link-guide.*`).
- Day-to-day logging: game statuses (playing, planned, completed, dropped), journal sessions with hours, achievements synced from connected platforms, and XP and levels earned inside GameNode.
- Discovery: Explore (trending by week, month or year, with genre and platform filters), time-to-beat estimates and recommendations.
- Social: following, activity feed, posts, comments, likes and notifications.
- Recurring rituals: GameNode Daily (four games to guess each day, the same for everyone), community Awards voting, and a shareable year-in-review (Recap/Wrapped).
- AI assistants: GameNode connects to Claude, ChatGPT, Codex or Claude Code over MCP, and the user approves every permission.
- Blog: editorial content (an OpenSpec `blog-reading` spec exists) in a long-form reading context.

## Capabilities and Constraints

- Three clients share one UI package. Platform differences go through injected presenters, not forks (see `AGENTS.md`).
- Bilingual. Every user-facing string exists in both `en.json` and `pt-BR.json`, with no hard-coded copy. Layouts must hold up with the longer Portuguese strings.
- Free plan limit: up to 5 collections. The Supporter plan has monthly and yearly billing, can be cancelled in the app, keeps benefits until the end of the paid period, and returns to Free without losing the library.
- Users can export their data and set their library's visibility.
- Undecided: the iOS launch date and scope.

## Brand Commitments

- The name is **GameNode** (one word, capital G and N). The paid tier is called **Supporter** in product copy, even where code and routes say `premium`.
- **No ads and no selling user data.** This is binding. Future work must not add ad slots, sponsored placements or monetization that depends on data.
- Voice in current copy: plain, warm and direct ("Every game you've played deserves a place.", "Help keep GameNode online."). It talks to players as players, not as customers.
- Existing assets: `apps/web/public/img/main-logo.png`, `favicon/`, `og_image.*`, store badges (`google_play_badge_english.png`) and community links (Discord, GitHub, Patreon, X/Twitter).

## Evidence on Hand

- Real product content: live game metadata, community reviews, trending games and Awards results come from the API. Landing and About pages show real community data where they can.
- Product screenshots and mocks: `apps/web/public/img/{about,landing,premium,daily,awards}/`, `mock*.png`, `about_preview_*.png`.
- Not on hand: testimonials, user counts, press coverage and benchmarks. Do not invent any of these.

## Product Principles

1. **The player's record comes first.** Accuracy and completeness of the library, hours and achievements outrank novelty features.
2. **Serve all three modes.** Tracking, planning and socializing are equally valid ways to use GameNode. No surface should treat one of them as secondary.
3. **Support, not paywalls.** Money comes from people choosing to support the project, never from ads, data or hostage features. Supporter perks are presented as thanks, not as unlocks.
4. **Open by default.** Open source, data that can be exported, and permissions the user approves (such as AI access). Build trust by being transparent.
5. **Global and bilingual.** Design for an international audience in English and Portuguese, not for one locale.
