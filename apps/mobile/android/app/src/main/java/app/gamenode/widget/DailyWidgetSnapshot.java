package app.gamenode.widget;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/** Parsed GameNode Daily snapshot (already formatted/translated by the JS side). */
public final class DailyWidgetSnapshot {
    public static final String KEY = "daily_snapshot";

    public boolean played;
    public long nextResetAt;
    public final List<String> puzzles = new ArrayList<>();
    public final JSONObject strings = new JSONObject();

    public static DailyWidgetSnapshot parse(String json) throws Exception {
        JSONObject root = new JSONObject(json);
        DailyWidgetSnapshot s = new DailyWidgetSnapshot();
        s.played = "played".equals(root.optString("state", "pending"));
        s.nextResetAt = root.optLong("nextResetAt", 0L);
        JSONArray arr = root.optJSONArray("puzzles");
        if (arr != null) {
            for (int i = 0; i < arr.length() && s.puzzles.size() < 4; i++) {
                JSONObject o = arr.optJSONObject(i);
                s.puzzles.add(o != null ? o.optString("status", "none") : "none");
            }
        }
        JSONObject st = root.optJSONObject("strings");
        if (st != null) {
            for (Iterator<String> it = st.keys(); it.hasNext(); ) {
                String k = it.next();
                if (!st.isNull(k)) s.strings.put(k, st.optString(k, ""));
            }
        }
        return s;
    }

    /** Returns the stored snapshot or null if missing/invalid. */
    public static DailyWidgetSnapshot load(Context ctx) {
        try {
            SharedPreferences p = ctx.getSharedPreferences(WidgetSnapshot.PREFS, Context.MODE_PRIVATE);
            String json = p.getString(KEY, null);
            if (json == null) return null;
            return parse(json);
        } catch (Throwable t) {
            return null;
        }
    }

    /** Invalid when there is no title to show. */
    public boolean isEmpty() {
        return strOrNull("title") == null;
    }

    public String str(String key, String fallback) {
        String v = strings.optString(key, "");
        return v.isEmpty() ? fallback : v;
    }

    public String strOrNull(String key) {
        String v = strings.optString(key, "");
        return v.isEmpty() ? null : v;
    }
}
