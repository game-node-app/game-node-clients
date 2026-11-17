import { useTranslation } from "@repo/locales";
import {
  IconLock,
  type IconProps,
  IconUsers,
  IconWorld,
} from "@tabler/icons-react";
import type { ComponentType } from "react";
import type { LibraryVisibilityLevel } from "./LibraryVisibilityLevel";

export interface LibraryVisibilityOption {
  value: LibraryVisibilityLevel;
  label: string;
  description: string;
  icon: ComponentType<IconProps>;
}

/**
 * Translated options for the three library visibility levels, in the order
 * `public`, `followers`, `private` (least to most restrictive).
 */
export function useLibraryVisibilityOptions(): LibraryVisibilityOption[] {
  const { t } = useTranslation();

  return [
    {
      value: "public",
      label: t("libraryVisibility.levels.public.label"),
      description: t("libraryVisibility.levels.public.description"),
      icon: IconWorld,
    },
    {
      value: "followers",
      label: t("libraryVisibility.levels.followers.label"),
      description: t("libraryVisibility.levels.followers.description"),
      icon: IconUsers,
    },
    {
      value: "private",
      label: t("libraryVisibility.levels.private.label"),
      description: t("libraryVisibility.levels.private.description"),
      icon: IconLock,
    },
  ];
}
