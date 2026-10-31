# Local authenticated browser testing

The admin only offers OAuth sign-in. For local browser testing, a temporary SuperTokens session can be created against the **local development** core without an OAuth provider. This creates persistent test identities, roles, profiles and libraries in the local databases. Do not point it at a shared or production core/database. The helper below grants editor or moderator access to anyone who can reach its loopback port; stop it immediately after testing and never deploy it.

1. Start the local MySQL, SuperTokens and API using `game-node-server`'s development configuration. Start the clients on `localhost:3001` (admin) and `localhost:3000` (web). Apply the relevant server migrations first. The helper reads the server checkout's `.env`; verify that its database and `SUPERTOKENS_CORE_URI` are local before running it.
2. From the `game-node-server` root, save the following as `.tmp/achievement-browser-login.cjs` and run `node .tmp/achievement-browser-login.cjs`. It uses dependencies already installed in that checkout.

```js
require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");
const st = require("supertokens-node");
const ThirdParty = require("supertokens-node/recipe/thirdparty");
const Session = require("supertokens-node/recipe/session");
const Roles = require("supertokens-node/recipe/userroles");
st.init({
  framework: "express",
  supertokens: { connectionURI: process.env.SUPERTOKENS_CORE_URI },
  appInfo: {
    appName: "GameNode",
    apiDomain: "http://localhost:5000",
    websiteDomain: "http://localhost:3001",
    apiBasePath: "/v1/auth",
  },
  recipeList: [ThirdParty.init(), Session.init(), Roles.init()],
});
const app = express();
app.get("/:who", async (req, res) => {
  try {
    const who = req.params.who;
    if (!["editor", "player", "mod"].includes(who)) return res.sendStatus(404);
    const user = await ThirdParty.manuallyCreateOrUpdateUser(
      "public",
      "browser-test",
      "achievement-" + who,
      "achievement-" + who + "@example.invalid",
      true,
    );
    if (user.status !== "OK") throw new Error(JSON.stringify(user));
    const db = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_DATABASE,
    });
    await db.execute(
      "INSERT IGNORE INTO profile (userId, username) VALUES (?, ?)",
      [user.user.id, "browser-" + who],
    );
    await db.execute("INSERT IGNORE INTO library (userId) VALUES (?)", [
      user.user.id,
    ]);
    await db.end();
    for (const role of ["user", ...(who === "player" ? [] : [who])]) {
      await Roles.createNewRoleOrAddPermissions(role, []);
      await Roles.addRoleToUser("public", user.user.id, role);
    }
    req.headers["st-auth-mode"] = "cookie";
    await Session.createNewSession(req, res, "public", user.recipeUserId);
    res.append(
      "Set-Cookie",
      "sFrontToken=" + res.getHeader("front-token") + "; Path=/; SameSite=Lax",
    );
    res.redirect(
      who === "player"
        ? "http://localhost:3000/feats/" + user.user.id
        : "http://localhost:3001/dashboard/achievement/definitions",
    );
  } catch (e) {
    console.error(e);
    res.status(500).send("Local login failed");
  }
});
app.listen(5011, "127.0.0.1", () => console.log("Local test login ready"));
```

3. In the built-in browser, navigate to `http://localhost:5011/editor`, `/player`, or `/mod`. The editor and moderator go to the definitions dashboard; the player goes to their achievements page. The account names are `browser-editor`, `browser-player`, and `browser-mod`. An editor can open definitions and events; a moderator should see access denied on those routes.
4. For simulation, the user picker uses the public user-search index. New profiles may take up to an hour to appear; refresh it locally with `docker compose exec -T -u manticore manticore /bin/bash /etc/manticoresearch/reindex.sh users` from the server checkout.
5. Stop the helper and delete the temporary file. Test users and any reviews, events, achievements, notifications and comments made during testing remain in the development databases; remove only the test data you no longer need.

The `st-auth-mode: cookie` request header is essential: without it SuperTokens returns tokens as headers instead of browser cookies. A top-level redirect does not let the frontend SDK capture the `front-token` response header, so the helper also writes `sFrontToken` as a raw, unescaped cookie. Express's normal cookie encoding escapes its Base64 padding and causes the frontend decoder to fail. All of these cookies are local to `localhost` and shared across its ports.

The following feed is cached for five minutes per user and request. If a test follows someone after loading an empty feed, allow the cache to expire before judging the result. The cache can otherwise hide existing activities temporarily.
