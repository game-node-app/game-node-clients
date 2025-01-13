"use client";

import { Box, ScrollArea } from "@mantine/core";

import type { NavItem } from "@/types/nav-item";
import { NavLinksGroup } from "./NavLinksGroup";
import classes from "./Navbar.module.css";
import { UserAvatarGroup } from "@/components/general/avatar/UserAvatarGroup";
import useUserId from "@/components/auth/hooks/useUserId";

interface Props {
    data: NavItem[];
    hidden?: boolean;
}

export function Navbar({ data }: Props) {
    const userId = useUserId();

    const links = data.map((item) => (
        <NavLinksGroup key={item.label} {...item} />
    ));

    return (
        <>
            <ScrollArea className={classes.links}>
                <div className={classes.linksInner}>{links}</div>
            </ScrollArea>

            <div className={classes.footer}>
                <Box className={"w-full p-4"}>
                    {userId && <UserAvatarGroup userId={userId} />}
                </Box>
            </div>
        </>
    );
}
