"use client";

import { EUserRoles } from "@/components/auth/roles";
import { PropsWithChildren } from "react";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { AccessDeniedScreen } from "supertokens-auth-react/recipe/session/prebuiltui";
import { UserRoleClaim } from "supertokens-auth-react/recipe/userroles";

interface Props extends PropsWithChildren {
    roles: EUserRoles[];
}

const SessionAuthWithRoles = ({ children, roles }: Props) => {
    return (
        <SessionAuth
            requireAuth={true}
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
