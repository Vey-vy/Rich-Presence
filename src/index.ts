import * as RPC from 'discord-rpc';

const clientId = '1428793215938592809';

if (!clientId) {
    throw new Error('The clientId is not defined. Please replace it with your own Client ID.');
}

const rpc = new RPC.Client({ transport: 'ipc' });

interface RichPresenceData {
    details: string;
    state: string;
    startTimestamp?: Date;
    largeImageKey: string;
    largeImageText?: string;
    smallImageKey?: string;
    smallImageText?: string;
    instance?: boolean;
}

async function updateRichPresence(data: RichPresenceData) {
    if (!rpc) {
        console.error("The RPC client is not initialized.");
        return;
    }

    console.log('Updating Rich Presence with data:', data);
    rpc.setActivity({
        details: data.details,
        state: data.state,
        startTimestamp: data.startTimestamp || new Date(),
        largeImageKey: data.largeImageKey,
        largeImageText: data.largeImageText,
        smallImageKey: data.smallImageKey,
        smallImageText: data.smallImageText,
        instance: data.instance || false,
    });
}

rpc.on('ready', () => {
    console.log('Connected to Discord !');

    updateRichPresence({
        details: 'Develop TS App',
        state: 'Encountering difficulties 😅',
        largeImageKey: 'typescript_logo',
        largeImageText: 'TypeScript',
        smallImageKey: 'vscode_logo',
        smallImageText: 'VS Code',
    });

    setInterval(() => {
        console.log("Refreshing Rich Presence...");
        updateRichPresence({
            details: 'Develop TS App',
            state: 'Encountering difficulties 😅',
            largeImageKey: 'typescript_logo',
            largeImageText: 'TypeScript',
            smallImageKey: 'vscode_logo',
            smallImageText: 'VS Code',
        });
    }, 15000);
});

console.log('Connecting to Discord...');
rpc.login({ clientId }).catch((err: any) => console.error(err));
