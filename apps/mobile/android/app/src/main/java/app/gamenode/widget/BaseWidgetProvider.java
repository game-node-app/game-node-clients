package app.gamenode.widget;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.util.TypedValue;
import android.widget.RemoteViews;

import app.gamenode.R;

/** Shared plumbing: size resolution, tap-to-open, empty fallback, crash safety. */
abstract class BaseWidgetProvider extends AppWidgetProvider {
    protected static final float RADIUS_DP = 28f;

    /** Design size in dp (Figma). */
    protected abstract int designWidth();

    protected abstract int designHeight();

    /**
     * Where a tap on the widget goes. It is an https link on the app's own domain: the app's
     * `AppUrlListener` turns it into the matching in-app route (e.g. `/recap` becomes the Wrapped
     * screen, opened on the same 12 months the widgets summarise), both when the app is already running and on a cold start.
     */
    protected String targetUrl() {
        return "https://gamenode.app/recap?period=year";
    }

    /** Builds the populated widget. May throw; the caller falls back to the empty state. */
    protected abstract RemoteViews build(Context ctx, WidgetSnapshot s, int wDp, int hDp, float scale);

    /**
     * Renders the widget from whatever snapshot this provider reads (Wrapped by default).
     * Providers with their own snapshot override this. May throw; the caller falls back to empty.
     */
    protected RemoteViews render(Context ctx, int wDp, int hDp, float scale) {
        WidgetSnapshot s = WidgetSnapshot.load(ctx);
        if (s != null && !s.isEmpty()) {
            return build(ctx, s, wDp, hDp, scale);
        }
        return buildEmpty(ctx, s, wDp, hDp, scale);
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager mgr, int[] appWidgetIds) {
        for (int id : appWidgetIds) update(context, mgr, id);
    }

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager mgr, int id, Bundle newOptions) {
        update(context, mgr, id);
        super.onAppWidgetOptionsChanged(context, mgr, id, newOptions);
    }

    /**
     * Widget as the picker should show it (Android 15+ generated previews): rendered with the
     * user's own snapshot at the design size, or null when there is nothing to show yet.
     */
    RemoteViews buildPreview(Context context) {
        try {
            WidgetSnapshot s = WidgetSnapshot.load(context);
            if (s == null || s.isEmpty()) return null;
            return build(context, s, designWidth(), designHeight(), WidgetBitmaps.scale(context));
        } catch (Throwable t) {
            return null;
        }
    }

    private void update(Context context, AppWidgetManager mgr, int id) {
        RemoteViews rv = null;
        try {
            int[] size = resolveSize(context, mgr, id);
            float scale = WidgetBitmaps.scale(context);
            rv = render(context, size[0], size[1], scale);
        } catch (Throwable t) {
            try {
                int[] size = {designWidth(), designHeight()};
                rv = buildEmpty(context, null, size[0], size[1], WidgetBitmaps.scale(context));
            } catch (Throwable ignored) {
                rv = null;
            }
        }
        if (rv == null) return;
        try {
            rv.setOnClickPendingIntent(R.id.root, openAppIntent(context, id, targetUrl()));
            mgr.updateAppWidget(id, rv);
        } catch (Throwable ignored) {
            // never crash from the receiver
        }
    }

    /**
     * Real size of the widget in dp. The launcher reports a min and a max box: the
     * width/height it really occupies are MIN_WIDTH x MAX_HEIGHT in portrait and
     * MAX_WIDTH x MIN_HEIGHT in landscape. Using the wrong pair makes the bitmaps
     * drawn here a different aspect ratio than the view, which stretches them.
     */
    private int[] resolveSize(Context context, AppWidgetManager mgr, int id) {
        int w = designWidth(), h = designHeight();
        try {
            Bundle o = mgr.getAppWidgetOptions(id);
            boolean landscape = context.getResources().getConfiguration().orientation
                    == android.content.res.Configuration.ORIENTATION_LANDSCAPE;
            int ow = o.getInt(landscape ? AppWidgetManager.OPTION_APPWIDGET_MAX_WIDTH
                    : AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 0);
            int oh = o.getInt(landscape ? AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT
                    : AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT, 0);
            if (ow > 0) w = clamp(ow, designWidth());
            if (oh > 0) h = clamp(oh, designHeight());
        } catch (Throwable ignored) {
        }
        return new int[]{w, h};
    }

    private static int clamp(int v, int design) {
        return Math.max(Math.round(design * 0.7f), Math.min(Math.round(design * 2f), v));
    }

    private static PendingIntent openAppIntent(Context ctx, int id, String url) {
        Intent open = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
        // Explicit component: no chooser, and it works even if the App Link is not verified.
        open.setClassName(ctx.getPackageName(), "app.gamenode.MainActivity");
        open.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED);
        return PendingIntent.getActivity(ctx, id, open,
                PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
    }

    protected RemoteViews buildEmpty(Context ctx, WidgetSnapshot s, int wDp, int hDp, float scale) {
        RemoteViews rv = new RemoteViews(ctx.getPackageName(), R.layout.wrapped_widget_empty);
        String title = s != null ? s.str("emptyTitle", ctx.getString(R.string.wrapped_empty_title))
                : ctx.getString(R.string.wrapped_empty_title);
        String body = s != null ? s.str("emptyBody", ctx.getString(R.string.wrapped_empty_body))
                : ctx.getString(R.string.wrapped_empty_body);
        rv.setTextViewText(R.id.empty_title, title);
        rv.setTextViewText(R.id.empty_body, body);
        Bitmap bg = WidgetBitmaps.background(px(wDp, scale), px(hDp, scale), px(RADIUS_DP, scale), null,
                null, null, 0.9f, 0.95f, 105f * scale, 0.5f);
        rv.setImageViewBitmap(R.id.bg, bg);
        return rv;
    }

    protected static int px(float dp, float scale) {
        return Math.max(1, Math.round(dp * scale));
    }

    /** Sets a text size that shrinks with length so big numbers never overflow. */
    protected static void setValueSize(RemoteViews rv, int viewId, String text, float baseSp) {
        int len = text == null ? 0 : text.length();
        float sp = baseSp;
        if (len > 4) sp = baseSp * (4f / len + 0.1f);
        sp = Math.max(sp, baseSp * 0.5f);
        rv.setTextViewTextSize(viewId, TypedValue.COMPLEX_UNIT_SP, Math.min(sp, baseSp));
    }
}
