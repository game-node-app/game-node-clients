import { Loader } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { DiscordLogo, GoogleLogo, XLogo } from "#@/assets/auth";
import classes from "./SignIn.module.css";

export type AuthProvider = "google" | "discord" | "twitter";

const LOGOS = {
  google: GoogleLogo,
  discord: DiscordLogo,
  twitter: XLogo,
} as const;

interface Props {
  provider: AuthProvider;
  /** This button's provider is the one being signed in with. */
  pending: boolean;
  /** Another provider is pending. */
  disabled: boolean;
  onClick: () => void;
}

const ProviderButton = ({ provider, pending, disabled, onClick }: Props) => {
  const { t } = useTranslation();
  const Logo = LOGOS[provider];

  return (
    <button
      type={"button"}
      className={`${classes.provider} ${classes[provider]}`}
      disabled={disabled || pending}
      data-dimmed={disabled}
      aria-busy={pending}
      onClick={onClick}
    >
      <span className={classes.providerIcon}>
        {pending ? <Loader size={18} color={"currentColor"} /> : <Logo />}
      </span>
      <span className={classes.providerLabel}>
        {t(`auth.providers.${provider}`)}
      </span>
    </button>
  );
};

export { ProviderButton };
