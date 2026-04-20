import React, { useEffect, useMemo, useState } from "react";
import {
  Input,
  Scroller,
  SegmentedControl,
  SegmentedControlProps,
} from "@mantine/core";
import { useUserId, useUserLibrary } from "#@/components";
import { Collection } from "@repo/wrapper/server";
import { useTranslation } from "@repo/locales";

interface Props
  extends Omit<SegmentedControlProps, "data" | "value" | "onChange"> {
  selectedCollectionIds: string[];
  value: string;
  onChange: (value: string) => void;
}

const CollectionEntryStatusSelect = ({
  selectedCollectionIds,
  value,
  onChange,
  ...others
}: Props) => {
  const { t } = useTranslation();
  const userId = useUserId();
  const userLibraryQuery = useUserLibrary(userId);
  const userCollections = userLibraryQuery.data?.collections;
  const [hasMandatoryStatus, setHasMandatoryStatus] = useState(false);

  // Sync status select with current selected collections
  useEffect(() => {
    if (userCollections) {
      const selectedCollections = userCollections.filter((collection) =>
        selectedCollectionIds.includes(collection.id),
      );
      for (const userCollection of selectedCollections) {
        if (userCollection.defaultEntryStatus != undefined) {
          if (userCollection.defaultEntryStatus !== value) {
            onChange(userCollection.defaultEntryStatus);
          }

          // eslint-disable-next-line react-hooks/set-state-in-effect
          setHasMandatoryStatus(true);
          return;
        }
      }

      setHasMandatoryStatus(false);
    }
  }, [onChange, selectedCollectionIds, userCollections, value]);

  const inputDescription = useMemo(() => {
    if (hasMandatoryStatus) {
      return t("collectionEntry.descriptions.statusDisabled");
    }

    if (value === Collection.defaultEntryStatus.ONGOING) {
      return t("collectionEntry.descriptions.statusOngoing");
    }

    return null;
  }, [hasMandatoryStatus, t, value]);

  return (
    <Input.Wrapper
      label={t("collectionEntry.labels.status")}
      description={inputDescription}
      className={"w-full"}
    >
      <SegmentedControl
        fullWidth
        value={value}
        onChange={onChange}
        data={[
          {
            label: t("collectionEntry.statuses.playing"),
            value: Collection.defaultEntryStatus.PLAYING,
          },
          {
            label: t("collectionEntry.statuses.finished"),
            value: Collection.defaultEntryStatus.FINISHED,
          },
          {
            label: t("collectionEntry.statuses.planned"),
            value: Collection.defaultEntryStatus.PLANNED,
          },
          {
            label: t("collectionEntry.statuses.dropped"),
            value: Collection.defaultEntryStatus.DROPPED,
          },
          {
            label: t("collectionEntry.statuses.ongoing"),
            value: Collection.defaultEntryStatus.ONGOING,
          },
        ]}
        readOnly={hasMandatoryStatus}
        {...others}
      ></SegmentedControl>
    </Input.Wrapper>
  );
};

export { CollectionEntryStatusSelect };
