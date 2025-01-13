import "@mantine/core/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/notifications/styles.css";

import "mantine-react-table/styles.css";

import "@/components/globals.css";

import {
    ColorSchemeScript,
    DirectionProvider,
    MantineProvider,
} from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { theme } from "@/styles/theme";
import { AppProvider } from "./provider";
import SuperTokensProvider from "@/components/auth/SuperTokensProvider";

/**
 * Basic configuration for wrapper services
 */
import { OpenAPI as ServerOpenAPI } from "@/wrapper/server";
import { OpenAPI as SearchOpenAPI } from "@/wrapper/search";
import MatomoWrapper from "@/components/general/MatomoWrapper";

ServerOpenAPI.BASE = process.env.NEXT_PUBLIC_SERVER_URL!;
ServerOpenAPI.WITH_CREDENTIALS = true;
SearchOpenAPI.BASE = process.env.NEXT_PUBLIC_SEARCH_URL!;

export const metadata = {
    metadataBase: new URL("https://admin.gamenode.app/"),
    title: { default: "GameNode Admin", template: "%s | GameNode Admin" },
    description: "GameNode's admin dashboard.",
    authors: [
        {
            name: "Lamarcke",
            url: "https://github.com/Lamarcke",
        },
    ],
    creator: "Lamarcke",
    manifest: "https://admin.gamenode.app/site.webmanifest",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en-US">
            <head>
                <ColorSchemeScript />
                <meta
                    name="viewport"
                    content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
                />
            </head>
            <body>
                <SuperTokensProvider>
                    <DirectionProvider>
                        <MantineProvider
                            theme={theme}
                            defaultColorScheme={"dark"}
                        >
                            <ModalsProvider>
                                <AppProvider>{children}</AppProvider>
                            </ModalsProvider>
                            <Notifications />
                            <MatomoWrapper />
                        </MantineProvider>
                    </DirectionProvider>
                </SuperTokensProvider>
            </body>
        </html>
    );
}
