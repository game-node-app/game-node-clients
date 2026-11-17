// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  ApiError,
  CollectionsEntriesService,
  ProfileResponseDto,
  ProfileService,
} from "@repo/wrapper/server";
import { CollectionEntryDetailView } from "../../../../../packages/ui/src/components/collection/collection-entry/detail/CollectionEntryDetailView";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";
import { setProjectContext } from "../../../../../packages/ui/src/util/projectContext";
import { LinkComponentProps } from "../../../../../packages/ui/src/util/link";

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const mocks = vi.hoisted(() => ({
  session: {
    data: { user: { id: "viewer" } } as { user: { id: string } } | null,
    isPending: false,
  },
}));

vi.mock("../../../../../packages/ui/src/components/auth/authClient", () => ({
  authClient: {
    useSession: () => mocks.session,
    getSession: vi.fn(),
  },
}));

function notFound() {
  return new ApiError(
    {} as never,
    {
      url: "/v1/collections-entries/entry-1",
      ok: false,
      status: 404,
      statusText: "Not Found",
      body: {},
    } as never,
    "Not found",
  );
}

const PresenterLink = ({ href, children, ...rest }: LinkComponentProps) => (
  <a href={href} {...rest}>
    {children}
  </a>
);

function renderView() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, retryDelay: 0 } },
  });

  return render(
    <QueryClientProvider client={client}>
      <UIProvider
        presenters={{ Link: PresenterLink }}
        hooks={{
          useRouter: () => ({
            pathname: "",
            back: () => {},
            push: async () => {},
            query: new URLSearchParams(),
          }),
        }}
      >
        <MantineProvider>
          <CollectionEntryDetailView
            userId="owner-1"
            collectionEntryId="entry-1"
            withTitle={false}
          />
        </MantineProvider>
      </UIProvider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  setProjectContext({
    client: "mobile",
    s3BucketUrl: "https://cdn.example.com",
    serverUrl: "https://api.example.com",
    searchUrl: "https://search.example.com",
  });
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it("renders the hidden notice, without retrying, when the entry answers 404", async () => {
  const findEntry = vi
    .spyOn(
      CollectionsEntriesService,
      "collectionsEntriesControllerFindEntryByIdV1",
    )
    .mockRejectedValue(notFound());
  vi.spyOn(ProfileService, "profileControllerFindOneByIdV1").mockResolvedValue({
    userId: "owner-1",
    canViewLibrary: false,
    libraryVisibility: ProfileResponseDto.libraryVisibility.PRIVATE,
  } as ProfileResponseDto);

  renderView();

  const hiddenState = await screen.findByTestId(
    "collection-entry-hidden-state",
  );
  expect(hiddenState).toBeTruthy();
  expect(screen.getByText("libraryVisibility.hidden.title")).toBeTruthy();
  expect(screen.getByText("libraryVisibility.hidden.description")).toBeTruthy();
  expect(findEntry).toHaveBeenCalledTimes(1);
});
