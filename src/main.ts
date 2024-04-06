import { app, BrowserWindow, ipcMain, dialog } from "electron";
import * as path from "node:path";
import * as fs from "node:fs";

async function handleOpenDirectory() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  if (!canceled) {
    return filePaths[0];
  }
}

const getFileList = async (path: string): Promise<string[]> => {
  const _path = decodeURIComponent(path);
  const exist = fs.existsSync(_path);
  console.log(_path, exist)
  if (!exist) {
    return [];
  }
  const files = fs.readdirSync(_path);
  return files;
};

const getFileContent = async (path: string): Promise<string> => {
  const _path = decodeURIComponent(path);

  const exist = fs.existsSync(_path);
  if (!exist) {
    return "";
  }
  const content = fs.readFileSync(_path, "utf-8");
  return content;
};

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1600,
    height: 1200,
    center: true,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL("http://localhost:3000");
};

app.whenReady().then(() => {
  ipcMain.handle("dialog:openDirectory", handleOpenDirectory);
  ipcMain.handle("getFileList", (e, path: string) => getFileList(path));
  ipcMain.handle("getFileContent", (e, path: string) => getFileContent(path));
  ipcMain.handle("app:minimize", () => {
    BrowserWindow.getFocusedWindow()?.minimize();
  });
  ipcMain.handle("app:maximize", () => {
    BrowserWindow.getFocusedWindow()?.maximize();
  });
  ipcMain.handle("app:unmaximize", () => {
    BrowserWindow.getFocusedWindow()?.unmaximize();
  });
  ipcMain.handle("app:isMaximized", () => {
    BrowserWindow.getFocusedWindow()?.isMaximized();
  });
  ipcMain.handle("app:close", () => {
    BrowserWindow.getFocusedWindow()?.close();
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  console.log("window-all-closed");
  if (process.platform !== "darwin") app.quit();
});
