import { useSessionContext } from "supertokens-auth-react/recipe/session";

/**
 * Returns the userId of the currently logged-in user.
 */
const useUserId = (): string | undefined => {
    const session = useSessionContext();
    if (!session.loading && session.doesSessionExist) {
        return session.userId;
    }

    return undefined;
};

export default useUserId;
