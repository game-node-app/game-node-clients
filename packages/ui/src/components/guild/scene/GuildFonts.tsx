/**
 * Declares the Guild's pixel typefaces. The files live in each app's
 * `public/font` (both families are SIL OFL). `Guild Pixel` is Pixelify Sans
 * and `Guild Stamp` is Silkscreen.
 */
const CSS = `
@font-face{font-family:'Guild Pixel';src:url('/font/PixelifySans-Variable.ttf') format('truetype');font-weight:400 700;font-display:swap}
@font-face{font-family:'Guild Stamp';src:url('/font/Silkscreen-Regular.ttf') format('truetype');font-weight:400;font-display:swap}
@font-face{font-family:'Guild Stamp';src:url('/font/Silkscreen-Bold.ttf') format('truetype');font-weight:700;font-display:swap}
`;

export function GuildFonts() {
  return <style>{CSS}</style>;
}
