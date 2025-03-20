interface ProjectContext {
  client: "web" | "mobile" | "admin";
  s3BucketUrl: string;
}

export let PROJECT_CONTEXT: ProjectContext;

export function setProjectContext(context: ProjectContext) {
  PROJECT_CONTEXT = context;
}
