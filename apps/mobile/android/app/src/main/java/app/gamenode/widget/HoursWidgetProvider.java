package app.gamenode.widget;

import android.content.Context;
import android.view.View;
import android.widget.RemoteViews;

import app.gamenode.R;

public class HoursWidgetProvider extends BaseWidgetProvider {
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
        RemoteViews rv = new RemoteViews(ctx.getPackageName(), R.layout.wrapped_widget_hours);
        rv.setImageViewBitmap(R.id.bg, WidgetBitmaps.background(px(wDp, scale), px(hDp, scale),
                px(RADIUS_DP, scale), null, null, null, 0.9f, 0.95f, 105f * scale, 0.5f));
        String hours = s.str("hoursValue", "0");
        rv.setTextViewText(R.id.eyebrow, s.str("eyebrow", ""));
        rv.setTextViewText(R.id.hours_value, hours);
        setValueSize(rv, R.id.hours_value, hours, 46f);
        rv.setTextViewText(R.id.hours_caption, s.str("hoursCaption", ""));
        String chip = s.strOrNull("changeChip");
        if (chip != null) {
            rv.setTextViewText(R.id.change_chip, chip);
            rv.setViewVisibility(R.id.change_chip, View.VISIBLE);
        } else {
            rv.setViewVisibility(R.id.change_chip, View.GONE);
        }
        return rv;
    }
}
