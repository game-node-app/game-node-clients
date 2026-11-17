---
"mobile": patch
"web": patch
---

The game page actions are one shared component now. Mobile gets the reworked layout: the add/update split button spans a full row, and favorite, cover, visibility and share sit on one row that never wraps, with "Remove from library" behind the More actions menu. Icon buttons are labelled for screen readers, and the favorite button stays visible (but inactive) when the game is not in the library. On touch screens, visibility keeps its own button because the More actions submenu depends on hover; on web the submenu is unchanged. Sharing still opens the native sheet on mobile — it is injected through the new `shareFile` hook registry — and dismissing the share sheet no longer shows an error.
