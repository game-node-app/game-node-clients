const OpenAPI = require("@lamarcke/openapi-typescript-codegen");

const inputs = [
    {
        input: "src/wrapper/input/server_swagger.json",
        output: "src/wrapper/server",
    },
    {
        input: "src/wrapper/input/search_swagger.json",
        output: "src/wrapper/search",
    },
];

for (const input of inputs) {
    OpenAPI.generate({
        ...input,
        httpClient: "fetch",
    });
}
