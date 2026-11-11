// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  CollectionsService,
} from "../../../../../packages/wrapper/src/server";
import { CollectionCreateOrUpdateForm } from "../../../../../packages/ui/src/components/collection/form/CollectionCreateOrUpdateForm";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";

const mocks = vi.hoisted(() => {
  const messages: Record<string, string> = {
    "actions.create": "Create",
    "actions.update": "Update",
    "collection.labels.name": "Name",
    "collection.placeholders.name": "Collection name placeholder",
    "collection.labels.description": "Description",
    "collection.placeholders.description": "Collection description placeholder",
    "collection.labels.public": "Public collection",
    "collection.descriptions.public": "Visible to other users",
    "collection.labels.featured": "Featured collection",
    "collection.descriptions.featured": "Featured in your profile",
    "collection.labels.automation": "Automation",
    "collection.labels.enableAutoStatus": "Enable automatic status",
    "collection.descriptions.autoStatus": "Applied to new entries",
    "collection.limit.title":
      "You've reached the free limit of {{limit}} collections",
    "collection.limit.titleNoCount": "You've reached the free collection limit",
    "collection.limit.description":
      "Your existing collections stay as they are. Become a Supporter for unlimited collections, or remove one to make room.",
    "collection.limit.cta": "Become a Supporter",
  };

  return {
    messages,
    t: (key: string, options?: Record<string, unknown>) => {
      const template = messages[key] ?? key;
      if (!options) return template;
      return template.replace(/{{(\w+)}}/g, (_, name: string) =>
        String(options[name] ?? ""),
      );
    },
    existingCollection: undefined as Record<string, unknown> | undefined,
    supporterSettingsHref: undefined as string | undefined,
  };
});

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: mocks.t }),
}));

vi.mock("@mantine/notifications", () => ({
  notifications: { show: vi.fn() },
}));

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => "user-1" }),
);

vi.mock(
  "../../../../../packages/ui/src/components/library/hooks/useUserLibrary",
  () => ({
    useUserLibrary: () => ({ data: undefined, invalidate: vi.fn() }),
  }),
);

vi.mock(
  "../../../../../packages/ui/src/components/collection/hooks/useCollection",
  () => ({
    useCollection: () => ({
      data: mocks.existingCollection,
      isLoading: false,
      invalidate: vi.fn(),
    }),
  }),
);

function apiError(status: number, body: unknown, message: string) {
  return new ApiError(
    { method: "POST", url: "/v1/collections" } as never,
    {
      url: "/v1/collections",
      ok: false,
      status,
      statusText: message,
      body,
    },
    message,
  );
}

function Wrapper({ children }: PropsWithChildren) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return (
    <MantineProvider>
      <QueryClientProvider client={queryClient}>
        <UIProvider
          presenters={{
            Link: ({ href, children: linkChildren, onClick, ...others }) => (
              <a
                href={href}
                {...others}
                onClick={(event) => {
                  event.preventDefault();
                  onClick?.(event);
                }}
              >
                {linkChildren}
              </a>
            ),
          }}
          hooks={{
            useRouter: () => ({
              pathname: "/",
              asPath: "/",
              back: vi.fn(),
              push: async () => {},
              query: new URLSearchParams(),
            }),
            supporterSettingsHref: mocks.supporterSettingsHref,
          }}
        >
          {children}
        </UIProvider>
      </QueryClientProvider>
    </MantineProvider>
  );
}

async function submitCreation() {
  fireEvent.change(screen.getByPlaceholderText("Collection name placeholder"), {
    target: { value: "My collection" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Create" }));

  await waitFor(() =>
    expect(CollectionsService.collectionsControllerCreateV1).toHaveBeenCalled(),
  );
}

beforeEach(() => {
  mocks.existingCollection = undefined;
  mocks.supporterSettingsHref = "/preferences/supporter";
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("CollectionCreateOrUpdateForm limit handling", () => {
  it("shows the limit notice with the server limit and no notification", async () => {
    vi.spyOn(
      CollectionsService,
      "collectionsControllerCreateV1",
    ).mockRejectedValue(
      apiError(
        403,
        { code: "collection_limit_reached", limit: 5 },
        "Forbidden",
      ),
    );

    render(<CollectionCreateOrUpdateForm collectionId={null} />, {
      wrapper: Wrapper,
    });
    await submitCreation();

    expect(
      await screen.findByText("You've reached the free limit of 5 collections"),
    ).toBeTruthy();
    expect(screen.getByTestId("collection-limit-notice")).toBeTruthy();
    expect(screen.getByText("Become a Supporter")).toBeTruthy();
    expect(notifications.show).not.toHaveBeenCalled();
  });

  it("uses the no-count title when the response has no limit", async () => {
    vi.spyOn(
      CollectionsService,
      "collectionsControllerCreateV1",
    ).mockRejectedValue(
      apiError(403, { code: "collection_limit_reached" }, "Forbidden"),
    );

    render(<CollectionCreateOrUpdateForm collectionId={null} />, {
      wrapper: Wrapper,
    });
    await submitCreation();

    expect(
      await screen.findByText("You've reached the free collection limit"),
    ).toBeTruthy();
    expect(screen.getByTestId("collection-limit-notice")).toBeTruthy();
    expect(notifications.show).not.toHaveBeenCalled();
  });

  it("keeps the generic handling for a 403 without the limit code", async () => {
    vi.spyOn(
      CollectionsService,
      "collectionsControllerCreateV1",
    ).mockRejectedValue(apiError(403, { message: "Nope" }, "Forbidden"));

    render(<CollectionCreateOrUpdateForm collectionId={null} />, {
      wrapper: Wrapper,
    });
    await submitCreation();

    expect(await screen.findByText("Forbidden")).toBeTruthy();
    expect(screen.queryByTestId("collection-limit-notice")).toBeNull();
    expect(notifications.show).toHaveBeenCalled();
  });

  it("keeps the generic handling for a 500 response", async () => {
    vi.spyOn(
      CollectionsService,
      "collectionsControllerCreateV1",
    ).mockRejectedValue(
      apiError(500, { message: "Boom" }, "Internal Server Error"),
    );

    render(<CollectionCreateOrUpdateForm collectionId={null} />, {
      wrapper: Wrapper,
    });
    await submitCreation();

    expect(await screen.findByText("Internal Server Error")).toBeTruthy();
    expect(screen.queryByTestId("collection-limit-notice")).toBeNull();
    expect(notifications.show).toHaveBeenCalled();
  });

  it("never shows the limit notice while editing", async () => {
    mocks.existingCollection = {
      id: "collection-1",
      name: "Existing collection",
      description: "",
      isPublic: true,
      isFeatured: false,
      defaultEntryStatus: "planned",
    };
    vi.spyOn(
      CollectionsService,
      "collectionsControllerUpdateV1",
    ).mockRejectedValue(
      apiError(
        403,
        { code: "collection_limit_reached", limit: 5 },
        "Forbidden",
      ),
    );

    render(<CollectionCreateOrUpdateForm collectionId={"collection-1"} />, {
      wrapper: Wrapper,
    });

    fireEvent.click(await screen.findByRole("button", { name: "Update" }));

    await waitFor(() =>
      expect(
        CollectionsService.collectionsControllerUpdateV1,
      ).toHaveBeenCalled(),
    );
    expect(await screen.findByText("Forbidden")).toBeTruthy();
    expect(screen.queryByTestId("collection-limit-notice")).toBeNull();
    expect(notifications.show).toHaveBeenCalled();
  });

  it("closes the form when the supporter link is selected", async () => {
    vi.spyOn(
      CollectionsService,
      "collectionsControllerCreateV1",
    ).mockRejectedValue(
      apiError(
        403,
        { code: "collection_limit_reached", limit: 5 },
        "Forbidden",
      ),
    );
    const onClose = vi.fn();

    render(
      <CollectionCreateOrUpdateForm collectionId={null} onClose={onClose} />,
      { wrapper: Wrapper },
    );
    await submitCreation();

    const link = await screen.findByText("Become a Supporter");
    expect(link.closest("a")?.getAttribute("href")).toBe(
      "/preferences/supporter",
    );
    fireEvent.click(link);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
