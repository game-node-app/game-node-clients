import { useRouter } from "next/router";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { ConnectionAuthCallback } from "@repo/ui";

export default function ConnectionCallbackPage() {
  const router = useRouter();
  if (!router.isReady || typeof router.query.type !== "string") return null;

  return (
    <SessionAuth>
      <ConnectionAuthCallback type={router.query.type} />
    </SessionAuth>
  );
}
