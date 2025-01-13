import Session, {
  useClaimValue,
  useSessionContext,
} from "supertokens-auth-react/recipe/session";
import { UserRoleClaim } from "supertokens-auth-react/recipe/userroles";

export function useUserRoles(): [string[], boolean] {
  const roleClaim = useClaimValue(UserRoleClaim);

  if (roleClaim.loading) {
    return [[], roleClaim.loading];
  } else if (roleClaim.value == undefined) {
    return [[], false];
  }

  return [roleClaim.value, false];
}
