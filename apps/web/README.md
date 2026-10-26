# game-node-web
The repository for the web client of Game Node. This is our main site, the one you see at [gamenode.app](https://gamenode.app).


## Contributing
### Installation
1. Install [Node.js](https://nodejs.org/en/download/)
2. Install [Yarn](https://yarnpkg.com/en/docs/install)
3. Run `yarn` in the root directory of the repository
4. Run `yarn dev` to start the development server
5. Check your instance at `http://localhost:3000`

### Setting up your environment
1. Create a `.env.local` file at the root of the project
2. Copy the contents of `.env.local.example` to it
3. **Alternatively**, just run `cp .env.local.example .env.local`  

If you are developing **exclusively** for the web client, you don't need to host your own instance of GameNode. You can instead just point your local client to our server:
1. Replace all instances of `localhost:9000` with `search.gamenode.app`
2. Replace all instances of `localhost:5000` with `server.gamenode.app`

If you need to make changes to any of the backend systems, please refer to their respective repositories for instructions on how to set them up.   
Feel free to reach out to us through Discord to get help setting everything up! Alternatively, open an issue and we will try our best to help.  

### Gaming service connections

Steam and Xbox sign-in return to `/connections/callback/steam` and `/connections/callback/xbox`. Configure the server's `DOMAIN_WEBSITE` for the web origin and `XBOX_OAUTH_REDIRECT_URI` for its Xbox callback URL; register that same URL with Microsoft. These connect gaming accounts to an existing GameNode session.

The setup form and callback screen live in `@repo/ui` and are also used by mobile. Native Android opens provider sign-in in the system browser and handles the callback through its existing GameNode app links. Steam game details must be public for synchronization.

Run the shared connection flow tests with `yarn workspace mobile test.unit --run --threads false`.
