package app.gamenode.widget;

import android.content.Context;
import android.graphics.Bitmap;
import android.view.View;
import android.widget.RemoteViews;

import app.gamenode.R;

public class Top3WidgetProvider extends BaseWidgetProvider {
    private static final int[] COLS = {R.id.col0, R.id.col1, R.id.col2};
    private static final int[] COVERS = {R.id.cover0, R.id.cover1, R.id.cover2};
    private static final int[] HOURS = {R.id.hours0, R.id.hours1, R.id.hours2};

    @Override
    protected int designWidth() {
        return 336;
    }

    @Override
    protected int designHeight() {
        return 160;
    }

    @Override
    protected RemoteViews build(Context ctx, WidgetSnapshot s, int wDp, int hDp, float scale) {
        RemoteViews rv = new RemoteViews(ctx.getPackageName(), R.layout.wrapped_widget_top3);
        rv.setImageViewBitmap(R.id.bg, WidgetBitmaps.background(px(wDp, scale), px(hDp, scale),
                px(RADIUS_DP, scale), null, null, null, 0.0f, 0.5f, 140f * scale, 0.3f));
        rv.setTextViewText(R.id.title, s.str("top3Title", ""));
        String periodChip = s.str("periodChip", "");
        rv.setTextViewText(R.id.period_chip, periodChip);
        rv.setViewVisibility(R.id.period_chip, periodChip.isEmpty() ? View.GONE : View.VISIBLE);
        // Covers fill the room the widget really has (it can be resized taller than the
        // 336x160 design) at up to the 3:4 poster ratio, instead of a fixed 93x72 strip.
        float colDp = (wDp - 2 * 16 - 2 * 12) / 3f;
        float coverDp = Math.max(72f, Math.min(colDp * 4f / 3f, hDp - 82f));
        int cw = px(colDp, scale), ch = px(coverDp, scale);
        for (int i = 0; i < 3; i++) {
            if (i >= s.topGames.size()) {
                rv.setViewVisibility(COLS[i], View.INVISIBLE);
                continue;
            }
            WidgetSnapshot.Game g = s.topGames.get(i);
            rv.setViewVisibility(COLS[i], View.VISIBLE);
            Bitmap src = WidgetBitmaps.decode(WidgetSnapshot.coverFile(ctx, i), cw, ch);
            Bitmap tile = WidgetBitmaps.roundedCover(src, cw, ch, px(14, scale));
            if (src != null) src.recycle();
            rv.setImageViewBitmap(COVERS[i], tile);
            rv.setContentDescription(COVERS[i], g.name);
            rv.setTextViewText(HOURS[i], g.hoursText);
        }
        return rv;
    }
}
