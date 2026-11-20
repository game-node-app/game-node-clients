"use strict";

/**
 * ESLint 8 legacy configs resolve `plugins: ["gamenode"]` as the Node module
 * `eslint-plugin-gamenode` from the consuming project, and do not accept a
 * path in `plugins`. This repo is a pnpm workspace without a published
 * `eslint-plugin-gamenode` package, so the shared configs map that one exact
 * specifier to the local plugin module before ESLint loads plugins.
 *
 * The patch only intercepts `eslint-plugin-gamenode`; every other module
 * resolution is delegated unchanged. Remove it when the repo moves to flat
 * config, where a plugin can be referenced by path.
 */

const Module = require("node:module");
const path = require("node:path");

const PLUGIN_SPECIFIER = "eslint-plugin-gamenode";
const PLUGIN_ENTRY = path.join(__dirname, "plugins", "gamenode.js");

let installed = false;

function registerGamenodePlugin() {
  if (installed) return;
  installed = true;

  const originalResolveFilename = Module._resolveFilename;

  Module._resolveFilename = function resolveFilename(
    request,
    parent,
    isMain,
    options,
  ) {
    if (request === PLUGIN_SPECIFIER) {
      return PLUGIN_ENTRY;
    }

    return originalResolveFilename.call(this, request, parent, isMain, options);
  };
}

module.exports = { registerGamenodePlugin };
