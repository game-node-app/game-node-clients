import { ConnectionAuthCallback } from "@repo/ui";
import { SessionAuth } from "@repo/ui";
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
