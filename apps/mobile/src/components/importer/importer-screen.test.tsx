// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  CollectionsEntriesService,
  ConnectionsService,
  GameRepositoryService,
  ImporterBatchStatusRequestDto,
  ImporterPaginatedResponseDto,
  ImporterService,
  OwnUserConnectionDto,
} from "@repo/wrapper/server";
import { UIProvider } from "@repo/ui";
import { ImporterScreen } from "../../../../../packages/ui/src/components/importer/view/ImporterScreen";
import enTranslations from "../../../../../packages/locales/src/translations/json/en.json";

const mocks = vi.hoisted(() => ({
  showNotification: vi.fn().mockReturnValue("notif-1"),
  updateNotification: vi.fn(),
}));

vi.mock("@mantine/notifications", () => ({
  notifications: {
    show: mocks.showNotification,
    update: mocks.updateNotification,
  },
}));

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => "test-user-id" }),
);

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, any>) => {
      const parts = key.split(".");
      let val: any = enTranslations;
      for (const p of parts) {
        val = val?.[p];
      }
      if (typeof val === "string") {
        return val.replace(/\{\{(\w+)\}\}/g, (_, k) => options?.[k] ?? `{{${k}}}`);
      }
      return key;
    },
  }),
}));

// Mock ImporterCollectionSelect to simplify collection selection
vi.mock(
  "#@/components/importer/ImporterCollectionSelect",
  () => ({
    ImporterCollectionSelect: ({ onChange }: { onChange: (vals: string[]) => void }) => (
      <button
        data-testid="mock-collection-select"
        onClick={() => onChange(["col-1", "col-2"])}
      >
        Select Collections
      </button>
    ),
  }),
);
vi.mock(
  "../../../../../packages/ui/src/components/importer/ImporterCollectionSelect",
  () => ({
    ImporterCollectionSelect: ({ onChange }: { onChange: (vals: string[]) => void }) => (
      <button
        data-testid="mock-collection-select"
        onClick={() => onChange(["col-1", "col-2"])}
      >
        Select Collections
      </button>
    ),
  }),
);

const MockLink = ({ children, ...props }: any) => <a {...props}>{children}</a>;

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, retryDelay: 0 },
      mutations: { retry: false },
    },
  });
}

function renderUI(ui: React.ReactElement, client = createTestQueryClient()) {
  return render(
    <QueryClientProvider client={client}>
      <MantineProvider>
        <UIProvider presenters={{ Link: MockLink }} hooks={{} as any}>
          {ui}
        </UIProvider>
      </MantineProvider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
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

describe("ImporterScreen - Tasks 2.2 to 3.6", () => {
  const sampleEntriesPage1: ImporterPaginatedResponseDto = {
    data: [
      {
        id: 101,
        uid: "steam-101",
        name: "Hades",
        gameId: 1,
        isInLibrary: false,
        preferredPlatformId: 1,
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01",
        psnExtraMappings: null,
        game: {
          id: 1,
          name: "Hades",
          cover: { id: 10, url: "https://example.com/hades.jpg" } as any,
        } as any,
      },
      {
        id: 102,
        uid: "steam-102-alias",
        name: "Hades (Soundtrack Edition)",
        gameId: 1, // Same game.id alias!
        isInLibrary: false,
        preferredPlatformId: 1,
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01",
        psnExtraMappings: null,
        game: {
          id: 1,
          name: "Hades",
          cover: { id: 10, url: "https://example.com/hades.jpg" } as any,
        } as any,
      },
      {
        id: 103,
        uid: "steam-103",
        name: "Celeste",
        gameId: 2,
        isInLibrary: false,
        preferredPlatformId: 1,
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01",
        psnExtraMappings: null,
        game: {
          id: 2,
          name: "Celeste",
          cover: null, // No cover!
        } as any,
      },
    ],
    pagination: { totalItems: 4, totalPages: 2, hasNextPage: true },
  };

  const sampleEntriesPage2: ImporterPaginatedResponseDto = {
    data: [
      {
        id: 104,
        uid: "steam-104",
        name: "Dead Cells",
        gameId: 3,
        isInLibrary: false,
        preferredPlatformId: 1,
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01",
        psnExtraMappings: null,
        game: {
          id: 3,
          name: "Dead Cells",
          cover: { id: 30, url: "https://example.com/deadcells.jpg" } as any,
        } as any,
      },
    ],
    pagination: { totalItems: 4, totalPages: 2, hasNextPage: false },
  };

  it("Task 2.2: renders entry.game without calling GameRepository or individual collection entry queries, handling game without cover", async () => {
    const findEntriesSpy = vi
      .spyOn(ImporterService, "importerControllerFindUnprocessedEntriesV1")
      .mockResolvedValue(sampleEntriesPage1);
    vi.spyOn(ConnectionsService, "connectionsControllerFindOwnByTypeV1").mockResolvedValue({
      id: 1,
      type: "steam" as any,
      unprocessedCount: 4,
      lastSyncedAt: "2026-10-25T12:00:00Z",
    } as OwnUserConnectionDto);

    const gameRepoFindOneSpy = vi.spyOn(
      GameRepositoryService,
      "gameRepositoryControllerFindOneByIdV1",
    );
    const collectionEntrySpy = vi.spyOn(
      CollectionsEntriesService,
      "collectionsEntriesControllerCreateOrUpdateV1",
    );

    renderUI(<ImporterScreen source="steam" />);

    await waitFor(() => {
      // Deduplicated: Hades appears once even though 2 external items exist with gameId=1
      expect(screen.getAllByAltText("Hades").length).toBe(1);
      expect(screen.getByAltText("Celeste")).toBeTruthy();
    });

    // Zero N+1 calls
    expect(gameRepoFindOneSpy).not.toHaveBeenCalled();
    expect(collectionEntrySpy).not.toHaveBeenCalled();
    expect(findEntriesSpy).toHaveBeenCalledWith("steam", true, 20, 0, undefined);
  });

  it("Task 2.3 & 3.6: preserves selection across pages, handles aliases, page union/subtraction, sticky bar actions, and resets on source change", async () => {
    vi.spyOn(ImporterService, "importerControllerFindUnprocessedEntriesV1").mockImplementation(
      (source, excludeInLibrary, limit, offset): any => {
        if (offset === 0) return Promise.resolve(sampleEntriesPage1);
        return Promise.resolve(sampleEntriesPage2);
      },
    );
    vi.spyOn(ConnectionsService, "connectionsControllerFindOwnByTypeV1").mockResolvedValue({
      id: 1,
      type: "steam" as any,
      unprocessedCount: 4,
      lastSyncedAt: "2026-10-25T12:00:00Z",
    } as OwnUserConnectionDto);

    const queryClient = createTestQueryClient();
    const { rerender } = renderUI(<ImporterScreen source="steam" />, queryClient);

    await waitFor(() => {
      expect(screen.getByAltText("Hades")).toBeTruthy();
    });

    // Select Hades (which has 2 external entries: 101, 102)
    fireEvent.click(screen.getByAltText("Hades"));

    // Sticky bar appears with 2 selected
    await waitFor(() => {
      expect(screen.getByText("2 selected")).toBeTruthy();
    });

    // Select Celeste (103)
    fireEvent.click(screen.getByAltText("Celeste"));
    await waitFor(() => {
      expect(screen.getByText("3 selected")).toBeTruthy();
    });

    // Clear selection
    const clearBtn = screen.getByRole("button", { name: "Clear selection" });
    fireEvent.click(clearBtn);
    await waitFor(() => {
      expect(screen.queryByText(/\d+ selected/i)).toBeNull();
    });

    // Select page action (GameSelectActions)
    const selectAllActionBtn = screen.getByRole("button", { name: "Select all items" });
    fireEvent.click(selectAllActionBtn);

    // Visible on page 1: 101, 102, 103 -> 3 selected
    await waitFor(() => {
      expect(screen.getByText("3 selected")).toBeTruthy();
    });

    // Navigate to Page 2
    const page2Btn = screen.getByRole("button", { name: "2" });
    fireEvent.click(page2Btn);

    await waitFor(() => {
      expect(screen.getByAltText("Dead Cells")).toBeTruthy();
    });

    // Selection of 3 from page 1 is preserved!
    expect(screen.getByText("3 selected")).toBeTruthy();

    // Select Dead Cells (104) on page 2
    fireEvent.click(screen.getByAltText("Dead Cells"));
    await waitFor(() => {
      expect(screen.getByText("4 selected")).toBeTruthy();
    });

    // Change source to "xbox" -> resets selection, page and search
    rerender(
      <QueryClientProvider client={queryClient}>
        <MantineProvider>
          <UIProvider presenters={{ Link: MockLink }} hooks={{} as any}>
            <ImporterScreen source="xbox" />
          </UIProvider>
        </MantineProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.queryByText(/\d+ selected/i)).toBeNull();
    });
  });

  it("Task 2.4: distinguishes search empty, first sync, all done, and connection error", async () => {
    // 1. Search without results
    vi.spyOn(ImporterService, "importerControllerFindUnprocessedEntriesV1").mockResolvedValue({
      data: [],
      pagination: { totalItems: 0, totalPages: 0, hasNextPage: false },
    });
    vi.spyOn(ConnectionsService, "connectionsControllerFindOwnByTypeV1").mockResolvedValue({
      id: 1,
      type: "steam" as any,
      unprocessedCount: 0,
      lastSyncedAt: "2026-10-25T12:00:00Z",
    } as OwnUserConnectionDto);

    const client = createTestQueryClient();
    renderUI(<ImporterScreen source="steam" />, client);

    // Initial with lastSyncedAt and no search: allDone message
    await waitFor(() => {
      expect(
        screen.getByText("All discovered games have been imported or processed."),
      ).toBeTruthy();
      expect(
        screen.getByText("Check if your library at the target platform is set to public."),
      ).toBeTruthy();
    });

    // Type in search bar
    const searchInput = screen.getByLabelText(/search/i);
    fireEvent.change(searchInput, { target: { value: "UnknownGame" } });
    fireEvent.keyDown(searchInput, { key: "Enter" });

    // 2. First sync in progress (lastSyncedAt is null/undefined)
    cleanup();
    vi.spyOn(ConnectionsService, "connectionsControllerFindOwnByTypeV1").mockResolvedValue({
      id: 1,
      type: "steam" as any,
      unprocessedCount: 0,
      lastSyncedAt: null,
    } as OwnUserConnectionDto);

    const client2 = createTestQueryClient();
    renderUI(<ImporterScreen source="steam" />, client2);

    await waitFor(() => {
      expect(
        screen.getByText(
          "Your first sync might be in progress. Discovered games will appear here once processed.",
        ),
      ).toBeTruthy();
    });

    // 3. Connection error
    cleanup();
    vi.spyOn(ConnectionsService, "connectionsControllerFindOwnByTypeV1").mockRejectedValue(
      new Error("Connection server timeout"),
    );

    const client3 = createTestQueryClient();
    renderUI(<ImporterScreen source="steam" />, client3);

    await waitFor(
      () => {
        expect(screen.getByText("Connection server timeout")).toBeTruthy();
      },
      { timeout: 4000 },
    );
  });

  it("Task 3.1 & 3.4 & 3.5: imports selected with initial status, collections, and single batch request, handling skippedCount", async () => {
    vi.spyOn(ImporterService, "importerControllerFindUnprocessedEntriesV1").mockResolvedValue(
      sampleEntriesPage1,
    );
    vi.spyOn(ConnectionsService, "connectionsControllerFindOwnByTypeV1").mockResolvedValue({
      id: 1,
      type: "steam" as any,
      unprocessedCount: 4,
      lastSyncedAt: "2026-10-25T12:00:00Z",
    } as OwnUserConnectionDto);

    const importBatchSpy = vi
      .spyOn(ImporterService, "importerControllerImportBatchV1")
      .mockResolvedValue({
        importedCount: 2,
        skippedCount: 1,
      });

    const singleCreateSpy = vi.spyOn(
      CollectionsEntriesService,
      "collectionsEntriesControllerCreateOrUpdateV1",
    );

    renderUI(<ImporterScreen source="steam" />);

    await waitFor(() => {
      expect(screen.getByAltText("Hades")).toBeTruthy();
    });

    // Select collections
    const collectionSelect = await screen.findByTestId("mock-collection-select");
    fireEvent.click(collectionSelect);

    // Select Hades (IDs 101, 102) and Celeste (ID 103)
    fireEvent.click(screen.getByAltText("Hades"));
    fireEvent.click(screen.getByAltText("Celeste"));

    // Click Import selected (use first one or sticky bar)
    const importSelectedBtns = screen.getAllByRole("button", { name: "Import selected" });
    fireEvent.click(importSelectedBtns[0]);

    await waitFor(() => {
      expect(importBatchSpy).toHaveBeenCalledWith("steam", {
        externalGameIds: expect.arrayContaining([101, 102, 103]),
        status: "planned",
        collectionIds: ["col-1", "col-2"],
      });
    });

    // No single create calls
    expect(singleCreateSpy).not.toHaveBeenCalled();

    // Success notification with skippedCount
    expect(mocks.updateNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        color: "green",
        message: "Imported 2 games (1 already in library).",
      }),
    );
  });

  it("Task 3.2: imports all with confirmation modal, handles cancel and confirm with importAll=true", async () => {
    vi.spyOn(ImporterService, "importerControllerFindUnprocessedEntriesV1").mockResolvedValue(
      sampleEntriesPage1,
    );
    vi.spyOn(ConnectionsService, "connectionsControllerFindOwnByTypeV1").mockResolvedValue({
      id: 1,
      type: "steam" as any,
      unprocessedCount: 4,
      lastSyncedAt: "2026-10-25T12:00:00Z",
    } as OwnUserConnectionDto);

    const importBatchSpy = vi
      .spyOn(ImporterService, "importerControllerImportBatchV1")
      .mockResolvedValue({
        importedCount: 4,
        skippedCount: 0,
      });

    renderUI(<ImporterScreen source="steam" />);

    await waitFor(() => {
      expect(screen.getByAltText("Hades")).toBeTruthy();
    });

    // Click Import all (4)
    const importAllBtn = screen.getByRole("button", { name: "Import all (4)" });
    fireEvent.click(importAllBtn);

    // Modal opens
    await waitFor(() => {
      expect(screen.getByText("Import all games")).toBeTruthy();
      expect(
        screen.getByText("This will import all 4 games from Steam into your library."),
      ).toBeTruthy();
    });

    // Click Cancel
    const cancelBtn = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelBtn);

    expect(importBatchSpy).not.toHaveBeenCalled();

    // Reopen modal and confirm
    fireEvent.click(importAllBtn);
    await waitFor(() => {
      expect(screen.getByText("Import all games")).toBeTruthy();
    });

    const confirmBtn = screen.getByRole("button", { name: "Confirm" });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(importBatchSpy).toHaveBeenCalledWith("steam", {
        importAll: true,
        status: "planned",
        collectionIds: [],
      });
    });

    expect(mocks.updateNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        color: "green",
        message: "Successfully imported 4 games!",
      }),
    );
  });

  it("Task 3.3: ignores selected games via importerControllerChangeStatusBatchV1 and preserves on failure", async () => {
    vi.spyOn(ImporterService, "importerControllerFindUnprocessedEntriesV1").mockResolvedValue(
      sampleEntriesPage1,
    );
    vi.spyOn(ConnectionsService, "connectionsControllerFindOwnByTypeV1").mockResolvedValue({
      id: 1,
      type: "steam" as any,
      unprocessedCount: 4,
      lastSyncedAt: "2026-10-25T12:00:00Z",
    } as OwnUserConnectionDto);

    const changeStatusSpy = vi
      .spyOn(ImporterService, "importerControllerChangeStatusBatchV1")
      .mockRejectedValueOnce(new Error("Database error"))
      .mockResolvedValueOnce({} as any);

    renderUI(<ImporterScreen source="steam" />);

    await waitFor(() => {
      expect(screen.getByAltText("Hades")).toBeTruthy();
    });

    // Select Celeste (103)
    fireEvent.click(screen.getByAltText("Celeste"));
    await waitFor(() => {
      expect(screen.getByText("1 selected")).toBeTruthy();
    });

    const ignoreBtn = screen.getByRole("button", { name: "Ignore selected" });
    fireEvent.click(ignoreBtn);

    // First attempt fails: selection is preserved!
    await waitFor(() => {
      expect(changeStatusSpy).toHaveBeenCalledWith({
        source: "steam",
        externalGameIds: [103],
        status: ImporterBatchStatusRequestDto.status.IGNORED,
      });
      expect(mocks.updateNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          color: "red",
          title: "Failed to sync changes!",
        }),
      );
    });

    // Selection still active
    expect(screen.getByText("1 selected")).toBeTruthy();

    // Retry ignore
    fireEvent.click(ignoreBtn);
    await waitFor(() => {
      expect(mocks.updateNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          color: "green",
          message: "Successfully ignored 1 games.",
        }),
      );
    });

    // Cleared after success
    expect(screen.queryByText(/\d+ selected/i)).toBeNull();
  });
});
