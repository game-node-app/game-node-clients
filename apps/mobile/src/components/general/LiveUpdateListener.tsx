import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { LiveUpdate } from "@capawesome/capacitor-live-update";
import { useEffect } from "react";
import { z } from "zod";

const manifestSchema = z.object({
  bundleId: z
    .string()
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/)
    .refine((id) => id !== "public"),
  url: z.url({ protocol: /^https$/ }),
  checksum: z.string().regex(/^[a-fA-F0-9]{64}$/),
});

const LiveUpdateListener = () => {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let checking = false;
    let cancelled = false;
    const check = async () => {
      const baseUrl = import.meta.env.VITE_PUBLIC_LIVE_UPDATE_URL;
      if (!baseUrl || checking || cancelled) return;
      checking = true;
      try {
        const base = new URL(baseUrl);
        if (base.protocol !== "https:")
          throw new Error("Live update hosting must use HTTPS");
        const directory = `${baseUrl.replace(
          /\/$/,
          "",
        )}/ota/${__NATIVE_FINGERPRINT__}/`;
        const response = await fetch(`${directory}latest.json`, {
          cache: "no-store",
          signal: AbortSignal.timeout(10000),
        });
        if (response.status === 404) return;
        if (!response.ok)
          throw new Error(`Live update manifest: HTTP ${response.status}`);
        const manifest = manifestSchema.parse(await response.json());
        // Keep downloads inside this shell's compatibility directory.
        if (manifest.url !== `${directory}${manifest.bundleId}.zip`) {
          throw new Error(
            "Live update bundle URL does not match the native fingerprint",
          );
        }
        const current = await LiveUpdate.getCurrentBundle();
        const next = await LiveUpdate.getNextBundle();
        if (
          cancelled ||
          manifest.bundleId === current.bundleId ||
          manifest.bundleId === next.bundleId
        )
          return;
        const downloaded = await LiveUpdate.getDownloadedBundles();
        if (!downloaded.bundleIds.includes(manifest.bundleId)) {
          // Android v7.5.2 verifies hex checksums despite the TypeScript docs saying base64.
          await LiveUpdate.downloadBundle(manifest);
        }
        if (!cancelled)
          await LiveUpdate.setNextBundle({ bundleId: manifest.bundleId });
      } catch (error) {
        console.error("Live update check failed", error);
      } finally {
        checking = false;
      }
    };

    const listener = (async () => {
      try {
        await LiveUpdate.ready();
        if (cancelled) return;
        const handle = await App.addListener("resume", () => {
          void check();
        });
        void check();
        return handle;
      } catch (error) {
        console.error("Live update initialization failed", error);
      }
    })();

    return () => {
      cancelled = true;
      void listener.then((handle) => handle?.remove()).catch(console.error);
    };
  }, []);

  return null;
};

export default LiveUpdateListener;
