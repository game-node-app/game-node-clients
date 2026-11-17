/**
 * Declares Roboto from `/font/Roboto-Variable.ttf` (present in both web and
 * mobile `public/font`) so `html-to-image` embeds the variable font across
 * weights 400, 600 and 700 when rasterizing the ballot share card.
 */
const CSS = `
@font-face{font-family:'Awards Ballot Roboto';src:url('/font/Roboto-Variable.ttf') format('truetype');font-weight:100 900;font-display:swap}
`;

export const AWARDS_BALLOT_FONT_FAMILY =
  "'Awards Ballot Roboto', Roboto, sans-serif";

export function AwardsBallotFonts() {
  return <style>{CSS}</style>;
}

/** Resolves once the ballot card font weights are ready before PNG export. */
export async function loadAwardsBallotFonts(): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return;
  await Promise.all([
    document.fonts.load("400 32px 'Awards Ballot Roboto'"),
    document.fonts.load("600 36px 'Awards Ballot Roboto'"),
    document.fonts.load("700 88px 'Awards Ballot Roboto'"),
  ]);
}
