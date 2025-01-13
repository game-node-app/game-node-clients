"use client";

import React, { PropsWithChildren, useEffect, useState } from "react";
import { useUserRoles } from "@/components/auth/hooks/useUserRoles";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { EUserRoles } from "@/components/auth/roles";
import { UserRoleClaim } from "supertokens-auth-react/recipe/userroles";
import { AccessDeniedScreen } from "supertokens-auth-react/recipe/session/prebuiltui";

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
