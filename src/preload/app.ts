import { ipcRenderer } from "electron";

export const close = () => ipcRenderer.invoke("app:close");
export const minimize = () => ipcRenderer.invoke("app:minimize");
export const maximize = () => ipcRenderer.invoke("app:maximize");
export const unMaximize = () => ipcRenderer.invoke("app:unMaximize");
export const isMaximized = () => ipcRenderer.invoke("app:isMaximized");
