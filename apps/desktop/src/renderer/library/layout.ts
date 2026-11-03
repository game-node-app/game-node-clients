import { SOURCES, type Filter, type Sort } from "./model";
export interface Layout {
  view: "grid" | "list";
  sort: Sort;
  filter: Filter;
  sidebar: number;
  detail: number;
}
export const defaultLayout: Layout = {
  view: "grid",
  sort: { column: "name", direction: "asc" },
  filter: "all",
  sidebar: 200,
  detail: 280,
};
export function readLayout(value: string | undefined): Layout {
  try {
    const layout = JSON.parse(value || "{}");
    return {
      view: layout.view === "list" ? "list" : "grid",
      sort: {
        column: ["name", "store", "year", "in-library"].includes(
          layout.sort?.column,
        )
          ? layout.sort.column
          : "name",
        direction: layout.sort?.direction === "desc" ? "desc" : "asc",
      },
      filter: ["all", "in-library", "not-imported", ...SOURCES].includes(
        layout.filter,
      )
        ? layout.filter
        : "all",
      sidebar: Number.isFinite(layout.sidebar)
        ? Math.max(150, Math.min(300, layout.sidebar))
        : defaultLayout.sidebar,
      detail: Number.isFinite(layout.detail)
        ? Math.max(220, Math.min(450, layout.detail))
        : defaultLayout.detail,
    };
  } catch {
    return defaultLayout;
  }
}
