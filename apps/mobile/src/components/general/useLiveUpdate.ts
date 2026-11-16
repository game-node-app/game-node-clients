import { App } from "@capacitor/app";
import { Capacitor, type PluginListenerHandle } from "@capacitor/core";
import { LiveUpdate } from "@capawesome/capacitor-live-update";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";

const manifestSchema = z.object({
  bundleId: z
    .string()
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/)
    .refine((id) => id !== "public"),
  url: z.url({ protocol: /^https$/ }),
  checksum: z.string().regex(/^[a-fA-F0-9]{64}$/),
});

export type LiveUpdateState =
  | { status: "idle" }
  | { status: "downloading"; progress: number | null }
  | { status: "ready" }
  | { status: "restarting" }
  | { status: "error"; phase: "download" | "restart" };

type LiveUpdateActions = {
  restart: () => void;
  retry: () => void;
  dismiss: () => void;
};

export const useLiveUpdate = () => {
  const [state, setState] = useState<LiveUpdateState>({ status: "idle" });
  const actions = useRef<LiveUpdateActions | null>(null);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let cancelled = false;
    let checking = false;
    let pendingBundle: string | null = null;
    let activeDownload: string | null = null;
    let currentState: LiveUpdateState = { status: "idle" };
    const handles: PluginListenerHandle[] = [];
    const emit = (next: LiveUpdateState) => {
      if (cancelled) return;
      currentState = next;
      setState(next);
    };
    const retain = async (promise: Promise<PluginListenerHandle>) => {
      const handle = await promise;
      if (cancelled) await handle.remove();
      else handles.push(handle);
    };

    const check = async () => {
      // A staged bundle remains available even after the reminder is dismissed.
      // Do not replace it or interrupt an explicit restart on a resume event.
      if (cancelled || checking || pendingBundle) return;
      checking = true;
      let updateAttempted = false;
      try {
        const current = await LiveUpdate.getCurrentBundle();
        if (cancelled) return;
        const next = await LiveUpdate.getNextBundle();
        if (cancelled) return;
        if (next.bundleId && next.bundleId !== current.bundleId) {
          pendingBundle = next.bundleId;
          emit({ status: "ready" });
          return;
        }

        const baseUrl = import.meta.env.VITE_PUBLIC_LIVE_UPDATE_URL;
        if (!baseUrl) return;
        const base = new URL(baseUrl);
        if (base.protocol !== "https:")
          throw new Error("Live update hosting must use HTTPS");
        const directory = `${baseUrl.replace(/\/$/, "")}/ota/${__NATIVE_FINGERPRINT__}/`;
        const response = await fetch(`${directory}latest.json`, {
          cache: "no-store",
          signal: AbortSignal.timeout(10000),
        });
        if (cancelled || response.status === 404) return;
        if (!response.ok)
          throw new Error(`Live update manifest: HTTP ${response.status}`);
        const manifest = manifestSchema.parse(await response.json());
        // Keep downloads inside this shell's compatibility directory.
        if (manifest.url !== `${directory}${manifest.bundleId}.zip`)
          throw new Error(
            "Live update bundle URL does not match the native fingerprint",
          );
        if (cancelled || manifest.bundleId === current.bundleId) return;

        updateAttempted = true;
        emit({ status: "downloading", progress: null });
        const downloaded = await LiveUpdate.getDownloadedBundles();
        if (cancelled) return;
        if (!downloaded.bundleIds.includes(manifest.bundleId)) {
          activeDownload = manifest.bundleId;
          await LiveUpdate.downloadBundle(manifest);
          activeDownload = null;
        }
        if (cancelled) return;
        await LiveUpdate.setNextBundle({ bundleId: manifest.bundleId });
        if (cancelled) return;
        pendingBundle = manifest.bundleId;
        emit({ status: "ready" });
      } catch (error) {
        console.error("Live update check failed", error);
        if (updateAttempted) emit({ status: "error", phase: "download" });
      } finally {
        activeDownload = null;
        checking = false;
      }
    };

    const restart = async () => {
      if (
        cancelled ||
        !pendingBundle ||
        checking ||
        currentState.status === "restarting"
      )
        return;
      emit({ status: "restarting" });
      try {
        await LiveUpdate.reload();
      } catch (error) {
        console.error("Live update restart failed", error);
        emit({ status: "error", phase: "restart" });
      }
    };

    actions.current = {
      restart: () => void restart(),
      retry: () => {
        if (currentState.status !== "error") return;
        if (currentState.phase === "restart") void restart();
        else {
          emit({ status: "idle" });
          void check();
        }
      },
      dismiss: () => {
        if (currentState.status === "ready" || currentState.status === "error")
          emit({ status: "idle" });
      },
    };

    void (async () => {
      try {
        await LiveUpdate.ready();
        if (cancelled) return;
        // Register before downloadBundle so even its first event is observed.
        await retain(
          LiveUpdate.addListener("downloadBundleProgress", (event) => {
            if (
              event.bundleId !== activeDownload ||
              currentState.status !== "downloading" ||
              !Number.isFinite(event.progress) ||
              event.totalBytes <= 0
            )
              return;
            const progress = Math.max(0, Math.min(100, event.progress * 100));
            emit({ status: "downloading", progress });
          }),
        );
        if (cancelled) return;
        await retain(
          App.addListener("resume", () => {
            void check();
          }),
        );
        if (!cancelled) void check();
      } catch (error) {
        console.error("Live update initialization failed", error);
      }
    })();

    return () => {
      cancelled = true;
      actions.current = null;
      for (const handle of handles) void handle.remove().catch(console.error);
    };
  }, []);

  return {
    state,
    restart: () => actions.current?.restart(),
    retry: () => actions.current?.retry(),
    dismiss: () => actions.current?.dismiss(),
  };
};
