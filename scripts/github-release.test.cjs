const assert = require("node:assert/strict");
const { test } = require("node:test");
const {
  previousTag,
  changelogSection,
  releaseBody,
} = require("./github-release.cjs");

test("previous tag is the same app's highest earlier version", () => {
  const tags = [
    "mobile@1.9.9",
    "mobile@1.10.0",
    "mobile@1.24.0",
    "web@1.23.5",
    "mobile@1.25.0",
    "releases/abc",
    "",
  ];
  assert.equal(previousTag(tags, "mobile", "1.24.0"), "mobile@1.10.0");
  assert.equal(previousTag(tags, "web", "1.24.0"), "web@1.23.5");
  assert.equal(previousTag(tags, "admin", "1.0.0"), undefined);
});

test("changelog section keeps the version's entries only", () => {
  const changelog = `# mobile

## 1.24.0

### Minor Changes

- c216024: New spotlight.

  - Nested detail.

## 1.23.0

- Old.
`;
  assert.equal(
    changelogSection(changelog, "1.24.0"),
    "## Minor Changes\n\n- c216024: New spotlight.\n\n  - Nested detail.",
  );
  assert.equal(changelogSection(changelog, "9.9.9"), "");
});

test("release body puts the changelog before GitHub's generated notes", () => {
  assert.equal(
    releaseBody("## Minor Changes\n\n- A", "## What's Changed\n* PR\n"),
    "## Minor Changes\n\n- A\n\n## What's Changed\n* PR",
  );
  assert.equal(releaseBody("", "## What's Changed"), "## What's Changed");
});
