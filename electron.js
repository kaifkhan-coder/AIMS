import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let backend;

function startBackend() {
  backend = spawn("node", ["backend/server.js"], {
    shell: true,
  });

backend.stdout.on("data", (data) => {
  console.log(`Backend: ${data}`);
});

backend.stderr.on("data", (data) => {
  console.error(`Backend Error: ${data}`);
});

backend.on("error", (err) => {
  console.error("Failed to start backend:", err);
});
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
  });

  win.loadFile(path.join(__dirname, "dist/index.html"));

win.webContents.on(
  "did-fail-load",
  (event, errorCode, errorDescription) => {
    console.log("Load failed:", errorCode, errorDescription);
  }
);

  win.webContents.openDevTools();
}


app.whenReady().then(() => {
  createWindow();
});

app.on("will-quit", () => {
  if (backend) backend.kill();
});