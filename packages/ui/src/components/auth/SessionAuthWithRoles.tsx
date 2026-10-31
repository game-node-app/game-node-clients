import { EUserRoles } from "#@/components/auth/roles";
import { PropsWithChildren } from "react";
import { SessionAuth } from "#@/components/auth/SessionAuth";
import { AccessDenied } from "#@/components/auth/AccessDenied";
import { useUserRoles } from "#@/components/auth/hooks/useUserRoles";

interface Props extends PropsWithChildren {
  roles: EUserRoles[];
}

const Guard = ({ children, roles }: Props) => {
  const userRoles = useUserRoles();

  if (roles.length > 0 && !roles.some((role) => userRoles.includes(role))) {
    return <AccessDenied />;
  }

  return <>{children}</>;
};

const SessionAuthWithRoles = ({ children, roles }: Props) => {
  return (
    <SessionAuth>
      <Guard roles={roles}>{children}</Guard>
    </SessionAuth>
  );
};

export { SessionAuthWithRoles };
