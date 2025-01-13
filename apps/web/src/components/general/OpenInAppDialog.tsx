import React, { useEffect, useRef } from "react";
import useOnMobile from "@/components/general/hooks/useOnMobile";
import { useRouter } from "next/router";
import { Anchor, Button, Divider, Drawer, Image, Stack } from "@mantine/core";
import {
    useDisclosure,
    useIsFirstRender,
    useSessionStorage,
} from "@mantine/hooks";

/**
 * Component that shows an 'open in app' dialog for mobile users.
 * @constructor
 */
const OpenInAppDialog = () => {
    const router = useRouter();
    const onMobile = useOnMobile();

    /**
     * Necessary because 'useOnMobile' returns true by default for SSR
     */
    const isFirstRender = useIsFirstRender();

    const [hasBeenClosed, setHasBeenClosed] = useSessionStorage({
        key: "open-in-app-dialog-closed",
        defaultValue: false,
        getInitialValueInEffect: false,
    });

    const [opened, { close, open }] = useDisclosure();

    useEffect(() => {
        if (
            !isFirstRender &&
            onMobile &&
            router.pathname !== "/" &&
            !hasBeenClosed
        ) {
            open();
        }
    }, [
        hasBeenClosed,
        isFirstRender,
        onMobile,
        open,
        router.pathname,
        setHasBeenClosed,
    ]);

    return (
        <Drawer
            opened={opened}
            onClose={() => {
                close();
                setHasBeenClosed(true);
            }}
            withCloseButton
            size="30vh"
            radius="md"
            position={"bottom"}
            title={"GameNode is (even) better in the app!"}
        >
            <Stack className={"w-full items-center"}>
                <Anchor
                    href={
                        typeof window != "undefined"
                            ? window.location.href
                            : process.env.NEXT_PUBLIC_DOMAIN_WEBSITE
                    }
                    onClick={() => {
                        setHasBeenClosed(true);
                    }}
                >
                    <Button size={"md"}>Open in app</Button>
                </Anchor>
                <Divider
                    label={"OR"}
                    orientation={"horizontal"}
                    className={"w-full"}
                />
                <Anchor
                    className={"w-40"}
                    href={
                        "https://play.google.com/store/apps/details?id=app.gamenode&pcampaignid=web_share"
                    }
                >
                    <Image
                        src={"/img/google_play_badge_english.png"}
                        alt={"Get it on Google Play badge"}
                    />
                </Anchor>
            </Stack>
        </Drawer>
    );
};

export default OpenInAppDialog;
