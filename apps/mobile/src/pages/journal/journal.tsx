import { AppPage } from "@/components/general/AppPage.tsx";
import { JournalOverviewView, useUserId, useUserProfile } from "@repo/ui";

interface Props {
  userId: string;
}

const JournalPage = ({ userId }: Props) => {
  useUserId();

  useUserProfile(userId);

  return (
    <AppPage>
      <JournalOverviewView userId={userId} />
    </AppPage>
  );
};

export { JournalPage };
