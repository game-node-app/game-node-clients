package app.gamenode.widget;

import android.content.Context;
import android.view.View;
import android.widget.RemoteViews;

import app.gamenode.R;

/** Gamer personality widget (2x2), fed by the Wrapped snapshot. */
public class PersonalityWidgetProvider extends BaseWidgetProvider {
    @Override
    protected int designWidth() {
        return 160;
    }

    @Override
    protected int designHeight() {
        return 160;
    }

    private static boolean hasContent(WidgetSnapshot s) {
        return s != null && s.personality != null;
    }

    @Override
    protected RemoteViews render(Context ctx, int wDp, int hDp, float scale) {
        WidgetSnapshot s = WidgetSnapshot.load(ctx);
        if (hasContent(s)) return build(ctx, s, wDp, hDp, scale);
        return buildEmpty(ctx, s, wDp, hDp, scale);
    }

    @Override
    RemoteViews buildPreview(Context context) {
        try {
            WidgetSnapshot s = WidgetSnapshot.load(context);
            if (!hasContent(s)) return null;
            return build(context, s, designWidth(), designHeight(), WidgetBitmaps.scale(context));
        } catch (Throwable t) {
            return null;
        }
    }

    @Override
    protected RemoteViews build(Context ctx, WidgetSnapshot s, int wDp, int hDp, float scale) {
        RemoteViews rv = new RemoteViews(ctx.getPackageName(), R.layout.wrapped_widget_personality);
        rv.setImageViewBitmap(R.id.bg, WidgetBitmaps.glowBackground(px(wDp, scale), px(hDp, scale),
                px(RADIUS_DP, scale), 0xF15025, 0.9f, 0.95f, 110f * scale, 0.4f));
        WidgetSnapshot.Personality p = s.personality;
        rv.setTextViewText(R.id.eyebrow, s.str("personalityEyebrow", ""));
        rv.setTextViewText(R.id.personality_title, p.title);
        int len = p.title.length();
        rv.setTextViewTextSize(R.id.personality_title, android.util.TypedValue.COMPLEX_UNIT_SP,
                len > 10 ? Math.max(14f, 24f * 10f / len) : 24f);
        rv.setTextViewText(R.id.personality_subtitle, p.subtitle);
        rv.setViewVisibility(R.id.personality_subtitle, p.subtitle.isEmpty() ? View.GONE : View.VISIBLE);
        if (p.chip != null) {
            rv.setTextViewText(R.id.personality_chip, p.chip);
            rv.setViewVisibility(R.id.personality_chip, View.VISIBLE);
        } else {
            rv.setViewVisibility(R.id.personality_chip, View.GONE);
        }
        return rv;
    }
}
