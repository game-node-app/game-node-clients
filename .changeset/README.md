# App releases

Run `yarn changeset` and explicitly select `web`, `admin`, and/or `mobile`.
Shared packages do not authorize app releases. Every PR needs a new changeset;
use `yarn changeset --empty` to intentionally release nothing.

See [the release guide](../docs/releases.md) for CI, versions, delivery, and retries.
