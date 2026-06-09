const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let backendProcess;

function startBackend() {
  backendProcess = spawn(
    "node",
    [path.join(__dirname, "backend", "server.js")],
    {
      shell: true
    }
  );

  backendProcess.stdout.on("data", (data) => {
    console.log(data.toString());
  });

  backendProcess.stderr.on("data", (data) => {
    console.error(data.toString());
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
  });

  win.loadFile(path.join(__dirname, "dist", "index.html"));

  win.webContents.openDevTools();
}

app.whenReady().then(() => {
  startBackend();
  createWindow();
});

app.on("window-all-closed", () => {
  if (backendProcess) {
    backendProcess.kill();
  }

  app.quit();
});