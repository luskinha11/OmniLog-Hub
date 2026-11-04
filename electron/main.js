    const { app, BrowserWindow, dialog } = require('electron');
    const { spawn } = require('node:child_process');
    const path = require('node:path');

    const projectRoot = path.resolve(__dirname, '..');
    require('dotenv').config({ path: path.join(projectRoot, '.env') });
    const port = Number(process.env.PORT || 3000);
    const baseUrl = `http://127.0.0.1:${port}`;
    let backendProcess = null;
    let ownsBackend = false;

    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

    async function backendResponds() {
      try {
        const response = await fetch(`${baseUrl}/api/health`, { signal: AbortSignal.timeout(1500) });
        return Boolean(response);
      } catch {
        return false;
      }
    }

    async function ensureBackend() {
      if (await backendResponds()) return;

      backendProcess = spawn('node', [path.join(projectRoot, 'src', 'server.js')], {
        cwd: projectRoot,
        env: { ...process.env, NODE_ENV: process.env.NODE_ENV || 'development' },
        stdio: 'inherit',
        windowsHide: true
      });
      ownsBackend = true;

      backendProcess.once('error', error => {
        console.error('Não foi possível iniciar o servidor local:', error);
      });

      for (let attempt = 0; attempt < 40; attempt += 1) {
        if (await backendResponds()) return;
        if (backendProcess.exitCode !== null) {
          throw new Error('O servidor encerrou antes de ficar disponível. Confira o MySQL e o arquivo .env.');
        }
        await wait(750);
      }
      throw new Error('O servidor não respondeu. Confira se a porta configurada está livre e se o MySQL está ativo.');
    }

    async function createWindow() {
      const window = new BrowserWindow({
        width: 1440,
        height: 940,
        minWidth: 1050,
        minHeight: 700,
        title: 'OmniLog Hub',
        backgroundColor: '#09070f',
        autoHideMenuBar: true,
        webPreferences: {
          contextIsolation: true,
          nodeIntegration: false,
          sandbox: true
        }
      });
      await window.loadURL(baseUrl);
    }

    app.whenReady().then(async () => {
      try {
        await ensureBackend();
        await createWindow();
      } catch (error) {
        dialog.showErrorBox('OmniLog Hub não iniciou', error.message);
        app.quit();
      }

      app.on('activate', async () => {
        if (BrowserWindow.getAllWindows().length === 0) await createWindow();
      });
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') app.quit();
    });

    app.on('before-quit', () => {
      if (ownsBackend && backendProcess && !backendProcess.killed) backendProcess.kill();
    });
