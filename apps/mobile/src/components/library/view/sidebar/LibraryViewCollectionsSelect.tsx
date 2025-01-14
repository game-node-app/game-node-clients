import React, { useMemo } from "react";
import { ComboboxItemGroup, Select, SelectProps } from "@mantine/core";
import { useUserLibrary } from "@/components/library/hooks/useUserLibrary";

interface Props extends SelectProps {
    userId: string | undefined;
}

/**
 *
 * Make sure to pass 'value' when using 'controlled' (the default) in this select.
 * @returns
 */
const LibraryViewCollectionsSelect = ({ userId, ...others }: Props) => {
    const libraryQuery = useUserLibrary(userId);
    const collectionOptions = useMemo<ComboboxItemGroup[] | undefined>(() => {
        const collections = libraryQuery.data?.collections.filter((collection) => !collection.isFeatured);
        const featuredCollections = libraryQuery.data?.collections.filter((collection) => collection.isFeatured);
        const options: ComboboxItemGroup[] = [];
        if (featuredCollections && featuredCollections.length > 0) {
            options.push({
                group: "Featured",
                items: featuredCollections.map((collection) => {
                    return {
                        label: collection.name,
                        value: collection.id,
                    };
                }),
            });
        }
        if (collections && collections.length > 0) {
            options.push({
                group: "All",
                items: collections.map((collection) => {
                    return {
                        label: collection.name,
                        value: collection.id,
                    };
                }),
            });
        }

        return options;
    }, [libraryQuery.data?.collections]);
    return (
        <Select
            w={"100%"}
            placeholder={"Select a collection"}
            searchable
            clearable
            data={collectionOptions}
            limit={10}
            description="You can search for a collection by typing its name"
            {...others}
        />
    );
};

export default LibraryViewCollectionsSelect;
