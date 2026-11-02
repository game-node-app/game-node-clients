const assert = require("node:assert/strict");
const { test } = require("node:test");
const { deployApplication } = require("./deploy-coolify.cjs");
const { validateDelivery } = require("./release-plan.cjs");

const config = {
  url: "https://coolify.example.test",
  token: "test-token",
  uuid: "webapp",
  image: "lamarcke/game-node-web",
  tag: "a".repeat(40),
};
function mockRequest({
  status = "finished",
  patchStatus = 200,
  deployment = "deployment1",
  image = config.image,
  healthStatus = 200,
  fqdn = "https://gamenode.app",
} = {}) {
  const calls = [];
  const request = async (url, options = {}) => {
    calls.push({ url, ...options });
    if (url.endsWith("/applications/webapp") && options.method === "GET")
      return Response.json({
        build_pack: "dockerimage",
        docker_registry_image_name: image,
        fqdn,
      });
    if (options.method === "PATCH")
      return Response.json({}, { status: patchStatus });
    if (url.includes("/deploy?"))
      return Response.json({ deployments: [{ deployment_uuid: deployment }] });
    if (url.includes("/deployments/")) return Response.json({ status });
    if (url === "https://gamenode.app")
      return new Response("", { status: healthStatus });
    throw new Error(`Unexpected request ${url}`);
  };
  return { calls, request };
}

test("deploys the exact image tag and waits for completion and HTTP health", async () => {
  const { calls, request } = mockRequest();
  assert.equal(
    await deployApplication(config, request, async () => {}),
    "deployment1",
  );
  assert.deepEqual(
    JSON.parse(calls.find((call) => call.method === "PATCH").body),
    { docker_registry_image_tag: config.tag },
  );
  assert.equal(
    calls.find((call) => call.url.includes("/deploy?")).method,
    "POST",
  );
  assert.equal(calls.at(-1).url, "https://gamenode.app");
  assert.ok(calls.every((call) => call.redirect === "error"));
});

test("rejects HTTP errors, failed/cancelled deployments, malformed responses, wrong targets, and unhealthy apps", async () => {
  for (const scenario of [
    { patchStatus: 403 },
    { status: "failed" },
    { status: "cancelled-by-user" },
    { status: null },
    { deployment: null },
    { deployment: "../deploy?uuid=other" },
    { deployment: "injected\nlog" },
    { image: "wrong/image" },
    { healthStatus: 503 },
  ]) {
    await assert.rejects(
      deployApplication(config, mockRequest(scenario).request, async () => {}),
    );
  }
});

test("health checks cannot be redirected to an API-controlled domain", async () => {
  const { calls, request } = mockRequest({ fqdn: "http://169.254.169.254/" });
  await deployApplication(config, request, async () => {});
  assert.equal(calls.at(-1).url, "https://gamenode.app");
  assert.equal(calls.at(-1).headers, undefined);
});

test("rejects unsafe configuration before making any request", async () => {
  for (const invalid of [
    { url: "http://coolify.example.test" },
    { url: "https://user:pass@coolify.example.test" },
    { url: "https://coolify.example.test/extra" },
    { url: "https://coolify.example.test?other=1" },
    { url: "https://coolify.example.test#fragment" },
    { uuid: "webapp/../../deploy" },
    { image: "other/image" },
  ]) {
    const { calls, request } = mockRequest();
    await assert.rejects(deployApplication({ ...config, ...invalid }, request));
    assert.equal(calls.length, 0);
  }
});

test("times out a deployment that never finishes", async () => {
  await assert.rejects(
    deployApplication(
      config,
      mockRequest({ status: "in_progress" }).request,
      async () => {},
    ),
    /Timed out/,
  );
});

test("selected targets require their own configuration before release reservation", () => {
  validateDelivery([], {});
  const signing = {
    RELEASE_KEYSTORE: "x",
    RELEASE_KEYSTORE_PASS: "x",
    RELEASE_KEYSTORE_KEY_ALIAS: "x",
    RELEASE_KEYSTORE_KEY_PASS: "x",
    R2_ACCESS_KEY_ID: "x",
    R2_SECRET_ACCESS_KEY: "x",
    R2_ACCOUNT_ID: "x",
    R2_BUCKET: "x",
    LIVE_UPDATE_PUBLIC_URL: "https://updates.example.test",
  };
  validateDelivery(["mobile"], signing);
  assert.throws(() => validateDelivery(["web"], signing), /DOCKER_USERNAME/);
  const docker = {
    DOCKER_USERNAME: "x",
    DOCKER_PASSWORD: "x",
    COOLIFY_URL: config.url,
    COOLIFY_TOKEN: "x",
    COOLIFY_WEB_APP_UUID: config.uuid,
  };
  validateDelivery(["web"], docker);
  assert.throws(
    () => validateDelivery(["admin"], docker),
    /COOLIFY_ADMIN_APP_UUID/,
  );
});
