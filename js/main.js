const electron = require("electron");
const { app, BrowserWindow, Menu, ipcMain, globalShortcut, shell } = electron;
const { update } = require("./updater.js");
const path = require("path");
let os = require("os");
let win = null, splash = null;

app.commandLine.appendSwitch("disable-frame-rate-limit");
app.commandLine.appendSwitch("disable-gpu-vsync");
app.commandLine.appendSwitch("ignore-gpu-blacklist");
app.commandLine.appendSwitch("disable-breakpad");
app.commandLine.appendSwitch("disable-component-update");
app.commandLine.appendSwitch("disable-print-preview");
app.commandLine.appendSwitch("disable-metrics");
app.commandLine.appendSwitch("disable-metrics-repo");
app.commandLine.appendSwitch("disable-bundled-ppapi-flash");
app.commandLine.appendSwitch("disable-logging");
app.commandLine.appendSwitch("webrtc-max-cpu-consumption-percentage=100");
if(os.cpus()[0].model.includes("AMD")) {
    app.commandLine.appendSwitch("enable-zero-copy");
}

//Allow custom arguments to pass through
for(var argument in process.argv) {
    app.commandLine.appendSwitch(argument);
}

//Setup Mac shortcuts
if(process.platform == "darwin") {
    var template = [{
        label: "Application",
        submenu: [
            { label: "About Application", selector: "orderFrontStandardAboutPanel:" },
            { type: "separator" },
            { label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }}
        ]}, {
        label: "Edit",
        submenu: [
            { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
            { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
            { type: "separator" },
            { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
            { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
            { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
            { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
        ]}
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
} else {
    Menu.setApplicationMenu(null);
}

function createSplash() {
    splash = new BrowserWindow({
        width: 700,
        height: 300,
        backgroundColor: "#000000",
        center: true,
        alwaysOnTop: true,
        frame: false,
        show: false,
        webPreferences: {
            nodeIntergration: false
        }
    });
    splash.loadFile(path.join(__dirname, "../html/splash.html"));
    splash.once("ready-to-show", () => splash.show());
    update();
}

function createGameWindow() {
    const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize;
    win = new BrowserWindow({
        backgroundColor: "#000000",
        show: false,
        webPreferences: {
            nodeIntergration: false,
            preload: path.join(__dirname, "preload.js")
        }
    });
    win.loadURL("https://krunker.io");
    win.setFullScreen(true);
    win.once("ready-to-show", () => {
        win.show();
        splash.close();
        splash = null;
        win.webContents.openDevTools();
    });
}

ipcMain.on("close", () => {
    app.quit();
});

ipcMain.on("openDiscord", () => {
    shell.openExternal("https://discord.gg/5ZMvrGT");
});

app.on("ready", () => {
    createSplash();
    globalShortcut.register("Escape", () => {
        win.webContents.send('exitPointerLock');
    });
});

app.on("window-all-closed", () => {
    app.quit();
});

module.exports = { createGameWindow };