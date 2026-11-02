import React from "react";
import { FloatingPosition, Menu, Tooltip, UnstyledButton } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import {
  IconCheck,
  IconDeviceGamepad2,
  IconPalette,
} from "@tabler/icons-react";
import { getServerStoredIcon } from "#@/util/getServerStoredImages";
import { APP_THEMES, AppTheme, useAppTheme } from "./useAppTheme";

// the server's white platform icons; GameNode has no mark that reads at this size
const PLATFORM_ICONS: Record<Exclude<AppTheme, "gamenode">, string> = {
  playstation: "playstation",
  xbox: "xbox",
  switch: "nintendo",
  bigpicture: "steam",
};

interface Props extends React.HTMLAttributes<HTMLButtonElement> {
  position?: FloatingPosition;
  /** Target content; defaults to the palette icon. */
  children?: React.ReactNode;
}

/**
 * Button that opens the app theme picker. Each shell decides where to place it.
 */
const ThemeSwitcherMenu = ({
  position = "right-start",
  children,
  ...targetProps
}: Props) => {
  const { t } = useTranslation();
  const [theme, setTheme] = useAppTheme();

  return (
    <Menu position={position} offset={12} withinPortal zIndex={999}>
      <Tooltip label={t("appTheme.label")} disabled={children != undefined}>
        <Menu.Target>
          <UnstyledButton aria-label={t("appTheme.label")} {...targetProps}>
            {children ?? <IconPalette />}
          </UnstyledButton>
        </Menu.Target>
      </Tooltip>
      <Menu.Dropdown>
        <Menu.Label>{t("appTheme.label")}</Menu.Label>
        {APP_THEMES.map((option) => (
          <Menu.Item
            key={option}
            onClick={() => setTheme(option)}
            leftSection={
              option === "gamenode" ? (
                <IconDeviceGamepad2 size={16} />
              ) : (
                <img
                  src={getServerStoredIcon(PLATFORM_ICONS[option])}
                  alt={""}
                  width={16}
                  height={16}
                  className={"object-contain"}
                />
              )
            }
            rightSection={option === theme ? <IconCheck size={16} /> : null}
          >
            {t(`appTheme.options.${option}`)}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
};

export { ThemeSwitcherMenu };
