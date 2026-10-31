import { OpenAPI as ServerOpenAPI } from "./server";
import { OpenAPI as SearchOpenAPI } from "./search";

interface BaseURLs {
  searchBaseURL: string;
  serverBaseURL: string;
  /** Sends the result as a bearer token; for clients where cookies don't reach the API (native). */
  getToken?: () => Promise<string | undefined>;
}

export function setupWrapper({
  searchBaseURL,
  serverBaseURL,
  getToken,
}: BaseURLs) {
  ServerOpenAPI.BASE = serverBaseURL;
  ServerOpenAPI.WITH_CREDENTIALS = true;
  if (getToken) {
    ServerOpenAPI.TOKEN = async () => (await getToken()) ?? "";
  }
  SearchOpenAPI.BASE = searchBaseURL;
  SearchOpenAPI.WITH_CREDENTIALS = false;
}
