import { authClient } from "#@/components/auth/authClient";
import { EUserRoles } from "#@/components/auth/roles";

/** Better Auth's admin plugin stores roles as a comma-separated string on the user. */
export function useUserRoles() {
  const { data } = authClient.useSession();
  const role = (data?.user as { role?: string | null } | undefined)?.role;

  return (role ? role.split(",") : []) as EUserRoles[];
}
