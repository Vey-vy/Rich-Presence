import { app, BrowserWindow, ipcMain, shell } from 'electron';
import * as path from 'path';
import * as RPC from 'discord-rpc';

interface RichPresenceData {
    clientId: string;
    details: string;
    state: string;
    largeImageKey: string;
    largeImageText?: string;
    smallImageKey?: string;
    smallImageText?: string;
}

let rpc: RPC.Client | null = null;
let currentClientId: string | null = null;

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 600,
        height: 700,
        resizable: false,
        autoHideMenuBar: true,
        icon: path.join(__dirname, 'assets/icon.ico'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
        },
    });

    mainWindow.loadFile(path.join(__dirname, 'index.html'));
}

app.on('ready', () => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        if (rpc) {
            rpc.destroy();
        }
        app.quit();
    }
});

ipcMain.on('open-dev-portal', () => {
    if (currentClientId) {
        const url = `https://discord.com/developers/applications/${currentClientId}/rich-presence/assets`;
        shell.openExternal(url);
    } else {
        shell.openExternal('https://discord.com/developers/applications');
    }
});

async function setActivity(data: RichPresenceData) {
    if (!rpc) return;
    console.log("Setting activity...", data);
    await rpc.setActivity({
        details: data.details,
        state: data.state,
        startTimestamp: new Date(),
        largeImageKey: data.largeImageKey,
        largeImageText: data.largeImageText,
        smallImageKey: data.smallImageKey,
        smallImageText: data.smallImageText,
        instance: false,
    });
}

ipcMain.on('update-presence', async (event, data: RichPresenceData) => {
    console.log('Rich Presence update requested by UI:', data);

    if (currentClientId !== data.clientId || !rpc) {
        console.log(`Client ID changed or not logged in. New ID: ${data.clientId}`);
        currentClientId = data.clientId;

        if (rpc) {
            await rpc.destroy();
        }

        rpc = new RPC.Client({ transport: 'ipc' });

        rpc.on('ready', () => {
            console.log(`Connected to Discord with Client ID: ${currentClientId}`);
            setActivity(data);
        });

        await rpc.login({ clientId: currentClientId }).catch(console.error);
    } else {
        await setActivity(data);
    }
});