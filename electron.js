  import { app, BrowserWindow } from "electron";
  import path from "path";
  import { fileURLToPath } from "url";

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  let mainWindow;

  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      autoHideMenuBar: true,
    });

    // ✅ LOAD LOCAL BUILD (IMPORTANT)
    mainWindow.loadFile(path.join(__dirname, "dist/index.html"));
  }

  app.whenReady().then(createWindow);

  app.on("window-all-closed", () => {
    app.quit();
  });