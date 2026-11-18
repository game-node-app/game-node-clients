package app.gamenode.widget;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.os.Build;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

@CapacitorPlugin(name = "WrappedWidget")
public class WrappedWidgetPlugin extends Plugin {

    @PluginMethod
    public void update(final PluginCall call) {
        final JSONObject snapshot = call.getObject("snapshot");
        if (snapshot == null) {
            call.reject("snapshot is required");
            return;
        }
        final Context ctx = getContext().getApplicationContext();
        final String json = snapshot.toString();
        final WidgetSnapshot parsed;
        try {
            parsed = WidgetSnapshot.parse(json);
        } catch (Exception e) {
            call.reject("invalid snapshot", e);
            return;
        }
        new Thread(() -> {
            try {
                ctx.getSharedPreferences(WidgetSnapshot.PREFS, Context.MODE_PRIVATE)
                        .edit().putString(WidgetSnapshot.KEY, json).commit();

                File dir = WidgetSnapshot.imagesDir(ctx);
                //noinspection ResultOfMethodCallIgnored
                dir.mkdirs();
                for (int i = 0; i < 3; i++) {
                    String url = i < parsed.topGames.size() ? parsed.topGames.get(i).coverUrl : null;
                    syncImage(url, WidgetSnapshot.coverFile(ctx, i));
                }
                syncImage(parsed.avatarUrl, WidgetSnapshot.avatarFile(ctx));
            } catch (Throwable ignored) {
                // images are best-effort; widgets fall back to placeholders
            }
            WidgetRefresher.refreshAll(ctx);
            call.resolve();
        }, "wrapped-widget-update").start();
    }

    @PluginMethod
    public void clear(final PluginCall call) {
        final Context ctx = getContext().getApplicationContext();
        new Thread(() -> {
            try {
                ctx.getSharedPreferences(WidgetSnapshot.PREFS, Context.MODE_PRIVATE)
                        .edit().remove(WidgetSnapshot.KEY).commit();
                deleteRecursive(WidgetSnapshot.imagesDir(ctx));
            } catch (Throwable ignored) {
            }
            WidgetRefresher.refreshAll(ctx);
            call.resolve();
        }, "wrapped-widget-clear").start();
    }

    @PluginMethod
    public void updateDaily(final PluginCall call) {
        final JSONObject snapshot = call.getObject("snapshot");
        if (snapshot == null) {
            call.reject("snapshot is required");
            return;
        }
        final Context ctx = getContext().getApplicationContext();
        final String json = snapshot.toString();
        try {
            DailyWidgetSnapshot.parse(json);
        } catch (Exception e) {
            call.reject("invalid snapshot", e);
            return;
        }
        new Thread(() -> {
            try {
                ctx.getSharedPreferences(WidgetSnapshot.PREFS, Context.MODE_PRIVATE)
                        .edit().putString(DailyWidgetSnapshot.KEY, json).commit();
            } catch (Throwable ignored) {
            }
            WidgetRefresher.refreshAll(ctx);
            call.resolve();
        }, "daily-widget-update").start();
    }

    @PluginMethod
    public void clearDaily(final PluginCall call) {
        final Context ctx = getContext().getApplicationContext();
        new Thread(() -> {
            try {
                ctx.getSharedPreferences(WidgetSnapshot.PREFS, Context.MODE_PRIVATE)
                        .edit().remove(DailyWidgetSnapshot.KEY).commit();
            } catch (Throwable ignored) {
            }
            WidgetRefresher.refreshAll(ctx);
            call.resolve();
        }, "daily-widget-clear").start();
    }

    @PluginMethod
    public void isSupported(PluginCall call) {
        JSObject ret = new JSObject();
        boolean supported = false;
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                supported = AppWidgetManager.getInstance(getContext()).isRequestPinAppWidgetSupported();
            }
        } catch (Throwable ignored) {
        }
        ret.put("supported", supported);
        call.resolve(ret);
    }

    @PluginMethod
    public void requestPin(PluginCall call) {
        JSObject ret = new JSObject();
        boolean requested = false;
        try {
            String widget = call.getString("widget", "");
            Class<?> cls = providerFor(widget);
            if (cls != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                AppWidgetManager mgr = AppWidgetManager.getInstance(getContext());
                if (mgr.isRequestPinAppWidgetSupported()) {
                    requested = mgr.requestPinAppWidget(new ComponentName(getContext(), cls), null, null);
                }
            }
        } catch (Throwable ignored) {
        }
        ret.put("requested", requested);
        call.resolve(ret);
    }

    private static Class<?> providerFor(String widget) {
        if (widget == null) return null;
        switch (widget) {
            case "hours":
                return HoursWidgetProvider.class;
            case "topGame":
                return TopGameWidgetProvider.class;
            case "top3":
                return Top3WidgetProvider.class;
            case "poster":
                return PosterWidgetProvider.class;
            case "personality":
                return PersonalityWidgetProvider.class;
            case "daily":
                return DailyWidgetProvider.class;
            default:
                return null;
        }
    }

    /** Downloads url into target; deletes target when url is null or the download fails. */
    private static void syncImage(String url, File target) {
        if (url == null || url.isEmpty()) {
            //noinspection ResultOfMethodCallIgnored
            target.delete();
            return;
        }
        File tmp = new File(target.getParentFile(), target.getName() + ".tmp");
        HttpURLConnection conn = null;
        try {
            conn = (HttpURLConnection) new URL(url).openConnection();
            conn.setConnectTimeout(10000);
            conn.setReadTimeout(10000);
            conn.setInstanceFollowRedirects(true);
            if (conn.getResponseCode() / 100 != 2) throw new java.io.IOException("HTTP " + conn.getResponseCode());
            try (InputStream in = conn.getInputStream(); FileOutputStream out = new FileOutputStream(tmp)) {
                byte[] buf = new byte[8192];
                int n;
                while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
            }
            if (target.exists()) //noinspection ResultOfMethodCallIgnored
                target.delete();
            //noinspection ResultOfMethodCallIgnored
            tmp.renameTo(target);
        } catch (Throwable t) {
            //noinspection ResultOfMethodCallIgnored
            tmp.delete();
            // keep any previous image for this slot only if URL failed? Stale covers would be wrong, drop it.
            //noinspection ResultOfMethodCallIgnored
            target.delete();
        } finally {
            if (conn != null) conn.disconnect();
        }
    }

    private static void deleteRecursive(File f) {
        if (f == null || !f.exists()) return;
        File[] kids = f.listFiles();
        if (kids != null) for (File k : kids) deleteRecursive(k);
        //noinspection ResultOfMethodCallIgnored
        f.delete();
    }
}
