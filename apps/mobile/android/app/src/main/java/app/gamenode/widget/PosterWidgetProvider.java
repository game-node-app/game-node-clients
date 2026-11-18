package app.gamenode.widget;

import android.content.Context;
import android.graphics.Bitmap;
import android.view.View;
import android.widget.RemoteViews;

import app.gamenode.R;

public class PosterWidgetProvider extends BaseWidgetProvider {
    private static final int[] SCRIM = {0x73000000, 0x8C000000, 0xF5111111};
    private static final float[] SCRIM_POS = {0f, 0.5f, 1f};
    private static final int[] CHIPS = {R.id.chip0, R.id.chip1, R.id.chip2};

    @Override
    protected int designWidth() {
        return 336;
    }

    @Override
    protected int designHeight() {
        return 248;
    }

    @Override
    protected RemoteViews build(Context ctx, WidgetSnapshot s, int wDp, int hDp, float scale) {
        RemoteViews rv = new RemoteViews(ctx.getPackageName(), R.layout.wrapped_widget_poster);
        int w = px(wDp, scale), h = px(hDp, scale);
        Bitmap cover = WidgetBitmaps.decode(WidgetSnapshot.coverFile(ctx, 0), w, h);
        Bitmap bg = WidgetBitmaps.background(w, h, px(RADIUS_DP, scale), cover, SCRIM, SCRIM_POS,
                0.05f, 1.0f, 170f * scale, 0.45f);
        if (cover != null) cover.recycle();
        rv.setImageViewBitmap(R.id.bg, bg);

        int av = px(36, scale);
        Bitmap avSrc = s.avatarUrl != null ? WidgetBitmaps.decode(WidgetSnapshot.avatarFile(ctx), av, av) : null;
        Bitmap avatar = WidgetBitmaps.avatar(avSrc, s.username, av, 2f * scale);
        if (avSrc != null) avSrc.recycle();
        rv.setImageViewBitmap(R.id.avatar, avatar);
        rv.setContentDescription(R.id.avatar, s.username);

        rv.setTextViewText(R.id.username, s.username);
        rv.setTextViewText(R.id.subtitle, s.str("posterSubtitle", ""));
        rv.setTextViewText(R.id.year_chip, s.str("yearChip", ""));

        String hours = s.str("hoursValue", "0") + " h";
        rv.setTextViewText(R.id.hours_value, hours);
        setValueSize(rv, R.id.hours_value, hours, 54f);
        rv.setTextViewText(R.id.tagline, s.str("posterTagline", ""));

        for (int i = 0; i < 3; i++) {
            if (i < s.chips.size()) {
                rv.setTextViewText(CHIPS[i], s.chips.get(i));
                rv.setViewVisibility(CHIPS[i], View.VISIBLE);
            } else {
                rv.setViewVisibility(CHIPS[i], View.GONE);
            }
        }
        rv.setTextViewText(R.id.view_recap, s.str("viewRecap", ""));
        return rv;
    }
}
