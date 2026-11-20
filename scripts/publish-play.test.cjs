const assert = require("node:assert/strict");
const { generateKeyPairSync } = require("node:crypto");
const { test } = require("node:test");
const {
  releaseNotes,
  publishBundle,
  GENERIC_NOTES,
} = require("./publish-play.cjs");

const changelog = `# mobile

## 1.24.0

### Minor Changes

- c216024: Ship the changes merged in #151:

  - Redesign the trending section.
  - Add the Aura Story template.

### Patch Changes

- c216024: Faster app opening.

## 1.23.0

### Minor Changes

- 6eed7a3: Older entry.
`;

test("release notes use the version's changeset entries in English", () => {
  const notes = releaseNotes(changelog, "1.24.0");
  assert.equal(
    notes["en-US"],
    "• Redesign the trending section.\n• Add the Aura Story template.\n• Faster app opening.",
  );
  assert.equal(notes["pt-BR"], GENERIC_NOTES["pt-BR"]);
});

test("release notes fall back to generic text and respect Play's limit", () => {
  assert.deepEqual(releaseNotes(changelog, "9.9.9"), GENERIC_NOTES);
  const long = `## 2.0.0\n\n- abcdef1: ${"x".repeat(800)}\n`;
  const text = releaseNotes(long, "2.0.0")["en-US"];
  assert.equal(Array.from(text).length, 500);
  assert.ok(text.endsWith("…"));
});

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
  notes: { "en-US": "New", "pt-BR": "Novo" },
};

test("publishes a completed production release and commits the edit", async () => {
  const { calls, request } = mockPlay();
  await publishBundle(config, request);
  assert.ok(calls.some((c) => c.url.includes("/upload/")));
  const track = calls.find((c) => c.url.includes("/tracks/production"));
  assert.deepEqual(JSON.parse(track.body).releases, [
    {
      versionCodes: ["107"],
      status: "completed",
      releaseNotes: [
        { language: "en-US", text: "New" },
        { language: "pt-BR", text: "Novo" },
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
