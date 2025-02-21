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
Each project root directory contains a `README.md` file with instructions on how to set everything up for local development.
- Have the latest LTS version of `NodeJS`  
- Install yarn globally  
- Run `yarn install` at the root directory  
- Use `yarn dev` to start all client apps  
Alternatively, start a single client app by using a turbo repo filter:  
`yarn dev -F [project]` where `[project]` is the project's name.  
E.g.: `yarn dev -F web` or `yarn dev -F mobile`  
