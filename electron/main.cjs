const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const path = require('path')
const { execFile, spawn } = require('child_process')

let mainWindow
let backendProcess = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1340,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    title: 'W3PN Anonymizer',
    icon: path.join(__dirname, '..', 'public', 'icon-512.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 14, y: 14 },
    backgroundColor: '#111111',
  })

  mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))

  Menu.setApplicationMenu(Menu.buildFromTemplate([
    {
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { role: 'close' },
      ],
    },
  ]))

  mainWindow.on('closed', () => { mainWindow = null })
}

// Find Python executable
function findPython() {
  return new Promise((resolve) => {
    const candidates = process.platform === 'win32'
      ? ['python', 'python3', 'py']
      : ['python3', 'python']
    let idx = 0
    function tryNext() {
      if (idx >= candidates.length) return resolve(null)
      const cmd = candidates[idx++]
      execFile(cmd, ['--version'], { timeout: 5000 }, (err, stdout) => {
        if (!err && stdout) {
          const ver = stdout.trim()
          resolve({ cmd, version: ver })
        } else {
          tryNext()
        }
      })
    }
    tryNext()
  })
}

// IPC: Check Python availability
ipcMain.handle('backend:check-python', async () => {
  const result = await findPython()
  return result // { cmd, version } or null
})

// IPC: Install Python dependencies
ipcMain.handle('backend:install-deps', async (_event) => {
  const python = await findPython()
  if (!python) return { ok: false, message: 'Python not found on this system.' }

  const serverDir = path.join(__dirname, '..', 'server')
  const reqFile = path.join(serverDir, 'requirements.txt')

  return new Promise((resolve) => {
    execFile(python.cmd, ['-m', 'pip', 'install', '-r', reqFile], {
      cwd: serverDir,
      timeout: 300_000,
    }, (err, stdout, stderr) => {
      if (err) {
        resolve({ ok: false, message: `Install failed: ${err.message}`, stderr })
      } else {
        resolve({ ok: true, message: 'All dependencies installed successfully.', stdout })
      }
    })
  })
})

// IPC: Start the Python backend server
ipcMain.handle('backend:start-server', async () => {
  if (backendProcess) return { ok: true, message: 'Server already running.' }

  const python = await findPython()
  if (!python) return { ok: false, message: 'Python not found.' }

  const serverDir = path.join(__dirname, '..', 'server')

  return new Promise((resolve) => {
    backendProcess = spawn(python.cmd, ['main.py'], {
      cwd: serverDir,
      stdio: 'pipe',
    })

    let started = false
    const timeout = setTimeout(() => {
      if (!started) resolve({ ok: true, message: 'Server starting…' })
      started = true
    }, 3000)

    backendProcess.stdout.on('data', (data) => {
      const msg = data.toString()
      if (msg.includes('Uvicorn running') && !started) {
        started = true
        clearTimeout(timeout)
        resolve({ ok: true, message: 'Server started on http://127.0.0.1:7865' })
      }
    })

    backendProcess.on('error', (err) => {
      backendProcess = null
      if (!started) {
        started = true
        clearTimeout(timeout)
        resolve({ ok: false, message: `Failed to start: ${err.message}` })
      }
    })

    backendProcess.on('exit', () => { backendProcess = null })
  })
})

// IPC: Check if running in Electron
ipcMain.handle('app:is-electron', () => true)

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (mainWindow === null) createWindow()
})

app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill()
    backendProcess = null
  }
})
