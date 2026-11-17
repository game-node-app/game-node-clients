import { Button, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconTrophy } from "@tabler/icons-react";
import { useAuthPath } from "#@/context";
import { cn } from "#@/util/cn";
import { Link } from "#@/util/link";

interface Props {
  /** Where to come back after signing in. */
  redirectTo: string;
  title?: string;
  description?: string;
  className?: string;
}

/**
 * Invites guests to sign in; both actions go to the auth page and come back here.
 */
const DailyRankingSignInCard = ({
  redirectTo,
  title,
  description,
  className,
}: Props) => {
  const { t } = useTranslation();
  const authPath = useAuthPath();
  const href = `${authPath}?redirectTo=${encodeURIComponent(redirectTo)}`;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-4 rounded-[14px] border border-solid border-brand-5 bg-nav-canvas px-5 py-4 shadow-[0_-8px_12px_rgba(0,0,0,0.6)]",
        className,
      )}
    >
      <span
        className={
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-nav-accent-subtle text-brand-5"
        }
      >
        <IconTrophy size={22} aria-hidden />
      </span>
      <div className={"flex min-w-[200px] flex-1 flex-col gap-0.5"}>
        <Text fz={16} fw={700} c={"white"}>
          {title ?? t("daily.ranking.signIn.title")}
        </Text>
        <Text fz={13} lh={"19px"} c={"#ADADAD"} maw={460}>
          {description ?? t("daily.ranking.signIn.description")}
        </Text>
      </div>
      <div className={"flex gap-2"}>
        <Button
          component={Link}
          href={href}
          variant={"default"}
          radius={8}
          h={40}
          px={16}
          fz={14}
          className={"!border-line !bg-transparent"}
        >
          {t("daily.ranking.signIn.create")}
        </Button>
        <Button
          component={Link}
          href={href}
          radius={8}
          h={40}
          px={16}
          fz={14}
          className={"!text-[#0B0B0B]"}
        >
          {t("daily.ranking.signIn.signIn")}
        </Button>
      </div>
    </div>
  );
};

export { DailyRankingSignInCard };
