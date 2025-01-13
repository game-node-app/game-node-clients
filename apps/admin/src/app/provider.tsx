"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SuperTokensProvider from "@/components/auth/SuperTokensProvider";

/**
 * Basic configuration for wrapper services
 */
import { OpenAPI as ServerOpenAPI } from "@/wrapper/server";
import { OpenAPI as SearchOpenAPI } from "@/wrapper/search";
import { useMatomoTracker } from "@/components/general/hooks/useMatomoTracker";

ServerOpenAPI.BASE = process.env.NEXT_PUBLIC_SERVER_URL!;
ServerOpenAPI.WITH_CREDENTIALS = true;
SearchOpenAPI.BASE = process.env.NEXT_PUBLIC_SEARCH_URL!;

const queryClient = new QueryClient();

export function AppProvider({ children }: { children: React.ReactNode }) {
    return (
        <SuperTokensProvider>
            <QueryClientProvider client={queryClient}>
                {children}
                {/* <ReactQueryDevtools initialIsOpen={false} /> */}
            </QueryClientProvider>
        </SuperTokensProvider>
    );
}
