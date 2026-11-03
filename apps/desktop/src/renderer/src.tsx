import React from "react";
import { createRoot } from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import { DEFAULT_MANTINE_THEME } from "@repo/ui/theme";
import { getAuthClientOptions, setupAuthClient } from "@repo/ui/auth";
import { setProjectContext } from "@repo/ui/project-context";
import { setupWrapper } from "@repo/wrapper";
import { App } from "./App";
import "@mantine/core/styles.css";
import "./style.css";

const serverUrl =
  import.meta.env.VITE_PUBLIC_SERVER_URL || "https://server.gamenode.app";
const searchUrl =
  import.meta.env.VITE_PUBLIC_SEARCH_URL || "https://search.gamenode.app";
setProjectContext({
  client: "desktop",
  serverUrl,
  searchUrl,
  s3BucketUrl:
    import.meta.env.VITE_PUBLIC_S3_BUCKET_URL || "https://s3.gamenode.app",
});
const options = getAuthClientOptions(serverUrl);
const fetchOptions = {
  ...options.fetchOptions,
  auth: { type: "Bearer" as const, token: window.gamenode.getToken },
  onError: async ({ response }: { response: Response }) => {
    if (response.status === 401) await window.gamenode.signOut();
  },
};
setupAuthClient({ ...options, fetchOptions });
setupWrapper({
  serverBaseURL: serverUrl,
  searchBaseURL: searchUrl,
  getToken: window.gamenode.getToken,
});
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MantineProvider theme={DEFAULT_MANTINE_THEME} forceColorScheme="dark">
      <App />
    </MantineProvider>
  </React.StrictMode>,
);
