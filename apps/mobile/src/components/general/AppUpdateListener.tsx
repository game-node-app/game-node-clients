import React, { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { AppUpdate, AppUpdateAvailability } from "@capawesome/capacitor-app-update";
import { compareVersions } from "compare-versions";

const getCurrentAppVersion = async () => {
    const result = await AppUpdate.getAppUpdateInfo();
    if (Capacitor.getPlatform() === "android") {
        return result.currentVersionCode;
    } else {
        return result.currentVersionName;
    }
};

const getAvailableAppVersion = async () => {
    const result = await AppUpdate.getAppUpdateInfo();
    if (Capacitor.getPlatform() === "android") {
        return result.availableVersionCode;
    } else {
        return result.availableVersionName;
    }
};

const openAppStore = async () => {
    await AppUpdate.openAppStore();
};

const performImmediateUpdate = async () => {
    const result = await AppUpdate.getAppUpdateInfo();
    if (result.updateAvailability !== AppUpdateAvailability.UPDATE_AVAILABLE) {
        return;
    }
    if (result.immediateUpdateAllowed) {
        await AppUpdate.performImmediateUpdate();
    }
};

const AppUpdateListener = () => {
    useEffect(() => {
        if (!Capacitor.isNativePlatform()) {
            return;
        }

        (async () => {
            const [currentVersion, availableVersion] = await Promise.all([
                getCurrentAppVersion(),
                getAvailableAppVersion(),
            ]);

            if (!availableVersion) {
                console.log("No new app version info available, aborting update...");
                return;
            }

            if (compareVersions(currentVersion, availableVersion) === -1) {
                await performImmediateUpdate();
            }
        })();
    }, []);

    return null;
};

export default AppUpdateListener;
