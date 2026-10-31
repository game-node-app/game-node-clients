import { useUserRoles } from "@/components/auth/hooks/useUserRoles";
import { EUserRoles } from "@/components/auth/roles";
import CenteredLoading from "@/components/general/CenteredLoading";
import { Stack } from "@mantine/core";
import { PropsWithChildren } from "react";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { AccessDeniedScreen } from "supertokens-auth-react/recipe/session/prebuiltui";
import { UserRoleClaim } from "supertokens-auth-react/recipe/userroles";

interface Props extends PropsWithChildren {
    roles: EUserRoles[];
}

const SessionAuthWithRoles = ({ children, roles }: Props) => {
    const userRoles = useUserRoles();

    if (userRoles.length === 0) {
        return (
            <Stack className={"w-screen h-screen items-center justify-center"}>
                <CenteredLoading message={"Loading access permissions..."} />
            </Stack>
        );
    }

    return (
        <SessionAuth
            accessDeniedScreen={AccessDeniedScreen}
            overrideGlobalClaimValidators={(globalClaimValidators) => {
                const validators = [...globalClaimValidators];
                if (roles.length > 0) {
                    validators.push(
                        UserRoleClaim.validators.includesAny(roles),
                    );
                }

                return validators;
            }}
        >
            {children}
        </SessionAuth>
    );
};

export default SessionAuthWithRoles;
