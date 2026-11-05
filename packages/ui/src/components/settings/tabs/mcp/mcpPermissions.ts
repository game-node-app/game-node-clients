import { IconBook, IconPencil, IconPlus, IconProps } from "@tabler/icons-react";
import { ComponentType } from "react";
import { MCP_SCOPES } from "#@/components/mcp/connection";

type McpScope = (typeof MCP_SCOPES)[number];

/** Scopes that read or change GameNode data (`openid`, `profile`… are identity plumbing). */
export type McpPermissionScope = Extract<
  McpScope,
  `${string}:read` | `${string}:write`
>;

/** `games:read` → `games_read`, the form used in translation keys. */
export type McpPermissionKey<
  S extends McpPermissionScope = McpPermissionScope,
> = S extends `${infer Resource}:${infer Access}`
  ? `${Resource}_${Access}`
  : never;

export function isMcpPermissionScope(
  scope: string,
): scope is McpPermissionScope {
  return (
    (MCP_SCOPES as readonly string[]).includes(scope) &&
    /:(read|write)$/.test(scope)
  );
}

export const MCP_PERMISSION_SCOPES = MCP_SCOPES.filter(isMcpPermissionScope);

export function getMcpPermissionKey<S extends McpPermissionScope>(
  scope: S,
): McpPermissionKey<S> {
  return scope.replace(":", "_") as McpPermissionKey<S>;
}

export function isMcpWriteScope(scope: McpPermissionScope) {
  return scope.endsWith(":write");
}

export const MCP_PERMISSION_ICONS: Record<
  McpPermissionScope,
  ComponentType<IconProps>
> = {
  "games:read": IconBook,
  "library:read": IconBook,
  "library:write": IconPlus,
  "reviews:write": IconPencil,
  "posts:write": IconPencil,
};
