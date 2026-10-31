const { readFileSync } = require("node:fs");

async function deployApplication(
  { url, token, uuid, image, tag },
  request = fetch,
  wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
) {
  if (
    !url ||
    !token ||
    !/^[a-zA-Z0-9]+$/.test(uuid || "") ||
    !/^[a-f0-9]{40}$/.test(tag || "")
  )
    throw new Error("Missing or invalid Coolify deployment configuration.");
  const base = new URL(url);
  if (!["http:", "https:"].includes(base.protocol))
    throw new Error("Invalid Coolify URL.");
  async function api(path, method = "GET", body) {
    const response = await request(`${url.replace(/\/$/, "")}/api/v1${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: body && JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok)
      throw new Error(
        `Coolify ${method} ${path} failed: HTTP ${response.status}`,
      );
    return response.json();
  }
  const application = await api(`/applications/${uuid}`);
  if (
    application.build_pack !== "dockerimage" ||
    application.docker_registry_image_name !== image
  ) {
    throw new Error(
      "Coolify target must be a Docker image application using the expected image.",
    );
  }
  await api(`/applications/${uuid}`, "PATCH", {
    docker_registry_image_tag: tag,
  });
  const result = await api(`/deploy?uuid=${uuid}`, "POST");
  const deployment = result.deployments?.[0]?.deployment_uuid;
  if (!/^[a-zA-Z0-9]+$/.test(deployment || ""))
    throw new Error("Coolify did not return a deployment UUID.");
  console.log(`Coolify deployment: ${deployment}`);
  for (let attempt = 0; attempt < 120; attempt++) {
    const { status } = await api(`/deployments/${deployment}`);
    if (typeof status !== "string")
      throw new Error("Coolify returned an invalid deployment status.");
    if (status === "finished") {
      const healthUrl = application.fqdn?.split(",")[0];
      if (healthUrl) {
        const response = await request(healthUrl, {
          signal: AbortSignal.timeout(30000),
        });
        if (!response.ok)
          throw new Error(
            `Application HTTP health check failed: HTTP ${response.status}`,
          );
      }
      return deployment;
    }
    if (status === "failed" || status.startsWith("cancelled"))
      throw new Error(`Coolify deployment ${status}.`);
    await wait(10000);
  }
  throw new Error("Timed out waiting for Coolify deployment.");
}

if (require.main === module) {
  const app = process.env.RELEASE_APP;
  if (!["web", "admin"].includes(app))
    throw new Error("Select web or admin explicitly.");
  const release = JSON.parse(readFileSync(".release.json", "utf8"));
  if (!release.apps.includes(app))
    throw new Error("App is not selected in this release snapshot.");
  deployApplication({
    url: process.env.COOLIFY_URL,
    token: process.env.COOLIFY_TOKEN,
    uuid: process.env[`COOLIFY_${app.toUpperCase()}_APP_UUID`],
    image: `lamarcke/game-node-${app}`,
    tag: release.source,
  }).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { deployApplication };
