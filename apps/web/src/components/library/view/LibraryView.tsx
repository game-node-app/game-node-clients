import React, { PropsWithChildren } from "react";
import LibraryViewSidebar from "@/components/library/view/sidebar/LibraryViewSidebar";
import useOnMobile from "@/components/general/hooks/useOnMobile";
import { Container, Flex, Grid, SelectProps } from "@mantine/core";
import LibraryViewCollectionsSelect from "@/components/library/view/sidebar/LibraryViewCollectionsSelect";
import { useRouter } from "next/router";

interface ILibraryViewProps extends PropsWithChildren {
    userId: string | undefined;
    collectionId: string | undefined;
}

/**
 * LibraryView should be used in any page that renders under the /library route.
 * It provides a sidebar on desktop and a bottom navigation on mobile.
 * @param children - The main content to render (e.g. a collection entries listing).
 * @param userId
 * @param collectionSelectProps
 * @constructor
 */
const LibraryView = ({ children, userId, collectionId }: ILibraryViewProps) => {
    const onMobile = useOnMobile();
    const router = useRouter();

    return (
        <Container fluid pl={onMobile ? undefined : 0} w={"100%"} h={"100%"}>
            {onMobile && (
                <Flex w={"100%"} justify={"center"}>
                    <LibraryViewCollectionsSelect
                        userId={userId}
                        value={collectionId}
                        onChange={(value) => {
                            if (
                                collectionId != undefined &&
                                value == undefined
                            ) {
                                router.push(`/library/${userId}`);
                                return;
                            }
                            router.push(
                                `/library/${userId}/collection/${value}`,
                            );
                        }}
                    />
                </Flex>
            )}
            <Grid columns={12} w={"100%"} h={"100%"}>
                <Grid.Col
                    span={{ base: 0, lg: 3 }}
                    display={onMobile ? "none" : undefined}
                >
                    <LibraryViewSidebar userId={userId} />
                </Grid.Col>

                <Grid.Col span={{ base: 12, lg: 9 }} h={"100%"}>
                    {children}
                </Grid.Col>
            </Grid>
        </Container>
    );
};

export default LibraryView;
