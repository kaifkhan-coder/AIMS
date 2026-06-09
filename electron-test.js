const { app, BrowserWindow } = require("electron");

console.log("Electron launched");

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 800,
    height: 600
  });

  win.loadURL("https://example.com");
});