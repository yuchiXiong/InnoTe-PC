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

const getFileList = async (
  dirPath: string
): Promise<
  {
    fileName: string;
    isDirectory: boolean;
    children: {
      fileName: string;
      isDirectory: boolean;
      children: [];
    }[];
  }[]
> => {
  const exist = fs.existsSync(dirPath);
  console.log(path, exist);
  if (!exist) {
    return [];
  }
  const files = fs.readdirSync(dirPath, {
    withFileTypes: true,
  });
  return files.map((file) => ({
    fileName: file.name,
    isDirectory: file.isDirectory(),
    children: file.isDirectory()
      ? fs
          .readdirSync(path.join(dirPath, file.name), {
            withFileTypes: true,
          })
          .map((file) => ({
            fileName: file.name,
            isDirectory: file.isDirectory(),
            children: [],
          }))
      : [],
  }));
};

const getFileContent = async (path: string): Promise<string> => {
  const exist = fs.existsSync(path);
  if (!exist) {
    return "";
  }
  const content = fs.readFileSync(path, "utf-8");
  return content;
};

const saveFileContent = async (
  path: string,
  content: string
): Promise<void> => {
  fs.writeFileSync(path, content, "utf-8");
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

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('app:onUnMaximized');
  });
  mainWindow.on("maximize", () => {
    mainWindow.webContents.send('app:onMaximized');
  });
  mainWindow.loadURL("http://localhost:3000");
  // mainWindow.loadURL("https://innote-editor.bubuyu.top");
};

app.whenReady().then(() => {
  ipcMain.handle("dialog:openDirectory", handleOpenDirectory);
  ipcMain.handle("getFileList", (e, path: string) => getFileList(path));
  ipcMain.handle("getFileContent", (e, path: string) => getFileContent(path));
  ipcMain.handle("saveFileContent", (e, path: string, content: string) =>
    saveFileContent(path, content)
  );
  ipcMain.handle("app:minimize", () => {
    BrowserWindow.getFocusedWindow()?.minimize();
  });
  ipcMain.handle("app:maximize", () => {
    BrowserWindow.getFocusedWindow()?.maximize();
  });
  ipcMain.handle("app:unMaximize", () => {
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
