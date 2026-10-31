import { authClient } from "#@/components/auth/authClient";

/**
 * Returns the userId of the currently logged-in user.
 */
const useUserId = (): string | undefined => {
  const { data } = authClient.useSession();

  return data?.user.id;
};

export { useUserId };
