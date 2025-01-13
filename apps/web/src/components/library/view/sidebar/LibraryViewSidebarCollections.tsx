import React, { useCallback } from "react";
import { Library } from "@/wrapper/server";
import {
    Accordion,
    AccordionControlProps,
    ActionIcon,
    Center,
    Group,
    ScrollArea,
    Text,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import classes from "@/components/library/view/library-view-navbar.module.css";
import Link from "next/link";
import { useDisclosure } from "@mantine/hooks";
import CollectionCreateOrUpdateModal from "@/components/collection/form/modal/CollectionCreateOrUpdateModal";
import useUserId from "@/components/auth/hooks/useUserId";

interface ILibraryViewSidebarCollectionsProps {
    library: Library | undefined;
}

const LibraryViewSidebarCollections = ({
    library,
}: ILibraryViewSidebarCollectionsProps) => {
    const [modalOpened, modalUtils] = useDisclosure();

    const ownUserId = useUserId();

    const buildCollectionsItems = useCallback(() => {
        const userId = library?.userId;
        return library?.collections.map((collection) => {
            return (
                <Link
                    key={collection.id}
                    href={`/library/${userId}/collection/${collection.id}`}
                    className={classes.mainLink}
                >
                    <Text className="w-full" ta={"center"}>
                        {collection.name}
                    </Text>
                </Link>
            );
        });
    }, [library?.collections, library?.userId]);

    const buildFeaturedCollectionsItems = useCallback(() => {
        const userId = library?.userId;
        const featuredCollections = library?.collections.filter(
            (collection) => collection.isFeatured,
        );
        return featuredCollections?.map((collection) => {
            return (
                <Link
                    key={collection.id}
                    href={`/library/${userId}/collection/${collection.id}`}
                    className={classes.mainLink}
                >
                    <Text className="w-full" ta={"center"}>
                        {collection.name}
                    </Text>
                </Link>
            );
        });
    }, [library?.collections, library?.userId]);

    const isOwnLibrary = library != undefined && library.userId === ownUserId;

    if (!library || !library.collections || library.collections.length === 0) {
        // TODO: Add fallback component
        return null;
    }

    return (
        <div className={classes.section}>
            <CollectionCreateOrUpdateModal
                opened={modalOpened}
                onClose={modalUtils.close}
            />
            <Accordion
                variant={"default"}
                defaultValue={"featured"}
                chevronPosition={"left"}
            >
                <Accordion.Item value={"all"}>
                    <Group wrap={"nowrap"} gap={0}>
                        <Accordion.Control ta={"center"} pr={0}>
                            All Collections
                        </Accordion.Control>
                        {isOwnLibrary && (
                            <ActionIcon
                                size="xl"
                                variant="subtle"
                                color="gray"
                                onClick={modalUtils.open}
                            >
                                <IconPlus size="1rem" />
                            </ActionIcon>
                        )}
                    </Group>

                    <Accordion.Panel>
                        <ScrollArea.Autosize mah={200}>
                            {buildCollectionsItems()}
                        </ScrollArea.Autosize>
                    </Accordion.Panel>
                </Accordion.Item>
                <Accordion.Item value={"featured"}>
                    <Accordion.Control ta={"center"}>
                        Featured Collections
                    </Accordion.Control>
                    <Accordion.Panel>
                        <ScrollArea.Autosize mah={200}>
                            {buildFeaturedCollectionsItems()}
                        </ScrollArea.Autosize>
                    </Accordion.Panel>
                </Accordion.Item>
            </Accordion>
        </div>
    );
};

export default LibraryViewSidebarCollections;
