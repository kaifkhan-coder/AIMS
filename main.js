// import { app, BrowserWindow } from "electron";

// function createWindow() {
//   const win = new BrowserWindow({
//     width: 1200,
//     height: 800,
//   });

//   win.loadURL("https://aims-5k31.vercel.app").catch(err => {
//     console.error("Load URL Error:", err);
//   });

//   win.webContents.on("did-fail-load", () => {
//     console.warn("Vercel load failed, trying localhost...");
//     win.loadURL("http://localhost:5173").catch(err => {
//       console.error("Load URL Error:", err);
//     });
//   });
// }

// app.whenReady().then(createWindow);