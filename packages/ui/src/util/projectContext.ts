interface ProjectContext {
  client: "web" | "mobile" | "admin";
  s3BucketUrl: string;
  serverUrl: string;
  searchUrl: string;
}

export let PROJECT_CONTEXT: ProjectContext;

export function setProjectContext(context: ProjectContext) {
  PROJECT_CONTEXT = context;
}
