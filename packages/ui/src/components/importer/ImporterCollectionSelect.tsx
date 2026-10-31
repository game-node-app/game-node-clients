import { useUserLibrary } from "#@/components/library/hooks/useUserLibrary";
import { ComboboxItem, MultiSelect, MultiSelectProps } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { useMemo } from "react";

interface Props extends MultiSelectProps {
  userId: string | undefined;
  onChange: (values: string[]) => void;
}

const ImporterCollectionSelect = ({ userId, onChange, ...others }: Props) => {
  const { t } = useTranslation();
  const userLibraryQuery = useUserLibrary(userId);

  const collectionsSelectOptions = useMemo(() => {
    if (
      userLibraryQuery.data == undefined ||
      userLibraryQuery.data.collections == undefined ||
      userLibraryQuery.data.collections.length === 0
    ) {
      return undefined;
    }

    return userLibraryQuery.data.collections.map((collection): ComboboxItem => {
      return {
        label: collection.name,
        value: collection.id,
      };
    });
  }, [userLibraryQuery.data]);

  return (
    <MultiSelect
      w={"100%"}
      label={t("collectionEntry.labels.collections")}
      data={collectionsSelectOptions}
      clearable={false}
      searchable
      onChange={onChange}
      {...others}
    />
  );
};

export { ImporterCollectionSelect };