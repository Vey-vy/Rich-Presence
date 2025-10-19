const { contextBridge, ipcRenderer } = require('electron');

declare global {
    interface Window { electronAPI: IElectronAPI }
}


interface RichPresenceData {
    clientId: string;
    details: string;
    state: string;
    largeImageKey: string;
    largeImageText?: string;
    smallImageKey?: string;
    smallImageText?: string;
}

export interface IElectronAPI {
    updatePresence: (data: RichPresenceData) => void;
    openDevPortal: () => void;
}

const electronAPI: IElectronAPI = {
    updatePresence: (data: RichPresenceData) => ipcRenderer.send('update-presence', data),
    openDevPortal: () => ipcRenderer.send('open-dev-portal'),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

window.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('rpc-form');
    if (form) {
        form.addEventListener('submit', (e: Event) => {
            e.preventDefault();
            const formData = new FormData(form as HTMLFormElement);
            const data = Object.fromEntries(formData.entries());
            
            window.electronAPI.updatePresence(data as unknown as RichPresenceData);

            const statusMessage = document.getElementById('status-message');
            if (statusMessage) {
                statusMessage.innerText = 'Presence updated!';
                setTimeout(() => {
                    statusMessage.innerText = '';
                }, 3000);
            }
        });
    }

    const manageImagesButton = document.getElementById('manage-images-btn');
    if (manageImagesButton) {
        manageImagesButton.addEventListener('click', () => {
            window.electronAPI.openDevPortal();
        });
    }
});