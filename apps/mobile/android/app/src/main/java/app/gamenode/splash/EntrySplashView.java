package app.gamenode.splash;

import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.animation.ValueAnimator;
import android.app.Activity;
import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Matrix;
import android.graphics.Paint;
import android.graphics.Path;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.view.View;
import android.view.ViewGroup;
import android.view.animation.PathInterpolator;
import android.widget.FrameLayout;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.graphics.PathParser;
import java.util.ArrayList;
import java.util.List;

/**
 * Entry animation, drawn natively over the whole window (WebView included) from the activity's first frame:
 * it continues the launch splash (same logo, size and position), so there is no blank screen while the
 * WebView boots. The logo pulses on #1A1A1A, brand orange grows out of it and fills the screen while the
 * app loads, and once the web app has painted ({@link #reveal()}, from the EntrySplash plugin) the logo
 * zooms into its hole, which is transparent, so the app shows through it from the inside out.
 *
 * It is native, not part of the web app, because the web app can only draw once its first (long) frame is
 * done: a web splash left the screen blank for about a second and its animation dropped frames while the
 * app booted. This view animates on the app's UI thread, which is idle while the WebView loads.
 *
 * Geometry matches ic_splash_logo.xml: the logo is drawn in a 1000x1000 space at 0.2dp per unit, with the
 * centre of its hole on the centre of the screen.
 */
public final class EntrySplashView extends View {

    private static final int BG_COLOR = Color.parseColor("#1A1A1A");
    private static final int BRAND_COLOR = Color.parseColor("#F15025");

    private static final String LOGO_OUTER_PATH =
        "M159 210V681.146L270.871 789.169L842 790V318.023L730.129 210H159ZM670.409 619.656H340.685L330.591 609.685V379.513H660.315L670.409 388.653V619.656Z";
    private static final String LOGO_INNER_PATH =
        "M212 256V653.225L306.509 744.299L789 745V347.075L694.491 256H212ZM644.039 601.383H365.488L356.961 592.976V398.917H635.512L644.039 406.623V601.383Z";
    private static final String HOLE_PATH = "M644.039 601.383H365.488L356.961 592.976V398.917H635.512L644.039 406.623V601.383Z";
    private static final float HOLE_CX = 500.5f;
    private static final float HOLE_CY = 500.15f;
    private static final float HOLE_W = 287.078f;
    private static final float HOLE_H = 202.466f;
    private static final float DP_PER_UNIT = 0.2f;

    /** The launch splash's logo stays still this long before the fill starts. */
    private static final long LOGO_HOLD_MS = 150;
    private static final long FILL_MS = 400;
    private static final long ZOOM_MS = 500;
    private static final long PLUG_MS = 120;
    private static final long FADE_MS = 150;
    private static final long PULSE_HALF_MS = 550;
    private static final float PULSE_SCALE = 1.08f;
    /** Reveals the app anyway if the web app never reports that it is ready. */
    private static final long MAX_WAIT_MS = 8000;

    private final Path logoOuter = PathParser.createPathFromPathData(LOGO_OUTER_PATH);
    private final Path logoInner = PathParser.createPathFromPathData(LOGO_INNER_PATH);
    private final Path hole = PathParser.createPathFromPathData(HOLE_PATH);
    private final Path scratch = new Path();
    private final Path frame = new Path();
    private final Path screen = new Path();
    private final Matrix matrix = new Matrix();
    private final Paint brandPaint = paint(BRAND_COLOR);
    private final Paint whitePaint = paint(Color.WHITE);
    private final Paint bgPaint = paint(BG_COLOR);
    /** Nearly invisible: draws the zoom's shapes while waiting, see {@link #onDraw}. */
    private final Paint warmPaint = paint(BRAND_COLOR);
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final boolean animated;

    /** Logo scale (pulse), fill circle progress (0-1), zoom scale, opacity of the plug over the hole. */
    private float pulse = 1f;
    private float fill = 0f;
    private float zoom = 1f;
    private float plug = 1f;
    private boolean zooming = false;
    private boolean fillDone = false;
    private boolean ready = false;
    private boolean finished = false;
    @Nullable
    private ValueAnimator pulseAnimator;
    /** Run once the splash is gone (see {@link #revealCurrent}). */
    private final List<Runnable> onDone = new ArrayList<>();

    @Nullable
    private static EntrySplashView current;

    private EntrySplashView(@NonNull Context context) {
        super(context);
        warmPaint.setAlpha(1);
        // with animations turned off in the system settings, the splash only fades out
        animated = Settings.Global.getFloat(context.getContentResolver(), Settings.Global.ANIMATOR_DURATION_SCALE, 1f) > 0f;
    }

    /** Covers the activity's window with the splash. Call right after the content view is set. */
    public static void attach(@NonNull Activity activity) {
        if (current != null) current.remove();
        EntrySplashView view = new EntrySplashView(activity);
        ((ViewGroup) activity.getWindow().getDecorView()).addView(
                view,
                new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
            );
        current = view;
        view.start();
    }

    /**
     * The web app has painted its first frame: open the splash onto it. `done` runs once the splash is
     * gone (right away if there is none), so the web app can hold heavy work until the animation ends.
     */
    public static void revealCurrent(@NonNull Runnable done) {
        if (current == null) {
            done.run();
            return;
        }
        current.onDone.add(done);
        current.reveal();
    }

    private void start() {
        if (animated) {
            pulseAnimator = ValueAnimator.ofFloat(1f, PULSE_SCALE);
            pulseAnimator.setDuration(PULSE_HALF_MS);
            pulseAnimator.setInterpolator(new PathInterpolator(0.42f, 0f, 0.58f, 1f));
            pulseAnimator.setRepeatCount(ValueAnimator.INFINITE);
            pulseAnimator.setRepeatMode(ValueAnimator.REVERSE);
            pulseAnimator.addUpdateListener((a) -> {
                pulse = (float) a.getAnimatedValue();
                invalidate();
            });
            pulseAnimator.start();
            handler.postDelayed(this::startFill, LOGO_HOLD_MS);
        }
        handler.postDelayed(this::reveal, MAX_WAIT_MS);
    }

    private void startFill() {
        ValueAnimator animator = ValueAnimator.ofFloat(0f, 1f);
        animator.setDuration(FILL_MS);
        animator.setInterpolator(new PathInterpolator(0.42f, 0f, 0.58f, 1f));
        animator.addUpdateListener((a) -> {
            fill = (float) a.getAnimatedValue();
            invalidate();
        });
        animator.addListener(
            new AnimatorListenerAdapter() {
                @Override
                public void onAnimationEnd(Animator animation) {
                    fillDone = true;
                    maybeZoom();
                }
            }
        );
        animator.start();
    }

    private void reveal() {
        if (ready || finished) return;
        ready = true;
        handler.removeCallbacksAndMessages(null);
        if (!animated) {
            fadeOut();
            return;
        }
        maybeZoom();
    }

    private void maybeZoom() {
        if (!ready || !fillDone || zooming) return;
        zooming = true;
        if (pulseAnimator != null) pulseAnimator.cancel();

        float unit = unitPx();
        float target = Math.max(getWidth() / (HOLE_W * unit), getHeight() / (HOLE_H * unit)) * 1.15f;
        float from = pulse;

        ValueAnimator animator = ValueAnimator.ofFloat(0f, 1f);
        animator.setDuration(ZOOM_MS);
        animator.setInterpolator(new PathInterpolator(0.7f, 0f, 0.84f, 0f));
        animator.addUpdateListener((a) -> {
            float t = (float) a.getAnimatedValue();
            zoom = from + (target - from) * t;
            // the app behind the hole fades in at the start of the zoom
            plug = Math.max(0f, 1f - a.getCurrentPlayTime() / (float) PLUG_MS);
            invalidate();
        });
        animator.addListener(
            new AnimatorListenerAdapter() {
                @Override
                public void onAnimationEnd(Animator animation) {
                    remove();
                }
            }
        );
        animator.start();
    }

    private void fadeOut() {
        animate().alpha(0f).setDuration(FADE_MS).withLayer().withEndAction(this::remove).start();
    }

    private void remove() {
        if (finished) return;
        finished = true;
        handler.removeCallbacksAndMessages(null);
        if (pulseAnimator != null) pulseAnimator.cancel();
        if (getParent() instanceof ViewGroup) ((ViewGroup) getParent()).removeView(this);
        if (current == this) current = null;
        runDone();
    }

    private void runDone() {
        List<Runnable> callbacks = new ArrayList<>(onDone);
        onDone.clear();
        for (Runnable callback : callbacks) callback.run();
    }

    @Override
    protected void onDetachedFromWindow() {
        super.onDetachedFromWindow();
        // the activity is gone (or the splash ended): don't keep it alive through the static field
        finished = true;
        handler.removeCallbacksAndMessages(null);
        if (pulseAnimator != null) pulseAnimator.cancel();
        if (current == this) current = null;
        runDone();
    }

    private float unitPx() {
        return DP_PER_UNIT * getResources().getDisplayMetrics().density;
    }

    /** Maps the logo's 1000x1000 space onto the screen, hole centre on the screen centre, at `scale`. */
    private void setLogoMatrix(float scale) {
        float unit = unitPx() * scale;
        matrix.setTranslate(-HOLE_CX, -HOLE_CY);
        matrix.postScale(unit, unit);
        matrix.postTranslate(getWidth() / 2f, getHeight() / 2f);
    }

    private void drawTransformed(@NonNull Canvas canvas, @NonNull Path path, @NonNull Paint paint) {
        path.transform(matrix, scratch);
        canvas.drawPath(scratch, paint);
    }

    @Override
    protected void onDraw(@NonNull Canvas canvas) {
        float w = getWidth();
        float h = getHeight();

        if (!zooming) {
            canvas.drawColor(BG_COLOR);
            if (fill > 0f) {
                float radius = (float) Math.hypot(w, h) / 2f + 2f;
                canvas.drawCircle(w / 2f, h / 2f, radius * fill, brandPaint);
            }
            setLogoMatrix(pulse);
            drawTransformed(canvas, logoOuter, brandPaint);
            drawTransformed(canvas, logoInner, whitePaint);
            // The zoom's shapes (the frame around the hole, the fading plug) are drawn every frame
            // while waiting, nearly invisible: the GPU prepares them now instead of freezing the
            // first frames of the zoom (about 350 ms each on a Galaxy A34).
            drawFrame(canvas, w, h, warmPaint);
            bgPaint.setAlpha(254);
            drawTransformed(canvas, hole, bgPaint);
            bgPaint.setAlpha(255);
            return;
        }

        // Zoom: orange everywhere except the hole, which shows the app, and the white ring around it.
        setLogoMatrix(zoom);
        drawFrame(canvas, w, h, brandPaint);
        drawClipped(canvas, logoInner, whitePaint);
        if (plug > 0f) {
            bgPaint.setAlpha(Math.round(plug * 255));
            drawTransformed(canvas, hole, bgPaint);
            bgPaint.setAlpha(255);
        }
    }

    /**
     * The screen minus the logo's hole, at the current logo matrix. Built with Path.op so it never reaches
     * past the screen: near the end of the zoom the logo is ~40x the screen, and rasterising paths that
     * large froze the zoom for half a second (on a white screen, from the ring).
     */
    private void drawFrame(@NonNull Canvas canvas, float w, float h, @NonNull Paint paint) {
        setScreen(w, h);
        hole.transform(matrix, scratch);
        frame.op(screen, scratch, Path.Op.DIFFERENCE);
        canvas.drawPath(frame, paint);
    }

    /** Draws `path` at the current logo matrix, cut to the screen (see {@link #drawFrame}). */
    private void drawClipped(@NonNull Canvas canvas, @NonNull Path path, @NonNull Paint paint) {
        setScreen(getWidth(), getHeight());
        path.transform(matrix, scratch);
        if (scratch.op(screen, Path.Op.INTERSECT)) canvas.drawPath(scratch, paint);
    }

    private void setScreen(float w, float h) {
        screen.rewind();
        screen.addRect(0f, 0f, w, h, Path.Direction.CW);
    }

    private static Paint paint(int color) {
        Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        paint.setColor(color);
        paint.setStyle(Paint.Style.FILL);
        return paint;
    }
}
