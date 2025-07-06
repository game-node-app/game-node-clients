import React, { useEffect, useState } from "react";
import { Input, SegmentedControl, SegmentedControlProps } from "@mantine/core";
import { useUserId, useUserLibrary } from "#@/components";
import { Collection } from "@repo/wrapper/server";

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

          setHasMandatoryStatus(true);
          return;
        }
      }

      setHasMandatoryStatus(false);
    }
  }, [onChange, selectedCollectionIds, userCollections, value]);

  return (
    <Input.Wrapper
      label={"Status"}
      description={
        hasMandatoryStatus
          ? "Disabled because of selected collections' default status."
          : null
      }
      className={"w-full"}
    >
      <SegmentedControl
        value={value}
        onChange={onChange}
        data={[
          {
            label: "Playing",
            value: Collection.defaultEntryStatus.PLAYING,
          },
          {
            label: "Finished",
            value: Collection.defaultEntryStatus.FINISHED,
          },
          {
            label: "Planned",
            value: Collection.defaultEntryStatus.PLANNED,
          },
          {
            label: "Dropped",
            value: Collection.defaultEntryStatus.DROPPED,
          },
        ]}
        readOnly={hasMandatoryStatus}
        fullWidth
        {...others}
      ></SegmentedControl>
    </Input.Wrapper>
  );
};

export { CollectionEntryStatusSelect };
