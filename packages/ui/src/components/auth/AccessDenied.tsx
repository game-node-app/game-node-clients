import { Button, Center, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "#@/util/link";
import { signOut } from "#@/components/auth/signOut";

const AccessDenied = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();

  return (
    <Center className={"min-h-[60vh] p-4"}>
      <Stack align={"center"} className={"max-w-md text-center"}>
        <Title order={3}>{t("auth.accessDenied.title")}</Title>
        <Text c={"dimmed"}>{t("auth.accessDenied.body")}</Text>
        <Button onClick={() => router.push("/")}>
          {t("auth.accessDenied.goHome")}
        </Button>
        <Button variant={"subtle"} onClick={() => signOut(queryClient)}>
          {t("auth.accessDenied.signOut")}
        </Button>
      </Stack>
    </Center>
  );
};

export { AccessDenied };
