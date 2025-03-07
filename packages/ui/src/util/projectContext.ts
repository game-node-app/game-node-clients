interface ProjectContext {
  client: "web" | "mobile" | "admin";
}

export let PROJECT_CONTEXT: ProjectContext;

export function setProjectContext(context: ProjectContext) {
  PROJECT_CONTEXT = context;
}
