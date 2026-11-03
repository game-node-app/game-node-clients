import { resolve, relative, isAbsolute } from "node:path";

export function navigationPolicy(
  value: string,
  devUrl?: string,
): "app" | "external" | "deny" {
  try {
    const url = new URL(value);
    if (url.username || url.password) return "deny";
    if (url.protocol === "app:" && url.host === "gamenode") return "app";
    if (devUrl && url.origin === new URL(devUrl).origin) return "app";
    return ["https:", "http:"].includes(url.protocol) ? "external" : "deny";
  } catch {
    return "deny";
  }
}

export function bundledPath(value: string, root: string) {
  if (navigationPolicy(value) !== "app") return undefined;
  const path = resolve(
    root,
    "." +
      decodeURIComponent(
        new URL(value).pathname === "/"
          ? "/index.html"
          : new URL(value).pathname,
      ),
  );
  const rel = relative(root, path);
  return rel.startsWith("..") || isAbsolute(rel) ? undefined : path;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}
export function validWindowState(
  value: unknown,
  displays: Bounds[],
): value is Bounds & { maximized: boolean } {
  if (!value || typeof value !== "object") return false;
  const b = value as Bounds & { maximized: boolean };
  return (
    [b.x, b.y, b.width, b.height].every(Number.isFinite) &&
    b.width >= 800 &&
    b.height >= 600 &&
    typeof b.maximized === "boolean" &&
    displays.some(
      (d) =>
        Math.min(b.x + b.width, d.x + d.width) - Math.max(b.x, d.x) >= 100 &&
        Math.min(b.y + b.height, d.y + d.height) - Math.max(b.y, d.y) >= 100,
    )
  );
}
