// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { MantineProvider } from "@mantine/core";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps, ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import guildClasses from "../../../../../packages/ui/src/components/guild/guild.module.css";
import type { LinaSegment } from "../../../../../packages/ui/src/components/guild/util";
import { GuildEarlyAccess } from "../../../../../packages/ui/src/components/guild/view/GuildEarlyAccess";
import { GuildSignInPrompt } from "../../../../../packages/ui/src/components/guild/view/GuildSignInPrompt";
import { LinaDialogue } from "../../../../../packages/ui/src/components/guild/scene/LinaDialogue";
import { LinaSprite } from "../../../../../packages/ui/src/components/guild/scene/LinaSprite";
import { useTypewriter } from "../../../../../packages/ui/src/components/guild/scene/useTypewriter";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";
import type { UIHookRegistry } from "../../../../../packages/ui/src/context/registry";

const mantineHooks = vi.hoisted(() => ({ reducedMotion: false }));

vi.mock("@mantine/hooks", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@mantine/hooks")>();

  return {
    ...actual,
    useReducedMotion: () => mantineHooks.reducedMotion,
  };
});

vi.mock("@repo/locales", () => {
  const translations: Record<string, string> = {
    "guild.lina.namePlate": "Lina · Recepcionista da Guilda",
    "guild.lina.namePlateShort": "Lina · Recepcionista",
    "guild.earlyAccess.badge": "Acesso antecipado",
    "guild.earlyAccess.title": "A Guilda está em acesso antecipado",
    "guild.earlyAccess.line":
      "A Guilda dos Aventureiros está em acesso antecipado para apoiadores.",
    "guild.earlyAccess.cta": "Quero apoiar",
    "guild.signIn.title": "Entre para visitar a Guilda",
    "guild.signIn.line": "Lina gosta de saber quem está chegando.",
    "guild.signIn.cta": "Entrar",
  };

  return {
    useTranslation: () => ({
      t: (key: string) => translations[key] ?? key,
    }),
  };
});

const MockLink = ({ children, ...props }: ComponentProps<"a">) => (
  <a {...props}>{children}</a>
);

const HOOKS = {} as unknown as UIHookRegistry;

function renderWithProvider(ui: ReactElement) {
  return render(
    <MantineProvider>
      <UIProvider presenters={{ Link: MockLink }} hooks={HOOKS}>
        {ui}
      </UIProvider>
    </MantineProvider>,
  );
}

function imageNames(container: HTMLElement): string[] {
  return [...container.querySelectorAll("img")].map(
    (image) => image.getAttribute("src") ?? "",
  );
}

const LONG_LINE =
  "Que bom te ver de novo por aqui! Reparei que o seu backlog está cheio de jogos esperando.";

const LINE_SEGMENTS: LinaSegment[] = [
  { text: "Que bom te ver de novo! " },
  { text: "Hollow Knight", highlight: true },
  { text: " está parado no seu backlog." },
];

function TypewriterHarness({
  text,
  startDelayMs = 0,
}: {
  text: string;
  startDelayMs?: number;
}) {
  const { revealed, total, isTyping, complete } = useTypewriter([{ text }], {
    startDelayMs,
  });

  return (
    <div
      data-testid="typewriter"
      data-revealed={revealed}
      data-total={total}
      data-typing={isTyping}
    >
      <button type="button" onClick={complete}>
        complete
      </button>
    </div>
  );
}

beforeEach(() => {
  vi.useFakeTimers();
  mantineHooks.reducedMotion = false;
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  });
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
  vi.clearAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("useTypewriter", () => {
  it("reveals about 35 characters per second", () => {
    render(<TypewriterHarness text={LONG_LINE} />);

    const typewriter = screen.getByTestId("typewriter");

    expect(typewriter).toHaveAttribute("data-revealed", "0");
    expect(typewriter).toHaveAttribute("data-typing", "true");

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const revealed = Number(typewriter.getAttribute("data-revealed"));

    expect(revealed).toBeGreaterThanOrEqual(33);
    expect(revealed).toBeLessThanOrEqual(37);
  });

  it("waits for the start delay before typing", () => {
    render(<TypewriterHarness text={LONG_LINE} startDelayMs={400} />);

    const typewriter = screen.getByTestId("typewriter");

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(typewriter).toHaveAttribute("data-revealed", "0");

    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(
      Number(typewriter.getAttribute("data-revealed")),
    ).toBeGreaterThanOrEqual(20);
  });

  it("completes at once and stops the timers", () => {
    render(<TypewriterHarness text={LONG_LINE} />);

    const typewriter = screen.getByTestId("typewriter");

    act(() => {
      vi.advanceTimersByTime(100);
    });
    fireEvent.click(screen.getByRole("button", { name: "complete" }));

    expect(typewriter).toHaveAttribute(
      "data-revealed",
      typewriter.getAttribute("data-total"),
    );
    expect(typewriter).toHaveAttribute("data-typing", "false");

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(typewriter).toHaveAttribute(
      "data-revealed",
      typewriter.getAttribute("data-total"),
    );
  });

  it("clears its timers on unmount", () => {
    const { unmount } = render(<TypewriterHarness text={LONG_LINE} />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(vi.getTimerCount()).toBeGreaterThan(0);

    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("shows the full text immediately with reduced motion", () => {
    mantineHooks.reducedMotion = true;

    render(<TypewriterHarness text={LONG_LINE} />);

    const typewriter = screen.getByTestId("typewriter");

    expect(typewriter).toHaveAttribute(
      "data-revealed",
      String(LONG_LINE.length),
    );
    expect(typewriter).toHaveAttribute("data-typing", "false");
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("LinaSprite", () => {
  it("opens the mouth only while talking and blinks only when neutral", () => {
    const { container, rerender } = render(
      <LinaSprite pose="neutral" isTalking scale={6} />,
    );

    expect(imageNames(container)).toContain("/img/guild/lina-mouth-open.svg");
    expect(imageNames(container)).not.toContain(
      "/img/guild/lina-eyes-closed.svg",
    );

    rerender(<LinaSprite pose="neutral" isTalking={false} scale={6} />);

    expect(imageNames(container)).toContain("/img/guild/lina-eyes-closed.svg");
    expect(imageNames(container)).not.toContain(
      "/img/guild/lina-mouth-open.svg",
    );
  });

  it("renders the 6x sprite layers for desktop", () => {
    const { container } = render(
      <LinaSprite pose="neutral" isTalking={false} scale={6} />,
    );

    const body = screen.getByAltText("Lina");
    const sprite = container.firstElementChild as HTMLElement;

    expect(body).toHaveAttribute("width", "192");
    expect(body).toHaveAttribute("height", "204");
    expect(body.style.imageRendering).toBe("pixelated");
    expect(sprite.style.width).toBe("192px");
    expect(sprite.style.height).toBe("204px");
    expect(sprite.className).toContain(guildClasses.animBreathe);
    expect(imageNames(container)).toEqual(
      expect.arrayContaining([
        "/img/guild/lina-body.svg",
        "/img/guild/lina-braids.svg",
        "/img/guild/lina-eyes-closed.svg",
      ]),
    );
  });

  it("shows happy eyes and smile, without blink or talk layers", () => {
    const { container } = render(
      <LinaSprite pose="happy" isTalking scale={5} />,
    );

    const images = imageNames(container);
    const body = screen.getByAltText("Lina");

    expect(body).toHaveAttribute("width", "160");
    expect(body).toHaveAttribute("height", "170");
    expect(images).toEqual(
      expect.arrayContaining([
        "/img/guild/lina-eyes-happy.svg",
        "/img/guild/lina-smile.svg",
      ]),
    );
    expect(images).not.toContain("/img/guild/lina-eyes-closed.svg");
    expect(images).not.toContain("/img/guild/lina-mouth-open.svg");
  });

  it("uses the hop animation during the accept celebration", () => {
    const { container } = render(
      <LinaSprite pose="happy" isTalking={false} scale={6} hop />,
    );

    expect(container.firstElementChild?.className).toContain(
      guildClasses.animHop,
    );
  });
});

describe("LinaDialogue", () => {
  const options = () => [
    { id: "board", label: "Me mostra o quadro de pedidos", onSelect: vi.fn() },
    { id: "quick", label: "Tem algum pedido mais rápido?", onSelect: vi.fn() },
    { id: "goodbye", label: "Até mais, Lina", onSelect: vi.fn() },
  ];

  it("moves the pixel cursor with the arrow keys and selects with Enter", () => {
    const items = options();

    renderWithProvider(
      <LinaDialogue
        speaker="Lina"
        segments={[{ text: "Oi!" }]}
        options={items}
        variant="desktop"
        startDelayMs={0}
      />,
    );

    act(() => {
      vi.advanceTimersByTime(500);
    });

    const dialogue = screen.getByRole("region");
    const quick = screen
      .getByText("Tem algum pedido mais rápido?")
      .closest("button");

    expect(
      screen.getByText("Me mostra o quadro de pedidos").closest("button"),
    ).toHaveAttribute("data-active", "true");

    fireEvent.keyDown(dialogue, { key: "ArrowDown" });

    expect(quick).toHaveAttribute("data-active", "true");
    expect(
      screen.getByText("Me mostra o quadro de pedidos").closest("button"),
    ).toHaveAttribute("data-active", "false");

    fireEvent.keyDown(dialogue, { key: "Enter" });

    expect(items[1].onSelect).toHaveBeenCalledTimes(1);
    expect(items[0].onSelect).not.toHaveBeenCalled();
  });

  it("moves DOM focus with the pixel cursor so Enter activates that option", async () => {
    vi.useRealTimers();
    mantineHooks.reducedMotion = true;

    const items = options();
    const user = userEvent.setup();

    renderWithProvider(
      <LinaDialogue
        speaker="Lina"
        segments={[{ text: "Oi!" }]}
        options={items}
        variant="desktop"
        startDelayMs={0}
      />,
    );

    const dialogue = screen.getByRole("region");
    const board = screen
      .getByText("Me mostra o quadro de pedidos")
      .closest("button");
    const quick = screen
      .getByText("Tem algum pedido mais rápido?")
      .closest("button");

    expect(board).toHaveAttribute("data-active", "true");

    dialogue.focus();
    await user.keyboard("{ArrowDown}");

    expect(quick).toHaveFocus();
    expect(quick).toHaveAttribute("data-active", "true");
    expect(board).toHaveAttribute("data-active", "false");

    await user.keyboard("{Enter}");

    expect(items[1].onSelect).toHaveBeenCalledTimes(1);
    expect(items[0].onSelect).not.toHaveBeenCalled();
  });

  it("completes the line when Enter is pressed while typing", () => {
    renderWithProvider(
      <LinaDialogue
        speaker="Lina"
        segments={[{ text: LONG_LINE }]}
        options={options()}
        variant="desktop"
        startDelayMs={0}
      />,
    );

    const dialogue = screen.getByRole("region");

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(dialogue).toHaveAttribute("data-typing", "true");
    expect(screen.queryByText("▼")).toBeNull();

    fireEvent.keyDown(dialogue, { key: "Enter" });

    expect(dialogue).toHaveAttribute("data-typing", "false");
    expect(screen.getByText("▼")).toBeInTheDocument();
    expect(screen.getAllByText(LONG_LINE).length).toBeGreaterThan(0);
  });

  it("also completes the line on a click", () => {
    renderWithProvider(
      <LinaDialogue
        speaker="Lina"
        segments={[{ text: LONG_LINE }]}
        variant="mobile"
        startDelayMs={0}
      />,
    );

    act(() => {
      vi.advanceTimersByTime(100);
    });

    const dialogue = screen.getByRole("region");

    expect(dialogue).toHaveAttribute("data-typing", "true");

    fireEvent.click(dialogue.querySelector("p")!);

    expect(dialogue).toHaveAttribute("data-typing", "false");
  });

  it("completes the line on Space as well", () => {
    renderWithProvider(
      <LinaDialogue
        speaker="Lina"
        segments={[{ text: LONG_LINE }]}
        variant="desktop"
        startDelayMs={0}
      />,
    );

    act(() => {
      vi.advanceTimersByTime(100);
    });

    const dialogue = screen.getByRole("region");

    fireEvent.keyDown(dialogue, { key: " " });

    expect(dialogue).toHaveAttribute("data-typing", "false");
  });

  it("shows the whole line immediately with reduced motion", () => {
    mantineHooks.reducedMotion = true;

    renderWithProvider(
      <LinaDialogue
        speaker="Lina"
        segments={[{ text: LONG_LINE }]}
        variant="desktop"
        startDelayMs={0}
      />,
    );

    const dialogue = screen.getByRole("region");

    expect(dialogue).toHaveAttribute("data-typing", "false");
    expect(screen.getAllByText(LONG_LINE).length).toBeGreaterThan(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("reports the typing state to the sprite", () => {
    const onTypingChange = vi.fn();

    renderWithProvider(
      <LinaDialogue
        speaker="Lina"
        segments={[{ text: "Oi!" }]}
        variant="desktop"
        startDelayMs={0}
        onTypingChange={onTypingChange}
      />,
    );

    expect(onTypingChange).toHaveBeenLastCalledWith(true);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(onTypingChange).toHaveBeenLastCalledWith(false);
  });

  it("renders the gold highlight segment for game names", () => {
    renderWithProvider(
      <LinaDialogue
        speaker="Lina"
        segments={LINE_SEGMENTS}
        variant="desktop"
        startDelayMs={0}
      />,
    );

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByText("Hollow Knight").className).toContain(
      guildClasses.linaSegmentHighlight,
    );
  });

  it("collapses to the name plate and reopens through onExpand", () => {
    const onExpand = vi.fn();

    renderWithProvider(
      <LinaDialogue
        speaker="Lina · Recepcionista da Guilda"
        segments={[{ text: "Até mais!" }]}
        variant="desktop"
        collapsed
        onExpand={onExpand}
      />,
    );

    expect(screen.queryByRole("region")).toBeNull();

    fireEvent.click(
      screen.getByRole("button", { name: "Lina · Recepcionista da Guilda" }),
    );

    expect(onExpand).toHaveBeenCalledTimes(1);
  });
});

describe("GuildEarlyAccess", () => {
  it("renders Lina's early-access line and the supporter link", () => {
    renderWithProvider(<GuildEarlyAccess supporterHref="/premium" />);

    const link = screen.getByRole("link", { name: "Quero apoiar" });

    expect(link).toHaveAttribute("href", "/premium");
    expect(
      screen.getByRole("heading", {
        name: "A Guilda está em acesso antecipado",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(
        "A Guilda dos Aventureiros está em acesso antecipado para apoiadores.",
      ).length,
    ).toBeGreaterThan(0);
  });
});

describe("GuildSignInPrompt", () => {
  it("renders the sign-in line and the app's sign-in link", () => {
    renderWithProvider(<GuildSignInPrompt signInHref="/auth" />);

    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute(
      "href",
      "/auth",
    );
    expect(
      screen.getAllByText("Lina gosta de saber quem está chegando.").length,
    ).toBeGreaterThan(0);
  });
});
