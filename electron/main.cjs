const { app, BrowserWindow, Menu, ipcMain, protocol, net, shell } = require('electron')
const path = require('path')

const { pathToFileURL } = require('url')
protocol.registerSchemesAsPrivileged([{ scheme: 'anonymizer', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } }])

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1340,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    title: 'W3PN Anonymizer',
    icon: path.join(__dirname, '..', 'dist', 'icon-512.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 14, y: 14 },
    backgroundColor: '#111111',
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) void shell.openExternal(url)
    return { action: 'deny' }
  })
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const target = new URL(url)
    if (target.protocol !== 'anonymizer:' || target.hostname !== 'app') event.preventDefault()
  })
  mainWindow.loadURL('anonymizer://app/index.html')

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

ipcMain.handle('app:is-electron', () => true)

app.whenReady().then(() => {
  const dist = path.resolve(__dirname, '..', 'dist')
  protocol.handle('anonymizer', (request) => {
    const url = new URL(request.url)
    if (url.hostname !== 'app') return new Response('Forbidden', { status: 403 })
    const file = path.resolve(dist, '.' + decodeURIComponent(url.pathname))
    if (!file.startsWith(dist + path.sep)) return new Response('Forbidden', { status: 403 })
    return net.fetch(pathToFileURL(file).href)
  })
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (mainWindow === null) createWindow()
})
