import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  versions: {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
  },
  app: {
    close: () => ipcRenderer.invoke("app:close"),
    minimize: () => ipcRenderer.invoke("app:minimize"),
    maximize: () => ipcRenderer.invoke("app:maximize"),
    unmaximize: () => ipcRenderer.invoke("app:unmaximize"),
    isMaximized: () => ipcRenderer.invoke("app:isMaximized"),
  },
  openDirectory: () => {
    return ipcRenderer.invoke("dialog:openDirectory");
  },
  getFileList: (path: string) => {
    return ipcRenderer.invoke("getFileList", path);
  },
  getFileContent: (path: string) => {
    return ipcRenderer.invoke("getFileContent", path);
  },
});
