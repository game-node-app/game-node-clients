# Local authenticated browser testing

The clients only offer OAuth sign-in. For local browser testing, a temporary Better Auth session can be created against the **local development** database without an OAuth provider. This creates persistent test users, roles, profiles and libraries in the local databases. Do not point it at a shared or production database. The helper below grants editor or moderator access to anyone who can reach its loopback port; stop it immediately after testing and never deploy it.

1. Start the local MySQL and API using `game-node-server`'s development configuration (`yarn start:dev:docker`). Start the clients on `localhost:3001` (admin), `localhost:3000` (web) and `localhost:3002` (mobile web). Apply the relevant server migrations first. The helper reads the server checkout's `.env` (`BETTER_AUTH_SECRET` and the `DB_*` values); verify that they are local before running it. The server's `.env` must also list the client origins in `TRUSTED_ORIGINS` (see `.env.example`).
2. From the `game-node-server` root, save the following as `.tmp/browser-login.mjs` and run `node .tmp/browser-login.mjs`. It uses dependencies already installed in that checkout.

```js
import "dotenv/config";
import http from "node:http";
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { serializeSignedCookie } from "better-call";
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
  timezone: "Z",
});
// Same secret, database and id format as the API, so it accepts the session this creates.
const auth = betterAuth({
  baseURL: process.env.DOMAIN_API,
  basePath: "/v1/auth",
  secret: process.env.BETTER_AUTH_SECRET,
  database: pool,
  advanced: { database: { generateId: "uuid" } },
  plugins: [admin()],
});
const REDIRECTS = {
  editor: "http://localhost:3001/dashboard/achievement/definitions",
  mod: "http://localhost:3001/dashboard/achievement/definitions",
  admin: "http://localhost:3001/dashboard/home",
  player: "http://localhost:3002/preferences",
};

http
  .createServer(async (req, res) => {
    try {
      const who = req.url.slice(1);
      if (!(who in REDIRECTS)) return res.writeHead(404).end();
      const ctx = await auth.$context;
      const email = `browser-${who}@example.invalid`;
      const user =
        (await ctx.internalAdapter.findUserByEmail(email))?.user ??
        (await ctx.internalAdapter.createUser({
          email,
          name: `browser-${who}`,
          emailVerified: true,
          role: who === "player" ? "user" : `user,${who}`,
        }));
      await pool.execute(
        "INSERT IGNORE INTO profile (userId, username) VALUES (?, ?)",
        [user.id, `browser-${who}`],
      );
      await pool.execute("INSERT IGNORE INTO library (userId) VALUES (?)", [
        user.id,
      ]);
      const session = await ctx.internalAdapter.createSession(user.id);
      const cookie = await serializeSignedCookie(
        "better-auth.session_token",
        session.token,
        ctx.secret,
        { path: "/", httpOnly: true, sameSite: "lax" },
      );
      res.writeHead(302, { "Set-Cookie": cookie, Location: REDIRECTS[who] });
      res.end();
    } catch (e) {
      console.error(e);
      res.writeHead(500).end("Local login failed");
    }
  })
  .listen(5011, "127.0.0.1", () => console.log("Local test login ready"));
```

3. In the built-in browser, navigate to `http://localhost:5011/editor`, `/mod`, `/admin` or `/player`. The editor and moderator go to the definitions dashboard, the admin to the dashboard home and the player to mobile web preferences. The account names are `browser-editor`, `browser-mod`, `browser-admin` and `browser-player`. An editor can open definitions and events; a moderator should see the access-denied screen on those routes, and so should `/player` on any admin route.
4. For simulation, the user picker uses the public user-search index. New profiles may take up to an hour to appear; refresh it locally with `docker compose exec -T -u manticore manticore /bin/bash /etc/manticoresearch/reindex.sh users` from the server checkout.
5. Stop the helper and delete the temporary file. Test users and any reviews, events, achievements, notifications and comments made during testing remain in the development databases; remove only the test data you no longer need.

Better Auth reads the session from the signed `better-auth.session_token` cookie, which the helper writes with the same `better-call` signing the API uses. The cookie is local to `localhost` and shared across its ports; the API and clients are same-site, so the clients' `credentials: "include"` requests carry it. If the API is served over HTTPS, Better Auth expects the `__Secure-` prefixed cookie name instead.

The following feed is cached for five minutes per user and request. If a test follows someone after loading an empty feed, allow the cache to expire before judging the result. The cache can otherwise hide existing activities temporarily.
