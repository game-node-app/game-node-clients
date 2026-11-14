// @vitest-environment jsdom
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { act, cleanup, render, screen } from "@testing-library/react";
import type { QueryFunction } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QueryProgressBar } from "./QueryProgressBar";

vi.mock("@ionic/react", () => ({
  IonProgressBar: () => <div data-testid="query-progress-bar" />,
}));

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function createClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
    },
  });
}

const pendingRequest = () => new Promise<string>(() => {});

function QueryConsumer({
  queryKey,
  queryFn,
}: {
  queryKey: string[];
  queryFn: QueryFunction<string>;
}) {
  useQuery({ queryKey, queryFn });
  return null;
}

function renderBar(client: QueryClient, queryKey: string[]) {
  return render(
    <QueryClientProvider client={client}>
      <QueryProgressBar showDelayMs={50} minVisibleMs={50} />
      <QueryConsumer queryKey={queryKey} queryFn={pendingRequest} />
    </QueryClientProvider>,
  );
}

describe("QueryProgressBar", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows when a query without data is loading", async () => {
    const client = createClient();

    renderBar(client, ["initial-load"]);

    await act(async () => {
      await wait(200);
    });

    expect(screen.queryByTestId("query-progress-bar")).not.toBeNull();
  });

  it("ignores background refetches of data that is already cached", async () => {
    const client = createClient();
    client.setQueryData(["cached"], "already on screen");

    renderBar(client, ["cached"]);

    // The query is refetching in the background, but the data is already there.
    await act(async () => {
      await wait(10);
    });
    expect(client.isFetching()).toBe(1);

    await act(async () => {
      await wait(200);
    });

    expect(screen.queryByTestId("query-progress-bar")).toBeNull();
  });

  it("ignores retry attempts of a query whose first attempt failed", async () => {
    const client = new QueryClient({
      defaultOptions: {
        queries: { retry: 1, retryDelay: 60_000, gcTime: Infinity },
      },
    });
    const queryFn = vi.fn().mockRejectedValue(new Error("unavailable"));

    render(
      <QueryClientProvider client={client}>
        <QueryProgressBar showDelayMs={50} minVisibleMs={50} />
        <QueryConsumer queryKey={["retrying"]} queryFn={queryFn} />
      </QueryClientProvider>,
    );

    await act(async () => {
      await wait(100);
    });
    expect(queryFn).toHaveBeenCalledTimes(1);
    expect(client.getQueryState(["retrying"])?.status).toBe("pending");
    expect(client.getQueryState(["retrying"])?.fetchFailureCount).toBe(1);

    await act(async () => {
      await wait(200);
    });

    expect(screen.queryByTestId("query-progress-bar")).toBeNull();
    client.clear();
  });

  it("ignores refetches of queries that already failed", async () => {
    const client = createClient();
    const queryFn = vi.fn().mockRejectedValue(new Error("not found"));

    render(
      <QueryClientProvider client={client}>
        <QueryProgressBar showDelayMs={50} minVisibleMs={50} />
        <QueryConsumer queryKey={["failed"]} queryFn={queryFn} />
      </QueryClientProvider>,
    );

    await act(async () => {
      await wait(100);
    });
    expect(client.getQueryState(["failed"])?.status).toBe("error");
    expect(client.getQueryState(["failed"])?.errorUpdateCount).toBe(1);

    // A remount or reconnect refetches the failed query, but it is background
    // work: nothing on screen is waiting for it.
    await act(async () => {
      await client.refetchQueries({ queryKey: ["failed"] });
      await wait(200);
    });

    expect(queryFn).toHaveBeenCalledTimes(2);
    expect(screen.queryByTestId("query-progress-bar")).toBeNull();
  });
});
