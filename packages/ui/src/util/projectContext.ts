interface ProjectContext {
  client: "web" | "mobile" | "admin";
  s3BucketUrl: string;
  serverUrl: string;
  searchUrl: string;
  /**
   * Development only: when nobody is signed in, the UI renders as this user (read-only, there is no session),
   * to preview logged-in screens. Apps must never set it in production builds.
   */
  debugUserId?: string;
}

export let PROJECT_CONTEXT: ProjectContext;

export function setProjectContext(context: ProjectContext) {
  PROJECT_CONTEXT = context;
}
