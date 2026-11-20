package app.gamenode;

import android.os.Bundle;

import androidx.core.splashscreen.SplashScreen;

import com.getcapacitor.BridgeActivity;

import app.gamenode.splash.EntrySplashPlugin;
import app.gamenode.splash.EntrySplashView;
import app.gamenode.storage.QueryCacheStoragePlugin;
import app.gamenode.widget.WrappedWidgetPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // EntrySplashView takes over from the system splash with the same picture: drop the system one
        // at once instead of its exit animation, which blends a greyed logo over it for a frame.
        SplashScreen.installSplashScreen(this).setOnExitAnimationListener((splash) -> splash.remove());
        registerPlugin(WrappedWidgetPlugin.class);
        registerPlugin(EntrySplashPlugin.class);
        registerPlugin(QueryCacheStoragePlugin.class);
        super.onCreate(savedInstanceState);
        // Continues the launch splash over the WebView until the web app has painted (see EntrySplashView).
        EntrySplashView.attach(this);
    }
}
