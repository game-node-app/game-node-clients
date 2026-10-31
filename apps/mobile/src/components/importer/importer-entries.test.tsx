// @vitest-environment jsdom
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  ApiError,
  ImporterPaginatedResponseDto,
  ImporterService,
} from "@repo/wrapper/server";
import {
  EMPTY_IMPORTER_ENTRIES_RESPONSE,
  useImporterEntries,
} from "../../../../../packages/ui/src/components/importer/hooks/useImporterEntries";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const createWrapper = () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return function QueryWrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
};

describe("useImporterEntries", () => {
  it("defaults to excludeInLibrary=true and differentiates query key between true and false", async () => {
    const mockFind = vi
      .spyOn(ImporterService, "importerControllerFindUnprocessedEntriesV1")
      .mockResolvedValue({
        data: [],
        pagination: { totalItems: 5, totalPages: 1, hasNextPage: false },
      } as unknown as ImporterPaginatedResponseDto);

    const hookTrue = renderHook(
      () =>
        useImporterEntries({
          source: "steam",
          offset: 0,
          limit: 20,
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(hookTrue.result.current.isSuccess).toBe(true));
    expect(mockFind).toHaveBeenCalledWith("steam", true, 20, 0, undefined);
    expect(hookTrue.result.current.queryKey).toEqual([
      "importer",
      "entries",
      "unprocessed",
      "steam",
      true,
      0,
      20,
      undefined,
    ]);

    const hookFalse = renderHook(
      () =>
        useImporterEntries({
          source: "steam",
          excludeInLibrary: false,
          offset: 0,
          limit: 20,
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(hookFalse.result.current.isSuccess).toBe(true));
    expect(mockFind).toHaveBeenCalledWith("steam", false, 20, 0, undefined);
    expect(hookFalse.result.current.queryKey).toEqual([
      "importer",
      "entries",
      "unprocessed",
      "steam",
      false,
      0,
      20,
      undefined,
    ]);
  });

  it("normalizes 404 ApiError into an empty paginated response", async () => {
    const apiError = new ApiError(
      {} as unknown as ConstructorParameters<
        typeof import("@repo/wrapper/server").ApiError
      >[0],
      {
        status: 404,
        statusText: "Not Found",
        url: "/v1/importer/steam",
        body: null,
        ok: false,
      },
      "Not Found",
    );
    vi.spyOn(
      ImporterService,
      "importerControllerFindUnprocessedEntriesV1",
    ).mockRejectedValue(apiError);

    const hook = renderHook(
      () =>
        useImporterEntries({
          source: "steam",
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));
    expect(hook.result.current.data).toEqual(EMPTY_IMPORTER_ENTRIES_RESPONSE);
    expect(hook.result.current.isError).toBe(false);
  });

  it("propagates errors other than 404", async () => {
    const apiError = new ApiError(
      {} as unknown as ConstructorParameters<
        typeof import("@repo/wrapper/server").ApiError
      >[0],
      {
        status: 500,
        statusText: "Internal Server Error",
        url: "/v1/importer/steam",
        body: null,
        ok: false,
      },
      "Internal Server Error",
    );
    vi.spyOn(
      ImporterService,
      "importerControllerFindUnprocessedEntriesV1",
    ).mockRejectedValue(apiError);

    const hook = renderHook(
      () =>
        useImporterEntries({
          source: "steam",
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(hook.result.current.isError).toBe(true), {
      timeout: 3000,
    });
    expect(hook.result.current.error).toBe(apiError);
  });
});
