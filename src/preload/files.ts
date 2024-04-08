import { ipcRenderer } from "electron";
import * as path from "node:path";

export const openDirectory = () => {
  return ipcRenderer.invoke("dialog:openDirectory");
};

export const getFileList = (path: string) => {
  return ipcRenderer.invoke("getFileList", path);
};

export const getFileContent = (path: string) => {
  return ipcRenderer.invoke("getFileContent", path);
};

export const saveFileContent = (path: string, content: string) => {
  return ipcRenderer.invoke("saveFileContent", path, content);
};

export const pathJoin = (paths: string[]) => {
  const fullPath = path.join(...paths);

  return fullPath;
}