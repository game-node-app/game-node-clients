// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nProvider } from "@repo/locales";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AwardsEventBand } from "../../../../../packages/ui/src/components/awards/shared/AwardsEventBand";
import { AwardsSegmentedControl } from "../../../../../packages/ui/src/components/awards/shared/AwardsSegmentedControl";
import { AwardsStatusChip } from "../../../../../packages/ui/src/components/awards/shared/AwardsStatusChip";
import { AwardsVoteBarContent } from "../../../../../packages/ui/src/components/awards/shared/AwardsVoteBarContent";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";
import { DEFAULT_MANTINE_THEME } from "../../../../../packages/ui/src/util/theme";

function renderUi(ui: ReactElement) {
  return render(
    <I18nProvider language="pt-BR">
      <MantineProvider theme={DEFAULT_MANTINE_THEME}>
        <QueryClientProvider client={new QueryClient()}>
          <UIProvider>{ui}</UIProvider>
        </QueryClientProvider>
      </MantineProvider>
    </I18nProvider>,
  );
}

const DATES = {
  year: 2026,
  categoriesCount: 12,
  nominationStartDate: "2026-11-10T00:00:00.000Z",
  nominationEndDate: "2026-11-28T23:59:59.000Z",
  votingStartDate: "2026-12-01T00:00:00.000Z",
  votingEndDate: "2026-12-20T23:59:59.000Z",
  resultsDate: "2026-12-27T00:00:00.000Z",
};

beforeEach(() => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

afterEach(cleanup);

describe("AwardsEventBand", () => {
  it("marks nominations as done and voting as the current phase", () => {
    const { container } = renderUi(
      <AwardsEventBand {...DATES} phase={"voting"} />,
    );

    const steps = container.querySelectorAll(
      "[data-awards-phase-timeline] [data-step]",
    );
    expect(
      Array.from(steps).map((step) => step.getAttribute("data-state")),
    ).toEqual(["done", "current", "upcoming"]);
    expect(screen.getByText("Votação")).toBeTruthy();
  });

  it("falls back to a two-step timeline for legacy events", () => {
    const { container } = renderUi(
      <AwardsEventBand
        {...DATES}
        nominationStartDate={null}
        nominationEndDate={null}
        phase={"voting"}
      />,
    );

    expect(
      container.querySelectorAll("[data-awards-phase-timeline] [data-step]")
        .length,
    ).toBeGreaterThanOrEqual(2);
  });
});

describe("AwardsSegmentedControl", () => {
  it("selects an option and forwards data attributes to the root", () => {
    const onChange = vi.fn();
    const { container } = renderUi(
      <AwardsSegmentedControl
        data-awards-category-filter
        value={"all"}
        onChange={onChange}
        options={[
          { value: "all", label: "Todos · 6" },
          { value: "played", label: "Que joguei · 4" },
        ]}
      />,
    );

    expect(
      container.querySelector("[data-awards-category-filter]"),
    ).toBeTruthy();
    expect(
      screen
        .getByRole("radio", { name: "Todos · 6" })
        .getAttribute("aria-checked"),
    ).toBe("true");

    fireEvent.click(screen.getByRole("radio", { name: "Que joguei · 4" }));
    expect(onChange).toHaveBeenCalledWith("played");
  });
});

describe("AwardsStatusChip", () => {
  it("keeps the semantic color attribute per tone", () => {
    const { container } = renderUi(
      <>
        <AwardsStatusChip tone={"played"}>a</AwardsStatusChip>
        <AwardsStatusChip tone={"brand"}>b</AwardsStatusChip>
        <AwardsStatusChip tone={"neutral"}>c</AwardsStatusChip>
      </>,
    );

    const colors = Array.from(container.querySelectorAll("[data-color]")).map(
      (chip) => chip.getAttribute("data-color"),
    );
    expect(colors).toEqual(["teal", "brand", "gray"]);
  });
});

describe("AwardsVoteBarContent", () => {
  it("fires skip and confirm from their own controls", () => {
    const onSkip = vi.fn();
    const onConfirm = vi.fn();
    const { container } = renderUi(
      <AwardsVoteBarContent
        caption={"Seu voto em Jogo do Ano"}
        gameName={"Nioh 3"}
        skipLabel={"Pular por agora"}
        confirmLabel={"Confirmar e ir para Direção de Arte"}
        onSkip={onSkip}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByText("Seu voto em Jogo do Ano")).toBeTruthy();
    fireEvent.click(container.querySelector("[data-awards-vote-skip]")!);
    fireEvent.click(container.querySelector("[data-awards-vote-confirm]")!);
    expect(onSkip).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
