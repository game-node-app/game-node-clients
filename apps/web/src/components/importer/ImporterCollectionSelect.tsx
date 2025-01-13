import React, { useEffect, useMemo, useState } from "react";
import {
    ComboboxItem,
    Group,
    MultiSelect,
    MultiSelectProps,
    Select,
    Text,
} from "@mantine/core";
import { useUserLibrary } from "@/components/library/hooks/useUserLibrary";

interface Props extends MultiSelectProps {
    userId: string | undefined;
    onChange: (values: string[]) => void;
}

const ImporterCollectionSelect = ({ userId, onChange, ...others }: Props) => {
    const userLibraryQuery = useUserLibrary(userId);
    const collections = userLibraryQuery.data?.collections;
    const [
        hasSelectedFinishedGamesCollection,
        setHasSelectedFinishedGamesCollection,
    ] = useState();

    const collectionsSelectOptions = useMemo(() => {
        if (
            userLibraryQuery.data == undefined ||
            userLibraryQuery.data.collections == undefined ||
            userLibraryQuery.data.collections.length === 0
        ) {
            return undefined;
        }

        return userLibraryQuery.data.collections.map(
            (collection): ComboboxItem => {
                return {
                    label: collection.name,
                    value: collection.id,
                };
            },
        );
    }, [userLibraryQuery.data]);

    return (
        <MultiSelect
            w={"100%"}
            label={"Select collections"}
            data={collectionsSelectOptions}
            clearable={false}
            searchable
            onChange={onChange}
            {...others}
        />
    );
};

export default ImporterCollectionSelect;
