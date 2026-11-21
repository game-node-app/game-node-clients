import { Button, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { authClient, useRedirectToAuth } from "@repo/ui";
import { IconLock } from "@tabler/icons-react";
import type { PropsWithChildren } from "react";

type SignedOutTabKey = "library" | "notifications" | "wrapped";

interface Props extends PropsWithChildren {
  /** Which tab screen is being gated; selects the prompt title. */
  screen: SignedOutTabKey;
  /** When false, children render for visitors too (no placeholder). */
  requireAuth?: boolean;
}

/**
 * Replaces the signed-out redirect on root tab screens. The tab stays selected, the menu button
 * stays in the header (no back chevron), and the visitor opts in to the sign-in screen, which then
 * returns them here.
 */
const SignedOutTabPlaceholder = ({
  screen,
  requireAuth = true,
  children,
}: Props) => {
  const { t } = useTranslation();
  const { data: session, isPending } = authClient.useSession();
  const redirectToAuth = useRedirectToAuth();

  if (!requireAuth || session) {
    return <>{children}</>;
  }
  if (isPending) {
    return null;
  }

  return (
    <Stack
      align={"center"}
      justify={"center"}
      gap={"md"}
      className={"min-h-[60vh] px-6 text-center"}
    >
      <IconLock size={40} stroke={1.5} className={"text-dimmed"} aria-hidden />
      <Title order={3} size={"h4"}>
        {t(`mobile.signedOut.${screen}`)}
      </Title>
      <Text size={"sm"} c={"dimmed"} maw={320}>
        {t("mobile.signedOut.description")}
      </Text>
      <Button
        radius={"xl"}
        size={"md"}
        onClick={() => {
          redirectToAuth().catch(console.error);
        }}
      >
        {t("actions.loginCta")}
      </Button>
    </Stack>
  );
};

export { SignedOutTabPlaceholder };
