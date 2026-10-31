// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import {
  NotificationImporterTargetDto,
  NotificationInboxItemDto,
} from "@repo/wrapper/server";
import { AggregatedNotification } from "../../../../../packages/ui/src/components/notifications/AggregatedNotification";
import enTranslations from "../../../../../packages/locales/src/translations/json/en.json";
import ptTranslations from "../../../../../packages/locales/src/translations/json/pt-BR.json";

const mockRouter = vi.hoisted(() => ({
  push: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../../../packages/ui/src/util/link", () => ({
  useRouter: () => mockRouter,
}));

vi.mock("../../../../../packages/ui/src/components/auth/hooks/useUserId", () => ({
  useUserId: () => "user-1",
}));

let currentLang = "en";

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, any>) => {
      const translations: any = currentLang === "pt-BR" ? ptTranslations : enTranslations;
      const parts = key.split(".");
      let val: any = translations;
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

beforeEach(() => {
  vi.clearAllMocks();
  currentLang = "en";
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
});

describe("import.discovery-completed notification localization", () => {
  const item: NotificationInboxItemDto = {
    id: 10,
    type: "import.discovery-completed",
    actors: [],
    actorCount: 0,
    eventCount: 1,
    preview: {
      provider: "steam" as any,
      gameCount: 20,
      importedCount: 10,
      skippedCount: 5,
      failedCount: 1,
      gameSample: [
        { id: 1, title: "Hades" },
        { id: 2, title: "Celeste" },
      ],
    },
    target: {
      type: NotificationImporterTargetDto.type.IMPORTER,
      id: "imp-steam",
      provider: "steam" as any,
    },
    lastEventAt: "2026-10-25T12:00:00Z",
    version: 1,
    readVersion: 1,
  };

  it("renders with English translations, accessible name, counts and navigates to target", async () => {
    currentLang = "en";
    const onClick = vi.fn();

    render(
      <MantineProvider>
        <AggregatedNotification
          aggregatedNotification={item}
          backgroundColor="normal"
          onClick={onClick}
        />
      </MantineProvider>,
    );

    expect(
      screen.getByText(/We've found 20 new games ready to be imported from your Steam connection/i),
    ).toBeTruthy();
    expect(screen.getByText(/10 automatically imported/i)).toBeTruthy();
    expect(screen.getByText(/5 already in your library/i)).toBeTruthy();
    expect(screen.getByText(/1 failed/i)).toBeTruthy();
    expect(screen.getByText(/Hades, Celeste/i)).toBeTruthy();

    const alert = screen.getByRole("alert");
    expect(alert.getAttribute("aria-label")).toBe("Discovery completed");

    const img = screen.getByAltText("Importer source icon");
    expect(img).toBeTruthy();

    fireEvent.click(alert);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(mockRouter.push).toHaveBeenCalledWith("/importer/steam");
  });

  it("renders with Portuguese (pt-BR) translations and accessible name", async () => {
    currentLang = "pt-BR";
    const onClick = vi.fn();

    render(
      <MantineProvider>
        <AggregatedNotification
          aggregatedNotification={item}
          backgroundColor="normal"
          onClick={onClick}
        />
      </MantineProvider>,
    );

    expect(
      screen.getByText(
        /Encontramos 20 novos jogos prontos para serem importados da sua conexão com Steam/i,
      ),
    ).toBeTruthy();
    expect(screen.getByText(/10 importados automaticamente/i)).toBeTruthy();
    expect(screen.getByText(/5 já na sua biblioteca/i)).toBeTruthy();
    expect(screen.getByText(/1 com falha/i)).toBeTruthy();
    expect(screen.getByText(/Hades, Celeste/i)).toBeTruthy();

    const alert = screen.getByRole("alert");
    expect(alert.getAttribute("aria-label")).toBe("Descoberta concluída");

    const img = screen.getByAltText("Ícone da fonte de importação");
    expect(img).toBeTruthy();
  });
});
