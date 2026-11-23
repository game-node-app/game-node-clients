/**
 * Declares Roboto from `/font/Roboto-Variable.ttf` (present in the web and
 * mobile `public/font`) so `html-to-image` embeds the variable font when it
 * rasterizes the share card.
 */
const CSS = `
@font-face{font-family:'Game Share Roboto';src:url('/font/Roboto-Variable.ttf') format('truetype');font-weight:100 900;font-display:swap}
`;

export const GAME_SHARE_FONT_FAMILY = "'Game Share Roboto', Roboto, sans-serif";

export function GameShareFonts() {
  return <style>{CSS}</style>;
}

/** Resolves once the card weights are ready, so an export never uses fallbacks. */
export async function loadGameShareFonts(): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return;
  await Promise.all([
    document.fonts.load("400 28px 'Game Share Roboto'"),
    document.fonts.load("600 30px 'Game Share Roboto'"),
    document.fonts.load("700 132px 'Game Share Roboto'"),
  ]);
}
