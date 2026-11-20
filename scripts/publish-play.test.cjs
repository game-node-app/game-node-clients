const assert = require("node:assert/strict");
const { generateKeyPairSync } = require("node:crypto");
const { test } = require("node:test");
const { publishBundle, RELEASE_NOTES } = require("./publish-play.cjs");

function mockPlay({ existing = [], uploadedCode = 107, releases = [] } = {}) {
  const calls = [];
  const request = async (url, options = {}) => {
    calls.push({ url, method: options.method || "GET", body: options.body });
    if (url.startsWith("https://oauth2.googleapis.com/token"))
      return Response.json({ access_token: "token" });
    if (url.endsWith("/tracks/production/releases") && options.method === "GET")
      return Response.json({ releases });
    if (url.endsWith("/edits") && options.method === "POST")
      return Response.json({ id: "edit1" });
    if (url.endsWith("/edits/edit1/bundles") && options.method === "GET")
      return Response.json({
        bundles: existing.map((versionCode) => ({ versionCode })),
      });
    if (url.includes("/upload/") && url.includes("/bundles"))
      return Response.json({ versionCode: uploadedCode });
    if (url.endsWith("/tracks/production") && options.method === "PUT")
      return Response.json({});
    if (url.endsWith("/edits/edit1:commit")) return Response.json({});
    throw new Error(`Unexpected request ${options.method} ${url}`);
  };
  return { calls, request };
}

const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const fingerprint = "0123456789abcdef";
const otherFingerprint = "fedcba9876543210";
const config = {
  credentials: {
    client_email: "ci@example.iam.gserviceaccount.com",
    private_key: privateKey.export({ type: "pkcs8", format: "pem" }),
  },
  bundle: Buffer.from("aab"),
  versionCode: "107",
  fingerprint,
};

function release(versionCode, fingerprint, state = "PUBLISHED") {
  return {
    releaseName: fingerprint
      ? `${versionCode} (native ${fingerprint})`
      : "1.0.0",
    releaseLifecycleState: `RELEASE_LIFECYCLE_STATE_${state}`,
    activeArtifacts: [{ versionCode }],
  };
}

test("sets the fingerprint baseline with a full production release and generic notes", async () => {
  const { calls, request } = mockPlay({ releases: [release(106)] });
  assert.equal(await publishBundle(config, request), true);
  assert.ok(calls.some((c) => c.url.includes("/upload/")));
  const track = calls.find((c) => c.url.endsWith("/tracks/production"));
  assert.deepEqual(JSON.parse(track.body).releases, [
    {
      name: `107 (native ${fingerprint})`,
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

test("a JS-only release skips Play without opening an edit", async () => {
  const { calls, request } = mockPlay({
    releases: [release(106, fingerprint)],
  });
  assert.equal(await publishBundle(config, request), false);
  assert.equal(calls.length, 2);
  assert.ok(calls.at(-1).url.endsWith("/tracks/production/releases"));
});

test("a retry skips a matching release already in review", async () => {
  const { calls, request } = mockPlay({
    releases: [
      release(106, otherFingerprint),
      release(107, fingerprint, "IN_REVIEW"),
    ],
  });
  assert.equal(await publishBundle(config, request), false);
  assert.ok(!calls.some((c) => c.url.includes("/edits")));
});

test("a native change is published even if an older release had the same fingerprint", async () => {
  const { calls, request } = mockPlay({
    releases: [release(105, fingerprint), release(106, otherFingerprint)],
  });
  assert.equal(await publishBundle(config, request), true);
  assert.ok(calls.some((c) => c.url.includes("/upload/")));
  assert.ok(calls.at(-1).url.endsWith(":commit"));
});

test("a rejected release with a matching fingerprint does not suppress an upload", async () => {
  const { request } = mockPlay({
    releases: [
      release(105, otherFingerprint),
      release(106, fingerprint, "NOT_APPROVED"),
    ],
  });
  assert.equal(await publishBundle(config, request), true);
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
