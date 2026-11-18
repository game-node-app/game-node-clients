package app.gamenode.widget;

import android.content.Context;
import android.graphics.Bitmap;
import android.widget.RemoteViews;

import app.gamenode.R;

public class TopGameWidgetProvider extends BaseWidgetProvider {
    private static final int[] SCRIM = {0x59000000, 0x1A000000, 0xEB000000};
    private static final float[] SCRIM_POS = {0f, 0.45f, 1f};

    @Override
    protected int designWidth() {
        return 160;
    }

    @Override
    protected int designHeight() {
        return 160;
    }

    @Override
    protected RemoteViews build(Context ctx, WidgetSnapshot s, int wDp, int hDp, float scale) {
        RemoteViews rv = new RemoteViews(ctx.getPackageName(), R.layout.wrapped_widget_top_game);
        WidgetSnapshot.Game game = s.topGames.get(0);
        int w = px(wDp, scale), h = px(hDp, scale);
        Bitmap cover = WidgetBitmaps.decode(WidgetSnapshot.coverFile(ctx, 0), w, h);
        Bitmap bg = WidgetBitmaps.background(w, h, px(RADIUS_DP, scale), cover, SCRIM, SCRIM_POS,
                0.9f, 0.95f, 105f * scale, cover == null ? 0.5f : 0f);
        if (cover != null) cover.recycle();
        rv.setImageViewBitmap(R.id.bg, bg);
        rv.setContentDescription(R.id.bg, game.name);
        rv.setTextViewText(R.id.badge, s.str("topGameBadge", ""));
        rv.setTextViewText(R.id.game_name, game.name);
        rv.setTextViewText(R.id.game_detail, game.detail);
        return rv;
    }
}
