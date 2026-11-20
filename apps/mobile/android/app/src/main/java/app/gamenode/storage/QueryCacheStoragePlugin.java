package app.gamenode.storage;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * File storage for the persisted React Query cache (see asyncStorage.ts).
 *
 * The cache is megabytes of JSON read at launch. @capacitor/filesystem answers on the main thread, where
 * encoding a reply that size blocked the UI thread for ~350 ms, right while the entry splash animates.
 * Here every read, write and reply happens on one background thread (which also keeps writes in order).
 */
@CapacitorPlugin(name = "QueryCacheStorage")
public class QueryCacheStoragePlugin extends Plugin {

    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    @PluginMethod
    public void get(PluginCall call) {
        File file = fileFor(call);
        if (file == null) return;
        executor.execute(() -> {
            JSObject result = new JSObject();
            try {
                result.put("value", file.exists() ? new String(Files.readAllBytes(file.toPath()), StandardCharsets.UTF_8) : null);
                call.resolve(result);
            } catch (IOException e) {
                call.reject("Could not read " + file.getName(), e);
            }
        });
    }

    @PluginMethod
    public void set(PluginCall call) {
        File file = fileFor(call);
        if (file == null) return;
        String value = call.getString("value");
        if (value == null) {
            call.reject("Missing value");
            return;
        }
        executor.execute(() -> {
            // write next to it and rename, so a crash mid-write never leaves a truncated cache
            File tmp = new File(file.getParentFile(), file.getName() + ".tmp");
            try {
                File dir = file.getParentFile();
                if (dir != null && !dir.isDirectory() && !dir.mkdirs()) throw new IOException("Could not create " + dir);
                try (FileOutputStream out = new FileOutputStream(tmp)) {
                    out.write(value.getBytes(StandardCharsets.UTF_8));
                    out.getFD().sync();
                }
                if (!tmp.renameTo(file)) throw new IOException("Could not rename " + tmp.getName());
                call.resolve();
            } catch (IOException e) {
                tmp.delete();
                call.reject("Could not write " + file.getName(), e);
            }
        });
    }

    @PluginMethod
    public void remove(PluginCall call) {
        File file = fileFor(call);
        if (file == null) return;
        executor.execute(() -> {
            file.delete();
            call.resolve();
        });
    }

    @Override
    protected void handleOnDestroy() {
        executor.shutdown();
    }

    /** `name` is a plain file name inside the app's query-cache folder. Rejects the call otherwise. */
    private File fileFor(PluginCall call) {
        String name = call.getString("name");
        if (name == null || name.isEmpty() || name.contains("/") || name.startsWith(".")) {
            call.reject("Invalid name");
            return null;
        }
        return new File(new File(getContext().getFilesDir(), "query-cache"), name);
    }
}
