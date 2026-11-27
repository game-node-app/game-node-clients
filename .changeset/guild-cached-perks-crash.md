---
"mobile": patch
---

Fix the Guild hall crashing when the persisted query cache still holds an overview from before the Guild expansion. Missing `license.perks` now falls back to the rank E–C contract cap instead of throwing, and the hall keeps rendering while it refetches.
