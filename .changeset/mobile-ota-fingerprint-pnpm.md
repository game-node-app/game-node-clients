---
"mobile": patch
---

Restore OTA updates for installed apps: the pnpm migration changed the native fingerprint, so the Recap and Awards update never reached devices installed before it. The fingerprint now ignores the node_modules layout, so those devices receive the update again.
