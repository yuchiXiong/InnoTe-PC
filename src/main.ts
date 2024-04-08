import { app, BrowserWindow, ipcMain, dialog, screen } from "electron";
import * as path from "node:path";
import * as fs from "node:fs";

async function handleOpenDirectory() {
  console.log("[DEBUG] handleOpenDirectory");
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
  console.log("[DEBUG] getFileList", dirPath);

  const exist = fs.existsSync(dirPath);
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
  console.log("[DEBUG] getFileContent", path);
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
  console.log("[DEBUG] getFileList", path);
  fs.writeFileSync(path, content, "utf-8");
};

const createWindow = () => {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  console.log(width, height)
  const mainWindow = new BrowserWindow({
    width: Math.min(1600, width * 0.9),
    height: Math.min(1200, height * 0.9),
    // width: 800,
    // height: 600,
    center: true,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
    },
  });

  mainWindow.on("unmaximize", () => {
    mainWindow.webContents.send("app:onUnMaximized");
  });
  mainWindow.on("maximize", () => {
    mainWindow.webContents.send("app:onMaximized");
  });
  mainWindow.on("enter-full-screen", () => {
    console.log("enter-full-screen");
    mainWindow.webContents.send("app:onEnterFullScreen");
  });
  mainWindow.on("leave-full-screen", () => {
    console.log("leave-full-screen");
    mainWindow.webContents.send("app:onLeaveFullScreen");
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
    console.log("[DEBUG]", "app:minimize")
    BrowserWindow.getFocusedWindow()?.minimize();
  });
  ipcMain.handle("app:maximize", () => {
    console.log("[DEBUG]", "app:maximize")
    BrowserWindow.getFocusedWindow()?.maximize();
  });
  ipcMain.handle("app:unMaximize", () => {
    console.log("[DEBUG]", "app:unMaximize")
    BrowserWindow.getFocusedWindow()?.unmaximize();
  });
  ipcMain.handle("app:isMaximized", () => {
    console.log("[DEBUG]", "app:isMaximized")
    return BrowserWindow.getFocusedWindow()?.isMaximized();
  });
  ipcMain.handle("app:isFullScreen", () => {
    console.log("[DEBUG]", "app:isFullScreen")
    return BrowserWindow.getFocusedWindow()?.isFullScreen();
  });
  ipcMain.handle("app:isSimpleFullScreen", () => {
    console.log("[DEBUG]", "app:isSimpleFullScreen")
    return BrowserWindow.getFocusedWindow()?.isSimpleFullScreen();
  });
  ipcMain.handle("app:close", () => {
    console.log("[DEBUG]", "app:close")
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
