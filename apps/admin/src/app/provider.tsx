"use client";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SuperTokensProvider from "@/components/auth/SuperTokensProvider";

/**
 * Basic configuration for wrapper services
 */
import { OpenAPI as ServerOpenAPI } from "@/wrapper/server";
import { OpenAPI as SearchOpenAPI } from "@/wrapper/search";
import {
  setProjectContext,
  setRoutingComponent,
  setRoutingManager,
} from "@repo/ui";
import { useRouter } from "next/navigation";
import { setupWrapper } from "@repo/wrapper";
import { LinkWrapper } from "@/components/general/LinkWrapper.tsx";

ServerOpenAPI.BASE = process.env.NEXT_PUBLIC_SERVER_URL!;
ServerOpenAPI.WITH_CREDENTIALS = true;
SearchOpenAPI.BASE = process.env.NEXT_PUBLIC_SEARCH_URL!;

setRoutingComponent(LinkWrapper);
setRoutingManager(useRouter);
setProjectContext({
  client: "admin",
  s3BucketUrl: process.env.NEXT_PUBLIC_S3_BUCKET_URL!,
});
setupWrapper({
  searchBaseURL: process.env.NEXT_PUBLIC_SEARCH_URL!,
  serverBaseURL: process.env.NEXT_PUBLIC_SERVER_URL!,
});

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
