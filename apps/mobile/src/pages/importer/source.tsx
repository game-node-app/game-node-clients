import { AppPage } from "@/components/general/AppPage";
import { IonRefresher, IonRefresherContent } from "@ionic/react";
import { Stack } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { ImporterScreen } from "@repo/ui";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  source: string;
}

const ImporterBySourcePage = ({ source }: Props) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return (
    <AppPage title={t("importer.title")} withSearch={false}>
      <IonRefresher
        slot={"fixed"}
        onIonRefresh={async (evt) => {
          const promises: Promise<unknown>[] = [
            queryClient.invalidateQueries({
              queryKey: ["importer", "entries"],
            }),
            queryClient.invalidateQueries({
              queryKey: ["connections", "own"],
            }),
          ];

          await Promise.all(promises);

          evt.detail.complete();
        }}
      >
        <IonRefresherContent />
      </IonRefresher>
      <Stack className={"mb-8 min-h-screen"}>
        <ImporterScreen source={source} />
      </Stack>
    </AppPage>
  );
};

export default ImporterBySourcePage;