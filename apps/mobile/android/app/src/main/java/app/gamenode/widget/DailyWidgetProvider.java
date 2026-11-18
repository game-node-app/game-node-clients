package app.gamenode.widget;

import android.content.Context;
import android.os.SystemClock;
import android.view.View;
import android.widget.RemoteViews;

import app.gamenode.R;

/** GameNode Daily widget (2x2) with its own snapshot: "played" (results) and "pending" (call to play). */
public class DailyWidgetProvider extends BaseWidgetProvider {
    private static final int GREEN = 0x2E9E5B;
    private static final int ORANGE = 0xF15025;

    private static final int[] SLOTS = {R.id.puzzle_0, R.id.puzzle_1, R.id.puzzle_2, R.id.puzzle_3};

    @Override
    protected int designWidth() {
        return 160;
    }

    @Override
    protected int designHeight() {
        return 160;
    }

    @Override
    protected String targetUrl() {
        return "https://gamenode.app/daily";
    }

    /** Unused: this provider has its own snapshot (see render). */
    @Override
    protected RemoteViews build(Context ctx, WidgetSnapshot s, int wDp, int hDp, float scale) {
        return buildEmpty(ctx, s, wDp, hDp, scale);
    }

    @Override
    protected RemoteViews render(Context ctx, int wDp, int hDp, float scale) {
        DailyWidgetSnapshot d = DailyWidgetSnapshot.load(ctx);
        if (d == null || d.isEmpty()) return buildDailyEmpty(ctx, d, wDp, hDp, scale);
        return d.played ? buildPlayed(ctx, d, wDp, hDp, scale) : buildPending(ctx, d, wDp, hDp, scale);
    }

    @Override
    RemoteViews buildPreview(Context context) {
        try {
            DailyWidgetSnapshot d = DailyWidgetSnapshot.load(context);
            if (d == null || d.isEmpty()) return null;
            float scale = WidgetBitmaps.scale(context);
            return d.played ? buildPlayed(context, d, designWidth(), designHeight(), scale)
                    : buildPending(context, d, designWidth(), designHeight(), scale);
        } catch (Throwable t) {
            return null;
        }
    }

    private RemoteViews buildDailyEmpty(Context ctx, DailyWidgetSnapshot d, int wDp, int hDp, float scale) {
        RemoteViews rv = new RemoteViews(ctx.getPackageName(), R.layout.wrapped_widget_empty);
        rv.setTextViewText(R.id.empty_title, d != null
                ? d.str("emptyTitle", ctx.getString(R.string.daily_empty_title))
                : ctx.getString(R.string.daily_empty_title));
        rv.setTextViewText(R.id.empty_body, d != null
                ? d.str("emptyBody", ctx.getString(R.string.daily_empty_body))
                : ctx.getString(R.string.daily_empty_body));
        rv.setImageViewBitmap(R.id.bg, WidgetBitmaps.glowBackground(px(wDp, scale), px(hDp, scale),
                px(RADIUS_DP, scale), ORANGE, 0.9f, 0.95f, 105f * scale, 0.45f));
        return rv;
    }

    private RemoteViews buildPlayed(Context ctx, DailyWidgetSnapshot d, int wDp, int hDp, float scale) {
        RemoteViews rv = new RemoteViews(ctx.getPackageName(), R.layout.wrapped_widget_daily_played);
        rv.setImageViewBitmap(R.id.bg, WidgetBitmaps.glowBackground(px(wDp, scale), px(hDp, scale),
                px(RADIUS_DP, scale), GREEN, 0.9f, 0.95f, 100f * scale, 0.3f));
        rv.setTextViewText(R.id.eyebrow, d.str("eyebrow", ""));
        for (int i = 0; i < SLOTS.length; i++) {
            String st = i < d.puzzles.size() ? d.puzzles.get(i) : "none";
            rv.setImageViewResource(SLOTS[i], squareFor(st));
        }
        rv.setTextViewText(R.id.daily_title, d.str("title", ""));
        String sub = d.strOrNull("subtitle");
        if (sub != null) {
            rv.setTextViewText(R.id.daily_subtitle, sub);
            rv.setViewVisibility(R.id.daily_subtitle, View.VISIBLE);
        } else {
            rv.setViewVisibility(R.id.daily_subtitle, View.GONE);
        }
        long remaining = d.nextResetAt - System.currentTimeMillis();
        if (d.nextResetAt > 0 && remaining > 0) {
            rv.setChronometerCountDown(R.id.daily_countdown, true);
            rv.setChronometer(R.id.daily_countdown, SystemClock.elapsedRealtime() + remaining,
                    d.str("countdownFormat", "%s"), true);
            rv.setViewVisibility(R.id.daily_countdown, View.VISIBLE);
        } else {
            rv.setChronometer(R.id.daily_countdown, SystemClock.elapsedRealtime(), null, false);
            rv.setViewVisibility(R.id.daily_countdown, View.GONE);
        }
        return rv;
    }

    private RemoteViews buildPending(Context ctx, DailyWidgetSnapshot d, int wDp, int hDp, float scale) {
        RemoteViews rv = new RemoteViews(ctx.getPackageName(), R.layout.wrapped_widget_daily_pending);
        rv.setImageViewBitmap(R.id.bg, WidgetBitmaps.glowBackground(px(wDp, scale), px(hDp, scale),
                px(RADIUS_DP, scale), ORANGE, 0.1f, 0.05f, 100f * scale, 0.35f));
        rv.setTextViewText(R.id.eyebrow, d.str("eyebrow", ""));
        String streak = d.strOrNull("streakChip");
        if (streak != null) {
            rv.setTextViewText(R.id.streak_chip, streak);
            rv.setViewVisibility(R.id.streak_chip, View.VISIBLE);
        } else {
            rv.setViewVisibility(R.id.streak_chip, View.GONE);
        }
        rv.setTextViewText(R.id.daily_title, d.str("title", ""));
        String cta = d.strOrNull("cta");
        if (cta != null) {
            rv.setTextViewText(R.id.daily_cta, cta);
            rv.setViewVisibility(R.id.daily_cta, View.VISIBLE);
        } else {
            rv.setViewVisibility(R.id.daily_cta, View.GONE);
        }
        return rv;
    }

    private static int squareFor(String status) {
        switch (status) {
            case "won":
                return R.drawable.daily_square_won;
            case "lost":
                return R.drawable.daily_square_lost;
            case "in_progress":
                return R.drawable.daily_square_progress;
            default:
                return R.drawable.daily_square_none;
        }
    }
}
