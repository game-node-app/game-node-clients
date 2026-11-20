const { createSign } = require("node:crypto");
const { readFileSync } = require("node:fs");

const PACKAGE_NAME = "app.gamenode";
const API = "https://androidpublisher.googleapis.com";
const NOTES_LIMIT = 500;
const GENERIC_NOTES = {
  "en-US": "Bug fixes and improvements.",
  "pt-BR": "Correções de bugs e melhorias.",
};

/** Release notes for `version` from the Changesets-generated CHANGELOG. */
function releaseNotes(changelog, version) {
  const lines = changelog.split("\n");
  const start = lines.findIndex((line) => line.trim() === `## ${version}`);
  const entries = [];
  if (start !== -1) {
    for (const line of lines.slice(start + 1)) {
      if (/^## /.test(line)) break;
      // Skip headings, blanks and intro lines that only lead into a sub-list.
      if (/^#/.test(line) || !line.trim() || /:\s*$/.test(line)) continue;
      const text = line
        .replace(/^\s*[-*]\s+/, "")
        .replace(/^[a-f0-9]{7,40}:\s*/, "")
        .trim();
      if (text) entries.push(text);
    }
  }
  if (!entries.length) return { ...GENERIC_NOTES };
  const text = truncate(entries.map((entry) => `• ${entry}`).join("\n"));
  // Changesets are written in English; Portuguese gets the generic text.
  return { "en-US": text, "pt-BR": GENERIC_NOTES["pt-BR"] };
}

function truncate(text) {
  const chars = Array.from(text);
  if (chars.length <= NOTES_LIMIT) return text;
  return `${chars
    .slice(0, NOTES_LIMIT - 1)
    .join("")
    .trimEnd()}…`;
}

async function accessToken(credentials, request = fetch) {
  const { client_email, private_key, token_uri } = credentials;
  if (!client_email || !private_key)
    throw new Error("Invalid Play service account credentials.");
  const tokenUrl = token_uri || "https://oauth2.googleapis.com/token";
  const now = Math.floor(Date.now() / 1000);
  const encode = (value) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  const unsigned = `${encode({ alg: "RS256", typ: "JWT" })}.${encode({
    iss: client_email,
    scope: "https://www.googleapis.com/auth/androidpublisher",
    aud: tokenUrl,
    iat: now,
    exp: now + 3600,
  })}`;
  const signature = createSign("RSA-SHA256")
    .update(unsigned)
    .sign(private_key, "base64url");
  const response = await request(tokenUrl, {
    method: "POST",
    redirect: "error",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${signature}`,
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok)
    throw new Error(`Play token request failed: HTTP ${response.status}`);
  return (await response.json()).access_token;
}

/**
 * Uploads the bundle and rolls it out fully on `track` in one edit.
 * Play keeps the edit uncommitted if any step fails.
 */
async function publishBundle(
  { credentials, bundle, versionCode, notes, track = "production" },
  request = fetch,
) {
  if (!/^\d+$/.test(String(versionCode)))
    throw new Error("Invalid Android version code.");
  const token = await accessToken(credentials, request);
  const base = `/androidpublisher/v3/applications/${PACKAGE_NAME}/edits`;
  async function api(path, { method = "GET", body, upload } = {}) {
    const response = await request(
      `${API}${upload ? "/upload" : ""}${base}${path}${upload ? "?uploadType=media" : ""}`,
      {
        method,
        redirect: "error",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": upload
            ? "application/octet-stream"
            : "application/json",
        },
        body: upload ?? (body && JSON.stringify(body)),
        signal: AbortSignal.timeout(upload ? 600000 : 60000),
      },
    );
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(
        `Play ${method} ${path || "/"} failed: HTTP ${response.status} ${detail.slice(0, 1000)}`,
      );
    }
    return response.json();
  }
  const { id } = await api("", { method: "POST", body: {} });
  const edit = `/${encodeURIComponent(id)}`;
  // A retried release already uploaded this code; Play rejects re-uploads.
  const { bundles = [] } = await api(`${edit}/bundles`);
  if (!bundles.some((b) => String(b.versionCode) === String(versionCode))) {
    const uploaded = await api(`${edit}/bundles`, {
      method: "POST",
      upload: bundle,
    });
    if (String(uploaded.versionCode) !== String(versionCode))
      throw new Error(
        `Uploaded bundle has version code ${uploaded.versionCode}, expected ${versionCode}.`,
      );
  }
  await api(`${edit}/tracks/${encodeURIComponent(track)}`, {
    method: "PUT",
    body: {
      track,
      releases: [
        {
          versionCodes: [String(versionCode)],
          status: "completed",
          releaseNotes: Object.entries(notes).map(([language, text]) => ({
            language,
            text,
          })),
        },
      ],
    },
  });
  await api(`${edit}:commit`, { method: "POST" });
}

if (require.main === module) {
  const [bundlePath, changelogPath, version, versionCode] =
    process.argv.slice(2);
  if (!bundlePath || !changelogPath || !version || !versionCode)
    throw new Error(
      "Usage: publish-play.cjs <bundle.aab> <CHANGELOG.md> <version> <versionCode>",
    );
  const notes = releaseNotes(readFileSync(changelogPath, "utf8"), version);
  publishBundle({
    credentials: JSON.parse(process.env.PLAY_SERVICE_ACCOUNT_JSON || "{}"),
    bundle: readFileSync(bundlePath),
    versionCode,
    notes,
    track: process.env.PLAY_TRACK || "production",
  })
    .then(() => console.log(`Published ${version} (${versionCode}) to Play.`))
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}

module.exports = { releaseNotes, publishBundle, GENERIC_NOTES };
