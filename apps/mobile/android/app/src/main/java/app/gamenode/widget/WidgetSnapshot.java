package app.gamenode.widget;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/** Parsed Wrapped snapshot (already formatted/translated by the JS side). */
public final class WidgetSnapshot {
    public static final String PREFS = "wrapped_widget";
    public static final String KEY = "snapshot";
    public static final String IMAGES_DIR = "wrapped_widget";

    public static final class Game {
        public String name = "";
        public String hoursText = "";
        public String detail = "";
        public String coverUrl;
    }

    public static final class Personality {
        public String title = "";
        public String subtitle = "";
        public String chip;
    }

    public Personality personality;
    public String username = "";
    public String avatarUrl;
    public final JSONObject strings = new JSONObject();
    public final List<String> chips = new ArrayList<>();
    public final List<Game> topGames = new ArrayList<>();

    private static String nullable(JSONObject o, String key) {
        if (o == null || o.isNull(key)) return null;
        String v = o.optString(key, "");
        return (v.isEmpty() || "null".equals(v)) ? null : v;
    }

    public static WidgetSnapshot parse(String json) throws Exception {
        JSONObject root = new JSONObject(json);
        WidgetSnapshot s = new WidgetSnapshot();
        s.username = root.optString("username", "");
        s.avatarUrl = nullable(root, "avatarUrl");
        JSONObject st = root.optJSONObject("strings");
        if (st != null) {
            for (Iterator<String> it = st.keys(); it.hasNext(); ) {
                String k = it.next();
                if (!st.isNull(k)) s.strings.put(k, st.optString(k, ""));
            }
        }
        JSONObject pj = root.optJSONObject("personality");
        if (pj != null) {
            Personality pe = new Personality();
            pe.title = pj.optString("title", "");
            pe.subtitle = nullable(pj, "subtitle") == null ? "" : pj.optString("subtitle", "");
            pe.chip = nullable(pj, "chip");
            if (!pe.title.isEmpty()) s.personality = pe;
        }
        JSONArray chips = root.optJSONArray("chips");
        if (chips != null) {
            for (int i = 0; i < chips.length() && s.chips.size() < 3; i++) {
                String c = chips.optString(i, "");
                if (!c.isEmpty()) s.chips.add(c);
            }
        }
        JSONArray games = root.optJSONArray("topGames");
        if (games != null) {
            for (int i = 0; i < games.length() && s.topGames.size() < 3; i++) {
                JSONObject g = games.optJSONObject(i);
                if (g == null) continue;
                Game game = new Game();
                game.name = g.optString("name", "");
                game.hoursText = g.optString("hoursText", "");
                game.detail = g.optString("detail", "");
                game.coverUrl = nullable(g, "coverUrl");
                s.topGames.add(game);
            }
        }
        return s;
    }

    /** Returns the stored snapshot or null if missing/invalid. */
    public static WidgetSnapshot load(Context ctx) {
        try {
            SharedPreferences p = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
            String json = p.getString(KEY, null);
            if (json == null) return null;
            return parse(json);
        } catch (Throwable t) {
            return null;
        }
    }

    public boolean isEmpty() {
        return topGames.isEmpty();
    }

    public String str(String key, String fallback) {
        String v = strings.optString(key, "");
        return v.isEmpty() ? fallback : v;
    }

    /** Nullable string (e.g. changeChip); null when absent or blank. */
    public String strOrNull(String key) {
        String v = strings.optString(key, "");
        return v.isEmpty() ? null : v;
    }

    public static File imagesDir(Context ctx) {
        return new File(ctx.getFilesDir(), IMAGES_DIR);
    }

    public static File coverFile(Context ctx, int i) {
        return new File(imagesDir(ctx), "cover_" + i + ".jpg");
    }

    public static File avatarFile(Context ctx) {
        return new File(imagesDir(ctx), "avatar.jpg");
    }
}
