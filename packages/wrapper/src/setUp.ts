import { OpenAPI as ServerOpenAPI } from "./server";
import { OpenAPI as SearchOpenAPI } from "./search";

interface BaseURLs {
  searchBaseURL: string;
  serverBaseURL: string;
}

export function setupWrapper({ searchBaseURL, serverBaseURL }: BaseURLs) {
  ServerOpenAPI.BASE = serverBaseURL;
  ServerOpenAPI.WITH_CREDENTIALS = true;
  SearchOpenAPI.BASE = searchBaseURL;
  SearchOpenAPI.WITH_CREDENTIALS = false;
}
