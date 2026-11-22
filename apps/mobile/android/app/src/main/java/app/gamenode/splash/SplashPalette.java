package app.gamenode.splash;

import android.content.Context;
import android.content.SharedPreferences;
import androidx.annotation.ColorInt;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.StyleRes;
import androidx.core.content.ContextCompat;

/**
 * Splash colors for the theme the app last rendered.
 *
 * The web app saves that theme id through @capacitor/preferences (`NativeThemeChrome`, in
 * `apps/mobile/src/theme/native-theme-chrome.ts`), which stores it in the `CapacitorStorage`
 * SharedPreferences, so the native splash can read it synchronously before the WebView exists. It is the
 * rendered theme, not the saved preference: a signed-out or lapsed Supporter keeps "xbox" as their
 * preference but sees the default theme, and the splash must match what they see. An unknown or missing
 * id falls back to the default (GameNode) colors.
 *
 * The per-theme resources and the id lookup ({@link SplashThemes}) are generated from the theme catalog by
 * `pnpm splash:generate` (apps/mobile/scripts/native-splash.ts); adding a theme needs no change here.
 */
public final class SplashPalette {

    /** @capacitor/preferences' default group and the key NativeThemeChrome writes (SPLASH_THEME_STORAGE_KEY). */
    private static final String PREFERENCES_GROUP = "CapacitorStorage";
    private static final String THEME_KEY = "gn-splash-theme";

    @ColorInt
    public final int background;

    @ColorInt
    public final int brand;

    @ColorInt
    public final int logoInner;

    /** Launch theme (system splash) with the same colors, for {@code SplashScreen#setSplashScreenTheme}. */
    @StyleRes
    public final int launchTheme;

    private SplashPalette(@ColorInt int background, @ColorInt int brand, @ColorInt int logoInner, @StyleRes int launchTheme) {
        this.background = background;
        this.brand = brand;
        this.logoInner = logoInner;
        this.launchTheme = launchTheme;
    }

    @NonNull
    public static SplashPalette load(@NonNull Context context) {
        SplashThemes theme = SplashThemes.forId(readThemeId(context));
        return new SplashPalette(
            ContextCompat.getColor(context, theme.background),
            ContextCompat.getColor(context, theme.brand),
            ContextCompat.getColor(context, theme.logoInner),
            theme.launchTheme
        );
    }

    @Nullable
    private static String readThemeId(@NonNull Context context) {
        try {
            SharedPreferences preferences = context.getSharedPreferences(PREFERENCES_GROUP, Context.MODE_PRIVATE);
            return preferences.getString(THEME_KEY, null);
        } catch (RuntimeException e) {
            // never let a bad preference keep the app from opening: use the default colors
            return null;
        }
    }
}
