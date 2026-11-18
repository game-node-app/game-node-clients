package app.gamenode.widget;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.LinearGradient;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.RadialGradient;
import android.graphics.RectF;
import android.graphics.Shader;

import java.io.File;

/** Bitmap helpers: RemoteViews cannot clip ImageViews, so shapes are baked into bitmaps. */
public final class WidgetBitmaps {
    public static final int BG = 0xFF111111;
    public static final int ORANGE = 0xFFF15025;

    private WidgetBitmaps() {}

    /** Pixel scale: device density capped to keep RemoteViews bitmaps small (binder limit). */
    public static float scale(Context ctx) {
        return Math.min(ctx.getResources().getDisplayMetrics().density, 2f);
    }

    /** Decodes a file downsampled so it is not much bigger than reqW x reqH. Null on failure. */
    public static Bitmap decode(File f, int reqW, int reqH) {
        try {
            if (f == null || !f.exists()) return null;
            BitmapFactory.Options o = new BitmapFactory.Options();
            o.inJustDecodeBounds = true;
            BitmapFactory.decodeFile(f.getAbsolutePath(), o);
            if (o.outWidth <= 0 || o.outHeight <= 0) return null;
            int sample = 1;
            while (o.outWidth / (sample * 2) >= reqW * 2 && o.outHeight / (sample * 2) >= reqH * 2) {
                sample *= 2;
            }
            BitmapFactory.Options d = new BitmapFactory.Options();
            d.inSampleSize = sample;
            d.inPreferredConfig = Bitmap.Config.ARGB_8888;
            return BitmapFactory.decodeFile(f.getAbsolutePath(), d);
        } catch (Throwable t) {
            return null;
        }
    }

    private static void drawCenterCrop(Canvas c, Bitmap src, float w, float h) {
        float s = Math.max(w / src.getWidth(), h / src.getHeight());
        float dw = src.getWidth() * s, dh = src.getHeight() * s;
        RectF dst = new RectF((w - dw) / 2f, (h - dh) / 2f, (w + dw) / 2f, (h + dh) / 2f);
        Paint p = new Paint(Paint.ANTI_ALIAS_FLAG | Paint.FILTER_BITMAP_FLAG);
        c.drawBitmap(src, null, dst, p);
    }

    public static void drawGlow(Canvas c, float cx, float cy, float radius, float alpha) {
        int a = Math.round(255f * alpha);
        int col = Color.argb(a, 0xF1, 0x50, 0x25);
        int transparent = Color.argb(0, 0xF1, 0x50, 0x25);
        Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
        p.setShader(new RadialGradient(cx, cy, radius, new int[]{col, transparent}, null, Shader.TileMode.CLAMP));
        c.drawCircle(cx, cy, radius, p);
    }

    /**
     * Full-widget background: rounded #111 (+ optional center-cropped cover and vertical scrim)
     * and an optional orange radial glow. Glow center is given as fractions of w/h; alpha 0 = none.
     */
    public static Bitmap background(int w, int h, float radius, Bitmap cover,
                                    int[] scrimColors, float[] scrimPos,
                                    float glowCx, float glowCy, float glowRadius, float glowAlpha) {
        Bitmap out = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888);
        Canvas c = new Canvas(out);
        Path clip = new Path();
        clip.addRoundRect(new RectF(0, 0, w, h), radius, radius, Path.Direction.CW);
        c.clipPath(clip);
        c.drawColor(BG);
        if (cover != null) {
            drawCenterCrop(c, cover, w, h);
            if (scrimColors != null) {
                Paint p = new Paint();
                p.setShader(new LinearGradient(0, 0, 0, h, scrimColors, scrimPos, Shader.TileMode.CLAMP));
                c.drawRect(0, 0, w, h, p);
            }
        }
        if (glowAlpha > 0f) {
            drawGlow(c, w * glowCx, h * glowCy, glowRadius, glowAlpha);
        }
        return out;
    }

    /** Rounded #111 background with a single radial glow of any RGB color (centre as fractions of w/h). */
    public static Bitmap glowBackground(int w, int h, float radius, int rgb,
                                        float cxFrac, float cyFrac, float glowRadius, float alpha) {
        Bitmap out = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888);
        Canvas c = new Canvas(out);
        Path clip = new Path();
        clip.addRoundRect(new RectF(0, 0, w, h), radius, radius, Path.Direction.CW);
        c.clipPath(clip);
        c.drawColor(BG);
        int col = Color.argb(Math.round(255f * alpha), Color.red(rgb), Color.green(rgb), Color.blue(rgb));
        int transparent = Color.argb(0, Color.red(rgb), Color.green(rgb), Color.blue(rgb));
        Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
        float cx = w * cxFrac, cy = h * cyFrac;
        p.setShader(new RadialGradient(cx, cy, glowRadius, new int[]{col, transparent}, null, Shader.TileMode.CLAMP));
        c.drawCircle(cx, cy, glowRadius, p);
        return out;
    }

    /** Rounded center-cropped cover tile; src null draws a dark placeholder. */
    public static Bitmap roundedCover(Bitmap src, int w, int h, float radius) {
        Bitmap out = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888);
        Canvas c = new Canvas(out);
        Path clip = new Path();
        clip.addRoundRect(new RectF(0, 0, w, h), radius, radius, Path.Direction.CW);
        c.clipPath(clip);
        c.drawColor(0xFF222222);
        if (src != null) drawCenterCrop(c, src, w, h);
        return out;
    }

    /** Circular avatar with orange ring; falls back to dark circle with the username initial. */
    public static Bitmap avatar(Bitmap src, String username, int size, float ring) {
        Bitmap out = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888);
        Canvas c = new Canvas(out);
        Paint ringPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        ringPaint.setColor(ORANGE);
        float r = size / 2f;
        c.drawCircle(r, r, r, ringPaint);
        float inner = r - ring;
        Path clip = new Path();
        clip.addCircle(r, r, inner, Path.Direction.CW);
        c.save();
        c.clipPath(clip);
        c.drawColor(0xFF1E1E1E);
        if (src != null) {
            c.translate(ring, ring);
            drawCenterCrop(c, src, inner * 2, inner * 2);
        }
        c.restore();
        if (src == null && username != null && !username.isEmpty()) {
            Paint t = new Paint(Paint.ANTI_ALIAS_FLAG);
            t.setColor(ORANGE);
            t.setFakeBoldText(true);
            t.setTextSize(size * 0.45f);
            t.setTextAlign(Paint.Align.CENTER);
            String initial = username.substring(0, username.offsetByCodePoints(0, 1)).toUpperCase();
            float y = r - (t.descent() + t.ascent()) / 2f;
            c.drawText(initial, r, y, t);
        }
        return out;
    }
}
