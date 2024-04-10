import {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  screen,
  protocol,
  net,
} from "electron";
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
  console.log(width, height);
  const mainWindow = new BrowserWindow({
    width: width * 0.8,
    height: height * 0.8,
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

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'atom',
    privileges: {
      secure: true,
      standard: true,
      supportFetchAPI: true, // Add this if you want to use fetch with this protocol.
      // stream: true, // Add this if you intend to use the protocol for streaming i.e. in video/audio html tags.
      // corsEnabled: true, // Add this if you need to enable cors for this protocol.
    },
  },
]);

app.whenReady().then(() => {
  ipcMain.handle("dialog:openDirectory", handleOpenDirectory);
  ipcMain.handle("getFileList", (e, path: string) => getFileList(path));
  ipcMain.handle("getFileContent", (e, path: string) => getFileContent(path));
  ipcMain.handle("saveFileContent", (e, path: string, content: string) =>
    saveFileContent(path, content)
  );
  // ipcMain.handle("getPathForFile", (e, path: string) => {
  //   webUtils.getPathForFile(path);
  // });

  ipcMain.handle("app:minimize", () => {
    console.log("[DEBUG]", "app:minimize");
    BrowserWindow.getFocusedWindow()?.minimize();
  });
  ipcMain.handle("app:maximize", () => {
    console.log("[DEBUG]", "app:maximize");
    BrowserWindow.getFocusedWindow()?.maximize();
  });
  ipcMain.handle("app:unMaximize", () => {
    console.log("[DEBUG]", "app:unMaximize");
    BrowserWindow.getFocusedWindow()?.unmaximize();
  });
  ipcMain.handle("app:isMaximized", () => {
    console.log("[DEBUG]", "app:isMaximized");
    return BrowserWindow.getFocusedWindow()?.isMaximized();
  });
  ipcMain.handle("app:isFullScreen", () => {
    console.log("[DEBUG]", "app:isFullScreen");
    return BrowserWindow.getFocusedWindow()?.isFullScreen();
  });
  ipcMain.handle("app:isSimpleFullScreen", () => {
    console.log("[DEBUG]", "app:isSimpleFullScreen");
    return BrowserWindow.getFocusedWindow()?.isSimpleFullScreen();
  });
  ipcMain.handle("app:close", () => {
    console.log("[DEBUG]", "app:close");
    BrowserWindow.getFocusedWindow()?.close();
  });
  protocol.handle("atom", (request) => {
    
    const url = request.url.replace("atom://", "");
    const filePath = decodeURIComponent(url.replace("innote/?filepath=", ""));
    return net.fetch("file://" + filePath);
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
