import React, { PropsWithChildren } from "react";
import useOnMobile from "@/components/general/hooks/useOnMobile";
import { Flex, Grid, Stack } from "@mantine/core";
import LibraryViewCollectionsSelect from "@/components/library/view/sidebar/LibraryViewCollectionsSelect";

interface ILibraryViewProps extends PropsWithChildren {
    userId: string | undefined;
    collectionId: string | null;
    onChange: (collectionId: string | null) => void;
}

/**
 * LibraryView should be used in any page that renders under the /library route.
 * It provides a sidebar on desktop and a bottom navigation on mobile.
 * @param children - The main content to render (e.g. a collection entries listing).
 * @param userId
 * @param collectionSelectProps
 * @constructor
 */
const LibraryView = ({ children, userId, collectionId, onChange }: ILibraryViewProps) => {
    return (
        <Stack w={"100%"} h={"100%"}>
            <Flex w={"100%"} justify={"center"}>
                <LibraryViewCollectionsSelect
                    userId={userId}
                    value={collectionId}
                    onChange={(value) => {
                        onChange(value);
                    }}
                    onClear={() => {
                        onChange(null);
                    }}
                />
            </Flex>
            <Stack w={"100%"} h={"100%"}>
                {children}
            </Stack>
        </Stack>
    );
};

export default LibraryView;
