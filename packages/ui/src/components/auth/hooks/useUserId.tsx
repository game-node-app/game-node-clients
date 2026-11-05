import { authClient } from "#@/components/auth/authClient";
import { PROJECT_CONTEXT } from "#@/util/projectContext";

/**
 * Returns the userId of the currently logged-in user.
 */
const useUserId = (): string | undefined => {
  const { data, isPending } = authClient.useSession();

  if (data?.user.id || isPending) return data?.user.id;
  // dev-only preview of logged-in screens (see ProjectContext.debugUserId)
  return PROJECT_CONTEXT?.debugUserId;
};

export { useUserId };
