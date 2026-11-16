# game-node-clients

## Objective
This repository is an effort to turn all GameNode frontend clients (like admin, web and mobile) in a single repo.
This will greatly improve code readability and improve the maintenance process.

## Projects
All actual clients are available in the `apps` folder, which may or may not depend on packages available in the `packages` folder.
This repository uses Turborepo under the hood to power everything up, and while we're not actively using the build cache feature, it still helps us maintain
a pattern on how to structure our applications.

## Structure
### apps
- `apps/admin`
The NextJS admin dashboard project.
- `apps/web`
The main NextJS website, available at [gamenode.app](https://gamenode.app)
- `apps/mobile`
Our multiplatform PWA/Mobile app powered by `Ionic` and `CapacitorJS`.
### packages
- `packages/ui`
A components library that is used by all projects. These components are usually built on top of `mantine`.
- `packages/wrapper`
The OpenAPI -> Typescript schema generation project, which exports automatically generated clients to be used by all client apps (and the ui library).

Everything else under `packages` is to streamline commont tools configuration (e.g. ESLint, Prettier).

This architecture helps us streamline most of our development process by developing shared components and functionality in `packages/ui`.
To maintain compatibility, some components and functions are injected at startup per project (e.g. Modal, Link, and router related hooks).


## Contributing

Every PR needs an explicit release decision. Run `pnpm changeset` and select only
the apps ready to ship, or `pnpm changeset --empty` to release nothing. See the
[release guide](docs/releases.md) for CI, deployment setup, versions, and retries.

Each project root directory contains a `README.md` file with instructions on how to set everything up for local development.
- Use Node.js 24 LTS (minimum 22)
- Enable Corepack with `corepack enable` (the pnpm version is pinned in `package.json`)
- Run `pnpm install` at the root directory
- Run `pnpm wrapper:generate` to generate the API clients
- Use `pnpm dev` to start all client apps
Alternatively, start a single client app by using a turbo repo filter:
`pnpm dev -F [project]` where `[project]` is the project's name.
E.g.: `pnpm dev -F web` or `pnpm dev -F mobile`

## Worktrees

Each worktree has its own workspace links and lockfile. Run
`pnpm install --frozen-lockfile` in each checkout; do not copy or symlink `node_modules` from
another worktree. The shared content-addressable store reuses downloaded package files
between local checkouts. Each checkout keeps its own virtual store and workspace
links so Turbopack can resolve dependencies inside the project root.

```sh
git worktree add ../game-node-clients-feature -b feature/my-change
cd ../game-node-clients-feature
pnpm install --frozen-lockfile
pnpm wrapper:generate
pnpm dev:web
```

On an existing Yarn checkout, remove the old root and workspace `node_modules`
directories once before installing with pnpm. Internal dependencies use
`workspace:*`, and the former Yarn resolutions are in `pnpm-workspace.yaml`.
The global virtual store is disabled because Turbopack requires dependencies
inside its project root. Package files still share the standard pnpm store.
Use `pnpm --filter mobile sync:native` for native synchronization; this keeps
generated Gradle paths and native fingerprints independent of the store location.
