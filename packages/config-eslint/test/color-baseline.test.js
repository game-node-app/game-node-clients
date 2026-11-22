"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const {
  compareWithBaseline,
  countColorViolations,
  loadColorBaseline,
  writeBaseline,
} = require("../color-baseline-tools");

function createRepo(t, files) {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), "gn-color-baseline-"),
  );

  for (const [relativePath, content] of Object.entries(files)) {
    const absolutePath = path.join(directory, relativePath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, content);
  }

  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));

  return directory;
}

test("counts ts, tsx and css violations and skips tests, themes and exemptions", async (t) => {
  const repoRoot = createRepo(t, {
    "packages/ui/src/A.tsx": `export const A = () => <div className="bg-black text-white" style={{ color: "#fff" }} />;`,
    "packages/ui/src/B.tsx": `export const B = () => <div className="bg-paper-2 text-muted" />;`,
    "packages/ui/src/C.tsx": `// theme-exempt: artwork\nexport const C = () => <div className="bg-black" />;`,
    "packages/ui/src/A.test.tsx": `export const T = () => <div className="bg-black" />;`,
    "packages/ui/src/theme/themes/dark.ts": `export const d = { a: "#fff" };`,
    "packages/ui/src/theme/generated/x.css": `:root { --a: #fff; }`,
    "packages/ui/src/style.module.css": `.a { color: white; background: #000; }`,
    "apps/web/src/page.tsx": `export const P = () => <Text c="white" />;`,
  });

  const counts = await countColorViolations({
    repoRoot,
    packages: ["packages/ui", "apps/web", "apps/mobile"],
  });

  assert.deepEqual(counts, {
    "apps/web/src/page.tsx": 1,
    "packages/ui/src/A.tsx": 2,
    "packages/ui/src/style.module.css": 2,
  });
});

test("compareWithBaseline fails on new files and growth, allows shrinking", () => {
  const baseline = {
    "packages/ui/src/a.tsx": 3,
    "packages/ui/src/b.tsx": 2,
    "packages/ui/src/c.tsx": 1,
    "apps/web/src/d.tsx": 5,
  };
  const counts = {
    "packages/ui/src/a.tsx": 4,
    "packages/ui/src/b.tsx": 1,
    "packages/ui/src/new.tsx": 1,
  };

  const diff = compareWithBaseline(counts, baseline, ["packages/ui"]);

  assert.deepEqual(diff.added, [{ file: "packages/ui/src/new.tsx", count: 1 }]);
  assert.deepEqual(diff.grown, [
    { file: "packages/ui/src/a.tsx", count: 4, baseline: 3 },
  ]);
  assert.deepEqual(
    diff.shrunk.map((entry) => entry.file),
    ["packages/ui/src/b.tsx", "packages/ui/src/c.tsx"],
  );

  const clean = compareWithBaseline({ "packages/ui/src/a.tsx": 2 }, baseline, [
    "packages/ui",
  ]);
  assert.equal(clean.added.length + clean.grown.length, 0);
});

test("baseline round-trips through writeBaseline/loadColorBaseline", (t) => {
  const directory = createRepo(t, {});
  const file = path.join(directory, "color-baseline.json");

  writeBaseline({ "b.tsx": 1, "a.tsx": 2 }, file);

  assert.deepEqual(Object.keys(loadColorBaseline(file)), ["a.tsx", "b.tsx"]);
  assert.deepEqual(loadColorBaseline(path.join(directory, "missing.json")), {});
});
