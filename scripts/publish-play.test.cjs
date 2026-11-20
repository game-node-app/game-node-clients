const assert = require("node:assert/strict");
const { generateKeyPairSync } = require("node:crypto");
const { test } = require("node:test");
const { publishBundle, RELEASE_NOTES } = require("./publish-play.cjs");

function mockPlay({ existing = [], uploadedCode = 107 } = {}) {
  const calls = [];
  const request = async (url, options = {}) => {
    calls.push({ url, method: options.method || "GET", body: options.body });
    if (url.startsWith("https://oauth2.googleapis.com/token"))
      return Response.json({ access_token: "token" });
    if (url.endsWith("/edits") && options.method === "POST")
      return Response.json({ id: "edit1" });
    if (url.endsWith("/edits/edit1/bundles") && options.method === "GET")
      return Response.json({
        bundles: existing.map((versionCode) => ({ versionCode })),
      });
    if (url.includes("/upload/") && url.includes("/bundles"))
      return Response.json({ versionCode: uploadedCode });
    if (url.includes("/tracks/production")) return Response.json({});
    if (url.endsWith("/edits/edit1:commit")) return Response.json({});
    throw new Error(`Unexpected request ${options.method} ${url}`);
  };
  return { calls, request };
}

const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const config = {
  credentials: {
    client_email: "ci@example.iam.gserviceaccount.com",
    private_key: privateKey.export({ type: "pkcs8", format: "pem" }),
  },
  bundle: Buffer.from("aab"),
  versionCode: "107",
};

test("publishes a completed production release with generic notes", async () => {
  const { calls, request } = mockPlay();
  await publishBundle(config, request);
  assert.ok(calls.some((c) => c.url.includes("/upload/")));
  const track = calls.find((c) => c.url.includes("/tracks/production"));
  assert.deepEqual(JSON.parse(track.body).releases, [
    {
      versionCodes: ["107"],
      status: "completed",
      releaseNotes: [
        { language: "en-US", text: RELEASE_NOTES["en-US"] },
        { language: "pt-BR", text: RELEASE_NOTES["pt-BR"] },
      ],
    },
  ]);
  assert.ok(calls.at(-1).url.endsWith(":commit"));
});

test("retries reuse an already uploaded bundle", async () => {
  const { calls, request } = mockPlay({ existing: [107] });
  await publishBundle(config, request);
  assert.ok(!calls.some((c) => c.url.includes("/upload/")));
  assert.ok(calls.at(-1).url.endsWith(":commit"));
});

test("refuses a bundle with an unexpected version code before committing", async () => {
  const { calls, request } = mockPlay({ uploadedCode: 98 });
  await assert.rejects(publishBundle(config, request), /version code 98/);
  assert.ok(!calls.some((c) => c.url.endsWith(":commit")));
});
