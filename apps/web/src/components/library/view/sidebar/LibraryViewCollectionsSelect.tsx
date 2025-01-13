import React, { useMemo } from "react";
import { useCollection } from "@/components/collection/hooks/useCollection";
import {
    ComboboxData,
    ComboboxItem,
    ComboboxItemGroup,
    Select,
    SelectProps,
} from "@mantine/core";
import { Library } from "@/wrapper/server";
import { useUserLibrary } from "@/components/library/hooks/useUserLibrary";

interface Props extends SelectProps {
    userId: string | undefined;
}

const LibraryViewCollectionsSelect = ({ userId, ...others }: Props) => {
    const libraryQuery = useUserLibrary(userId);
    const collectionOptions = useMemo<ComboboxItemGroup[] | undefined>(() => {
        const collections = libraryQuery.data?.collections.filter(
            (collection) => !collection.isFeatured,
        );
        const featuredCollections = libraryQuery.data?.collections.filter(
            (collection) => collection.isFeatured,
        );
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
            {...others}
        />
    );
};

export default LibraryViewCollectionsSelect;
