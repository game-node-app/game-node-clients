import React from "react";
import { useUserLibrary } from "@/components/library/hooks/useUserLibrary";
import classes from "../library-view-navbar.module.css";
import { IconSearch } from "@tabler/icons-react";
import { Box, Group, Space, Text, TextInput } from "@mantine/core";
import Link from "next/link";
import { Collection } from "@/wrapper/server";
import LibraryViewSidebarCollections from "@/components/library/view/sidebar/LibraryViewSidebarCollections";
import useUserProfile from "@/components/profile/hooks/useUserProfile";

interface ILibraryViewSidebarProps {
    userId: string | undefined;
}

const buildCollectionsItems = (collections: Collection[]) => {
    if (collections == undefined || collections.length === 0) {
        return null;
    }
};

const LibraryViewSidebar = ({ userId }: ILibraryViewSidebarProps) => {
    const userLibraryQuery = useUserLibrary(userId);
    const userLibrary = userLibraryQuery.data;
    const userProfileQuery = useUserProfile(userId);
    const username = userProfileQuery.data?.username;
    return (
        <nav className={classes.navbar}>
            <div className={classes.section}>
                <Link href={`/library/${userId}`} className={classes.mainLink}>
                    <Text className="w-full" ta={"center"}>
                        {username}'s Library
                    </Text>
                </Link>
            </div>
            <LibraryViewSidebarCollections library={userLibrary!} />
        </nav>
    );
};

export default LibraryViewSidebar;
