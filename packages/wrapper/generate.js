const OpenAPI = require("@lamarcke/openapi-typescript-codegen");

const inputs = [
  {
    input: "input/server_swagger.json",
    output: "src/server",
  },
  {
    input: "input/search_swagger.json",
    output: "src/search",
  },
];

for (const input of inputs) {
  OpenAPI.generate({
    ...input,
    httpClient: "fetch",
  });
}
