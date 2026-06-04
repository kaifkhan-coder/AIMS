// const { app, BrowserWindow } = require("electron");
import { app, BrowserWindow } from "electron";
// const path = require("path");
import path from "path";
// const { spawn } = require("child_process");
import { spawn } from "child_process";

let backend;

function startBackend() {
  backend = spawn("node", ["server/index.js"], {
    shell: true,
  });

  backend.stdout.on("data", (data) => console.log(`Backend: ${data}`));
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
  });

  win.loadFile(path.join(__dirname, "../dist/index.html"));
}

app.whenReady().then(() => {
  startBackend();
  createWindow();
});

app.on("will-quit", () => {
  if (backend) backend.kill();
});