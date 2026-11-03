import { contextBridge, ipcRenderer, type IpcRendererEvent } from "electron";
import type {
  GameNodeBridge,
  MenuAction,
  SessionChange,
} from "../shared/bridge";

const bridge: GameNodeBridge = {
  signIn: (provider) => ipcRenderer.invoke("auth:sign-in", provider),
  getToken: () => ipcRenderer.invoke("auth:token"),
  signOut: () => ipcRenderer.invoke("auth:sign-out"),
  openExternal: (url) => ipcRenderer.invoke("external:open", url),
  showAppMenu: (x, y) => ipcRenderer.invoke("app:menu", x, y),
  showGameContextMenu: (ids) => ipcRenderer.invoke("library:context-menu", ids),
  onSessionChanged(callback) {
    const listener = (_event: IpcRendererEvent, session: SessionChange) =>
      callback(session);
    ipcRenderer.on("auth:changed", listener);
    return () => ipcRenderer.removeListener("auth:changed", listener);
  },
  onMenuAction(callback) {
    const listener = (
      _event: IpcRendererEvent,
      action: MenuAction,
      ids?: string[],
    ) => callback(action, ids);
    ipcRenderer.on("library:action", listener);
    return () => ipcRenderer.removeListener("library:action", listener);
  },
};
contextBridge.exposeInMainWorld("gamenode", bridge);
