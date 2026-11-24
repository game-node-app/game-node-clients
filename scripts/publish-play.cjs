const { createSign } = require("node:crypto");
const { readFileSync } = require("node:fs");

const PACKAGE_NAME = "app.gamenode";
const API = "https://androidpublisher.googleapis.com";
// Play shows these for every release; the full changelog lives in GitHub Releases.
const RELEASE_NOTES = {
  "en-US": "Bug fixes and improvements.",
  "pt-BR": "Correções de bugs e melhorias.",
};
const SUBMITTED_RELEASE_STATES = new Set([
  "RELEASE_LIFECYCLE_STATE_PUBLISHED",
  "RELEASE_LIFECYCLE_STATE_IN_REVIEW",
  "RELEASE_LIFECYCLE_STATE_APPROVED_NOT_PUBLISHED",
]);

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

function playApi(token, request = fetch) {
  const base = `/androidpublisher/v3/applications/${PACKAGE_NAME}`;
  return async function api(path, { method = "GET", body, upload } = {}) {
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
  };
}

function fingerprintSuffix(fingerprint) {
  return ` (native ${fingerprint})`;
}

/**
 * The newest published, in-review, or approved release. Release summaries
 * expose active artifacts instead of version codes, and a release that is not
 * serving users yet can have none; read the code we record in its name then.
 */
function latestSubmitted(releases) {
  return releases
    .filter((release) =>
      SUBMITTED_RELEASE_STATES.has(release.releaseLifecycleState),
    )
    .flatMap(({ releaseName = "", activeArtifacts = [] }) => {
      if (activeArtifacts.length)
        return activeArtifacts.map(({ versionCode }) => ({
          releaseName,
          versionCode,
        }));
      const match = /^(\d+) \(native [a-f0-9]{16}\)$/.exec(releaseName);
      // An unrecognized name can still be newer than every known code; treat
      // it as the latest so the caller publishes instead of skipping it.
      return [
        {
          releaseName,
          versionCode: match ? Number(match[1]) : Number.POSITIVE_INFINITY,
        },
      ];
    })
    .sort((a, b) => b.versionCode - a.versionCode)[0];
}

async function latestRelease({ credentials, track }, request = fetch) {
  const token = await accessToken(credentials, request);
  const api = playApi(token, request);
  const { releases = [] } = await api(
    `/tracks/${encodeURIComponent(track)}/releases`,
  );
  return { api, latest: latestSubmitted(releases) };
}

/**
 * Whether the latest submitted Play release lacks this native shell. The check
 * runs before the signed build so an unchanged shell does not build or submit.
 */
async function shouldPublish(
  { credentials, fingerprint, track = "production" },
  request = fetch,
) {
  if (!/^[a-f0-9]{16}$/.test(fingerprint))
    throw new Error("Invalid Android native fingerprint.");
  const { latest } = await latestRelease({ credentials, track }, request);
  return !latest?.releaseName?.endsWith(fingerprintSuffix(fingerprint));
}

/**
 * Returns false if the latest submitted release already has this native shell.
 * Otherwise uploads the bundle and submits a full rollout in one edit.
 */
async function publishBundle(
  {
    credentials,
    bundle,
    versionCode,
    fingerprint,
    notes = RELEASE_NOTES,
    track = "production",
  },
  request = fetch,
) {
  if (!/^\d+$/.test(String(versionCode)))
    throw new Error("Invalid Android version code.");
  if (!/^[a-f0-9]{16}$/.test(fingerprint))
    throw new Error("Invalid Android native fingerprint.");
  const { api, latest } = await latestRelease({ credentials, track }, request);
  // The Play Console name is committed with the bundle and survives CI retries.
  const suffix = fingerprintSuffix(fingerprint);
  if (latest?.releaseName?.endsWith(suffix)) return false;

  const trackId = encodeURIComponent(track);
  const { id } = await api("/edits", { method: "POST", body: {} });
  const edit = `/edits/${encodeURIComponent(id)}`;
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
  await api(`${edit}/tracks/${trackId}`, {
    method: "PUT",
    body: {
      track,
      releases: [
        {
          name: `${versionCode}${suffix}`,
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
  return true;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const credentials = JSON.parse(process.env.PLAY_SERVICE_ACCOUNT_JSON || "{}");
  const track = process.env.PLAY_TRACK || "production";
  const fail = (error) => {
    console.error(error.message);
    process.exitCode = 1;
  };
  if (args[0] === "--check") {
    const fingerprint = args[1];
    if (!fingerprint)
      throw new Error("Usage: publish-play.cjs --check <fingerprint>");
    shouldPublish({ credentials, fingerprint, track })
      .then((publish) => console.log(publish ? "true" : "false"))
      .catch(fail);
  } else {
    const [bundlePath, versionCode, fingerprint] = args;
    if (!bundlePath || !versionCode || !fingerprint)
      throw new Error(
        "Usage: publish-play.cjs <bundle.aab> <versionCode> <fingerprint>",
      );
    publishBundle({
      credentials,
      bundle: readFileSync(bundlePath),
      versionCode,
      fingerprint,
      track,
    })
      .then((published) => {
        console.log(
          published
            ? `Submitted version code ${versionCode} to Play ${track}.`
            : `Skipped Play ${track} upload. Native fingerprint ${fingerprint} is already submitted.`,
        );
      })
      .catch(fail);
  }
}

module.exports = { publishBundle, shouldPublish, RELEASE_NOTES };
