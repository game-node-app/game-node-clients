package app.gamenode.widget;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.appwidget.AppWidgetProviderInfo;
import android.content.Intent;
import android.os.Build;
import android.widget.RemoteViews;

public final class WidgetRefresher {
    private WidgetRefresher() {}

    public static final Class<?>[] PROVIDERS = {
            HoursWidgetProvider.class,
            TopGameWidgetProvider.class,
            Top3WidgetProvider.class,
            PosterWidgetProvider.class,
            PersonalityWidgetProvider.class,
            DailyWidgetProvider.class
    };

    /** Asks every placed Wrapped widget to re-render from the stored snapshot. */
    public static void refreshAll(Context context) {
        try {
            Context app = context.getApplicationContext();
            AppWidgetManager mgr = AppWidgetManager.getInstance(app);
            for (Class<?> cls : PROVIDERS) {
                int[] ids = mgr.getAppWidgetIds(new ComponentName(app, cls));
                if (ids == null || ids.length == 0) continue;
                Intent i = new Intent(app, cls);
                i.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
                i.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
                app.sendBroadcast(i);
            }
        } catch (Throwable ignored) {
            // never crash the caller
        }
        updatePreviews(context);
    }

    /**
     * Android 15+: the widget picker shows the user's own Wrapped instead of the static sample
     * layout. Without a snapshot the generated preview is removed so the sample comes back. The
     * system rate-limits this call, which is why it only runs when the snapshot changes.
     */
    private static void updatePreviews(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.VANILLA_ICE_CREAM) return;
        try {
            Context app = context.getApplicationContext();
            AppWidgetManager mgr = AppWidgetManager.getInstance(app);
            for (Class<?> cls : PROVIDERS) {
                try {
                    ComponentName cn = new ComponentName(app, cls);
                    RemoteViews preview = ((BaseWidgetProvider) cls.getDeclaredConstructor().newInstance())
                            .buildPreview(app);
                    if (preview != null) {
                        mgr.setWidgetPreview(cn, AppWidgetProviderInfo.WIDGET_CATEGORY_HOME_SCREEN, preview);
                    } else {
                        mgr.removeWidgetPreview(cn, AppWidgetProviderInfo.WIDGET_CATEGORY_HOME_SCREEN);
                    }
                } catch (Throwable ignored) {
                    // one provider failing must not block the others
                }
            }
        } catch (Throwable ignored) {
            // previews are a nicety, never crash the caller
        }
    }
}
