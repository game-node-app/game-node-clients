package app.gamenode;

import android.os.Build;
import android.os.Bundle;

import androidx.core.splashscreen.SplashScreen;

import com.getcapacitor.BridgeActivity;

import app.gamenode.splash.EntrySplashPlugin;
import app.gamenode.splash.EntrySplashView;
import app.gamenode.splash.SplashPalette;
import app.gamenode.storage.QueryCacheStoragePlugin;
import app.gamenode.widget.WrappedWidgetPlugin;

public class MainActivity extends BridgeActivity {
    /** The launch theme last handed to the system splash (0 = none yet in this process). */
    private int appliedLaunchTheme = 0;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // EntrySplashView takes over from the system splash with the same picture: drop the system one
        // at once instead of its exit animation, which blends a greyed logo over it for a frame.
        SplashScreen.installSplashScreen(this).setOnExitAnimationListener((splash) -> splash.remove());
        registerPlugin(WrappedWidgetPlugin.class);
        registerPlugin(EntrySplashPlugin.class);
        registerPlugin(QueryCacheStoragePlugin.class);
        super.onCreate(savedInstanceState);
        // Continues the launch splash over the WebView until the web app has painted (see EntrySplashView),
        // in the colors of the theme the user picked.
        SplashPalette palette = SplashPalette.load(this);
        EntrySplashView.attach(this, palette);
        applyLaunchTheme(palette);
    }

    @Override
    public void onStop() {
        super.onStop();
        // The user may have switched themes during this session: the next launch's system splash should match.
        applyLaunchTheme(SplashPalette.load(this));
    }

    /**
     * The system splash is drawn before any app code runs, from the activity's launch theme. Android 13+
     * lets the app pick that theme for the next launches (the system persists it); older versions always
     * show the default one from the manifest.
     */
    private void applyLaunchTheme(SplashPalette palette) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) return;
        if (palette.launchTheme == appliedLaunchTheme) return;
        try {
            getSplashScreen().setSplashScreenTheme(palette.launchTheme);
            appliedLaunchTheme = palette.launchTheme;
        } catch (RuntimeException e) {
            // cosmetic only: keep the default system splash
        }
    }
}
