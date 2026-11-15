/**
 * Declares the card typefaces. The files live in each app's `public/font`
 * (copied from Echo; both families are SIL OFL). The rules sit in the document
 * so `html-to-image` finds and embeds them when it exports the card.
 */
const CSS = `
@font-face{font-family:'Recap Display';src:url('/font/BricolageGrotesque-Variable.ttf') format('truetype');font-weight:200 800;font-display:swap}
@font-face{font-family:'Recap Mono';src:url('/font/SpaceMono-Regular.ttf') format('truetype');font-weight:400;font-display:swap}
@font-face{font-family:'Recap Mono';src:url('/font/SpaceMono-Bold.ttf') format('truetype');font-weight:700;font-display:swap}
`;

export function RecapCardFonts() {
  return <style>{CSS}</style>;
}

/** Resolves once the card fonts are ready, so an export never uses fallbacks. */
export async function loadRecapFonts(): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return;
  await Promise.all([
    document.fonts.load("800 100px 'Recap Display'"),
    document.fonts.load("700 20px 'Recap Mono'"),
    document.fonts.load("400 20px 'Recap Mono'"),
  ]);
}
