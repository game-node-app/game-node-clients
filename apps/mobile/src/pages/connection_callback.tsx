import { ConnectionAuthCallback } from "@repo/ui";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { AppPage } from "@/components/general/AppPage";

export default function ConnectionCallbackPage({ type }: { type: string }) {
  return (
    <AppPage withSearch={false}>
      <SessionAuth>
        <ConnectionAuthCallback type={type} />
      </SessionAuth>
    </AppPage>
  );
}
