import { Link } from "#@/util";
import { Box, Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { useMemo } from "react";

export type PreferencesActiveCategory = "connections" | "account" | "library";

interface Props {
  activeItem: PreferencesActiveCategory;
  onChange: (activeCategory: PreferencesActiveCategory) => void;
}

const PreferencesScreenSideBar = ({ activeItem, onChange }: Props) => {
  const { t } = useTranslation();

  const categories = useMemo(
    () => [
      {
        label: t("preferences.categories.connections"),
        activeCategoryName: "connections" as PreferencesActiveCategory,
      },
      {
        label: t("preferences.categories.account"),
        activeCategoryName: "account" as PreferencesActiveCategory,
      },
      {
        label: t("preferences.categories.library"),
        activeCategoryName: "library" as PreferencesActiveCategory,
      },
    ],
    [t],
  );

  const itemsElements = useMemo(() => {
    return categories.map((item) => {
      const isActiveItem = item.activeCategoryName === activeItem;
      return (
        <Link
          key={item.activeCategoryName}
          href={``}
          onClick={(evt) => {
            evt.preventDefault();
            onChange(item.activeCategoryName);
          }}
        >
          <Box
            className={`w-full flex justify-center items-center h-12 ${isActiveItem ? "bg-brand-5" : undefined}`}
          >
            <Text fz={"1.3rem"} fw={"bold"}>
              {item.label}
            </Text>
          </Box>
        </Link>
      );
    });
  }, [activeItem, onChange, categories]);

  return (
    <Stack gap={0} className={"w-full h-96 justify-between"}>
      <Stack gap={0} className={"w-full"}>
        {itemsElements}
      </Stack>
      <Stack className={"w-full items-center"}>
        <Link href={"/about"}>
          <Text c={"dimmed"}>{t("preferences.links.reportBug")}</Text>
        </Link>
        <Link href={"/auth/logout"}>
          <Text c={"dimmed"}>{t("preferences.links.signOut")}</Text>
        </Link>
      </Stack>
    </Stack>
  );
};

export { PreferencesScreenSideBar };
