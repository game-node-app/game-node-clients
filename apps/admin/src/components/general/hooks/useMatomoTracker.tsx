import { useLocalStorage } from "@mantine/hooks";
import React, { useCallback, useEffect } from "react";
import { notifications } from "@mantine/notifications";
import { Button, Flex, Group, Stack, Text } from "@mantine/core";
import { init, push } from "@socialgouv/matomo-next";
import useUserId from "@/components/auth/hooks/useUserId";
import MainAppLink from "@/components/general/MainAppLink";

const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL;
const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID;
const IS_DEV_ENV = process.env.NODE_ENV !== "production";

export function useMatomoTracker() {
    const userId = useUserId();

    const [hasAcceptedCookies, setHasAcceptedCookies] =
        useLocalStorage<boolean>({
            key: "cookie-consent",
            defaultValue: false,
            getInitialValueInEffect: false,
        });

    const showCookieConsentNotification = useCallback(() => {
        if (hasAcceptedCookies != undefined && hasAcceptedCookies) return;
        notifications.show({
            id: "cookie-notice",
            title: "Notice",
            withCloseButton: false,
            autoClose: false,
            withBorder: true,
            message: (
                <Stack className={"w-full items-start"}>
                    <Text>
                        We use cookies and similar storage methods to keep track
                        of your session and how you are using our website.
                    </Text>
                    <Flex className={"w-full justify-end"}>
                        <Group>
                            <MainAppLink href={"/privacy"} className={"w-fit"}>
                                <Button color={"indigo"}>Learn more</Button>
                            </MainAppLink>
                            <Button
                                onClick={() => {
                                    setHasAcceptedCookies(true);
                                    notifications.hide("cookie-notice");
                                }}
                            >
                                I understand
                            </Button>
                        </Group>
                    </Flex>
                </Stack>
            ),
        });
    }, [hasAcceptedCookies, setHasAcceptedCookies]);
    useEffect(() => {
        if (!hasAcceptedCookies) {
            showCookieConsentNotification();
        }
    }, [hasAcceptedCookies, showCookieConsentNotification]);

    // Effect to trigger matomo initialization
    useEffect(() => {
        if (
            !IS_DEV_ENV &&
            MATOMO_URL != undefined &&
            MATOMO_SITE_ID != undefined
        ) {
            init({
                url: MATOMO_URL,
                siteId: MATOMO_SITE_ID,
            });
        }
    }, []);

    // Effect to sync userId with Matomo's user ID
    useEffect(() => {
        if (userId) {
            push(["setUserId", userId]);
        }
    }, [userId]);
}
