import type { UIPresenterRegistry } from "#@/context/registry";
import { xboxPresenters } from "./themes/xbox/presenters";

export interface AppThemeDefinition {
  /** Server icon (getServerStoredIcon); without one the switcher shows the default icon. */
  icon?: string;
  /** "console" = ConsoleHome + top navigation. Palette (themes/<name>/theme.css) and layout are independent. */
  layout: "default" | "console";
  /** Components this theme replaces. */
  presenters?: Partial<UIPresenterRegistry>;
}

const DEFINITIONS = {
  gamenode: { layout: "default" },
  playstation: { layout: "console", icon: "playstation" },
  xbox: { layout: "console", icon: "xbox", presenters: xboxPresenters },
  switch: { layout: "console", icon: "nintendo" },
  bigpicture: { layout: "console", icon: "steam" },
} satisfies Record<string, AppThemeDefinition>;

export type AppTheme = keyof typeof DEFINITIONS;

/** Every app theme; the single source for the theme list, icons, layout and presenters. */
export const THEMES: Record<AppTheme, AppThemeDefinition> = DEFINITIONS;

export const APP_THEMES = Object.keys(THEMES) as AppTheme[];
