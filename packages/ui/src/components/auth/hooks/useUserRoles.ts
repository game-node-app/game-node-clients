import { useClaimValue } from "supertokens-auth-react/recipe/session";
import { UserRoleClaim } from "supertokens-auth-react/recipe/userroles";

export function useUserRoles() {
  const roleClaim = useClaimValue(UserRoleClaim);
  if (
    roleClaim.loading ||
    !roleClaim.doesSessionExist ||
    roleClaim.value == undefined
  ) {
    return [];
  }
  return roleClaim.value;
}
