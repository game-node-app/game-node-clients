import { ColorSchemeScript } from "@mantine/core";
import { DEFAULT_THEME_ID, getThemeCatalogEntry } from "@repo/ui";
import Document, {
  Head,
  Html,
  Main,
  NextScript,
  type DocumentContext,
  type DocumentInitialProps,
} from "next/document";
import type { AppProps } from "next/app";
import React from "react";

import { getThemeInitScript } from "@/components/theme/themeInitScript";
import { readRequestThemeId } from "@/components/theme/themeStorage";

type ThemeDocumentProps = DocumentInitialProps & {
  /** Catalog id the server rendered with (`gamenode` while prerendering). */
  initialTheme: string;
};

/**
 * Reads the theme cookie on the server (dynamic pages) and exposes the same
 * value to `_app` through `enhanceApp`. `_document.getInitialProps` does not
 * disable Automatic Static Optimization; `ctx.req` is simply undefined while a
 * page is prerendered, in which case the default theme is emitted and the head
 * script restores the stored one before the first paint.
 */
export default class GameNodeDocument extends Document<ThemeDocumentProps> {
  static async getInitialProps(
    ctx: DocumentContext,
  ): Promise<ThemeDocumentProps> {
    const initialTheme = readRequestThemeId(ctx.req);
    if (initialTheme !== DEFAULT_THEME_ID) {
      ctx.res?.setHeader("Cache-Control", "private, no-store");
    }
    const originalRenderPage = ctx.renderPage;

    ctx.renderPage = () =>
      originalRenderPage({
        enhanceApp: (App) => {
          const AppWithTheme = App as unknown as React.ComponentType<
            AppProps & { initialTheme?: string }
          >;

          return function AppWithInitialTheme(props: AppProps) {
            return <AppWithTheme {...props} initialTheme={initialTheme} />;
          };
        },
      });

    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps, initialTheme };
  }

  render() {
    const { initialTheme } = this.props;
    const themeColor = getThemeCatalogEntry(initialTheme).preview.background;

    return (
      <Html data-theme={initialTheme} data-theme-ssr={initialTheme}>
        <Head>
          <meta name="theme-color" content={themeColor} />
          {/*
           * Runs before the first paint on static pages: restores the stored
           * theme, records `data-theme-ssr` for hydration and updates
           * `theme-color`. Generated from the catalog, so no request data.
           */}
          <script dangerouslySetInnerHTML={{ __html: getThemeInitScript() }} />
          <ColorSchemeScript defaultColorScheme="dark" />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/favicon/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon/favicon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon/favicon.png"
          />
          <link rel="manifest" href="/favicon/site.webmanifest" />
        </Head>
        <body className="app-web">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
