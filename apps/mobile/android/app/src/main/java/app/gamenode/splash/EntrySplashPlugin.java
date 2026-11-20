package app.gamenode.splash;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Lets the web app tell the native {@link EntrySplashView} that it has painted and can be revealed. The
 * call resolves once the splash is gone.
 */
@CapacitorPlugin(name = "EntrySplash")
public class EntrySplashPlugin extends Plugin {

    @PluginMethod
    public void reveal(PluginCall call) {
        getActivity().runOnUiThread(() -> EntrySplashView.revealCurrent(call::resolve));
    }
}
