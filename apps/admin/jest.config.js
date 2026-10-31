const nextJest = require("next/jest");

module.exports = nextJest({ dir: "./" })({
  testEnvironment: "node",
  modulePathIgnorePatterns: ["<rootDir>/.next"],
  testMatch: ["<rootDir>/src/**/*.test.ts"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
});
