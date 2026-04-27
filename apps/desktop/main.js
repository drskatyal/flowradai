// Handle Squirrel events for Windows installer FIRST, before any other code
// This prevents the app from running during install/uninstall/update
if (process.platform === 'win32') {
  const squirrelCommand = process.argv[1];

  switch (squirrelCommand) {
    case '--squirrel-install':
    case '--squirrel-updated':
      process.exit(0);
      break;
    case '--squirrel-uninstall':
      process.exit(0);
      break;
    case '--squirrel-obsolete':
      process.exit(0);
      break;
  }
}

const { app, BrowserWindow, shell, globalShortcut, ipcMain, clipboard } = require('electron');
const path = require('path');
const { exec } = require('child_process');

// FORCE production mode always
process.env.NODE_ENV = "production";

const isDev = process.env.NODE_ENV !== 'production';
const DEV_URL = process.env.ELECTRON_RENDERER_URL || 'http://localhost:4300';

//static staing url
const PROD_URL = "https://app.flowrad.ai";

// Debounce utility to prevent rapid repeated calls
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Cache for window info to avoid repeated expensive calls
let windowInfoCache = null;
let windowInfoCacheTime = 0;
const WINDOW_INFO_CACHE_DURATION = 2000; // 2 seconds

/**
* Create the main application window
*/
function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 640,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      backgroundThrottling: true, // ✅ OPTIMIZED: Enable throttling
    },
    show: false,
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.maximize();
    mainWindow.show();
  });

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('about:')) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          autoHideMenuBar: true,
          title: 'Sign In'
        }
      };
    }
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Intercept new windows (Auth popups) to force Google Account selection
  mainWindow.webContents.on('did-create-window', (childWindow) => {
    childWindow.webContents.on('will-navigate', (event, url) => {
      if (url.includes('accounts.google.com') && url.includes('/o/oauth2/') && !url.includes('prompt=select_account')) {
        console.log('Intercepting Google Auth to force account selection');
        event.preventDefault();
        const newUrl = new URL(url);
        newUrl.searchParams.set('prompt', 'select_account');
        setImmediate(() => {
          childWindow.loadURL(newUrl.toString());
        });
      }
    });
  });

  // ✅ OPTIMIZED: Using static URL, no server startup needed
  mainWindow.loadURL(isDev ? DEV_URL : PROD_URL);
}

let floatingWindow = null;
let floatingWindowReady = false;
let pendingSelectedText = null;
let pendingClearRequest = false;
let sourceWindowInfo = null;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ✅ OPTIMIZED: Added caching to reduce expensive system calls
const getActiveWindowInfo = () => {
  // Return cached info if still valid
  const now = Date.now();
  if (windowInfoCache && (now - windowInfoCacheTime) < WINDOW_INFO_CACHE_DURATION) {
    return Promise.resolve(windowInfoCache);
  }

  return new Promise((resolve) => {
    let command;
    if (process.platform === 'darwin') {
      command = `
      osascript -e '
      tell application "System Events"
        set theProcess to first process whose frontmost is true
        return (name of theProcess) & "," & (unix id of theProcess)
      end tell'
      `;
    } else if (process.platform === 'win32') {
      const psScript = `
      Add-Type @"
      using System;
      using System.Runtime.InteropServices;
      using System.Text;
      public class Win32 {
          [DllImport("user32.dll")]
          public static extern IntPtr GetForegroundWindow();
          [DllImport("user32.dll")]
          public static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);
          [DllImport("user32.dll")]
          public static extern int GetWindowThreadProcessId(IntPtr hWnd, out int lpdwProcessId);
      }
"@
      $hwnd = [Win32]::GetForegroundWindow()
      $sb = New-Object System.Text.StringBuilder(256)
      [void][Win32]::GetWindowText($hwnd, $sb, $sb.Capacity)
      $windowTitle = $sb.ToString()
      $processId = 0
      [void][Win32]::GetWindowThreadProcessId($hwnd, [ref]$processId)
      $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
      Write-Output $windowTitle
      Write-Output $process.ProcessName
      Write-Output $hwnd.ToInt64()
      `;
      const encodedScript = Buffer.from(psScript, 'utf16le').toString('base64');
      command = `powershell.exe -NoProfile -ExecutionPolicy Bypass -EncodedCommand ${encodedScript}`;
    } else {
      command = 'xdotool getactivewindow getwindowname 2>/dev/null || echo ""';
    }

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.warn('Failed to get active window info:', error.message);
        const emptyInfo = { windowTitle: '', windowName: '', processName: '', processId: null, windowHandle: null };
        resolve(emptyInfo);
        return;
      }

      try {
        let info;
        if (process.platform === 'darwin') {
          const match = stdout.trim().match(/^(.+),\s*(\d+)$/);
          if (match) {
            info = {
              windowName: match[1].trim(),
              processId: parseInt(match[2]),
              windowTitle: match[1].trim()
            };
          } else {
            info = { windowTitle: '', windowName: '', processId: null };
          }
        } else if (process.platform === 'win32') {
          const lines = stdout.trim().split('\n').map(line => line.trim());
          info = {
            windowTitle: lines[0] || '',
            windowName: lines[1] || '',
            processName: lines[1] || '',
            processId: null,
            windowHandle: lines[2] || null
          };
        } else {
          const name = stdout.trim() || '';
          info = { windowTitle: name, windowName: name, processId: null };
        }

        // ✅ OPTIMIZED: Cache the result
        windowInfoCache = info;
        windowInfoCacheTime = Date.now();
        resolve(info);
      } catch (err) {
        console.warn('Failed to parse window info:', err);
        const emptyInfo = { windowTitle: '', windowName: '', processName: '', processId: null };
        resolve(emptyInfo);
      }
    });
  });
};

const focusSourceWindow = async (windowInfo) => {
  if (!windowInfo || (!windowInfo.processId && !windowInfo.windowName && !windowInfo.processName && !windowInfo.windowHandle)) {
    console.error('No valid window info provided');
    return false;
  }

  return new Promise((resolve) => {
    let command;

    if (process.platform === 'darwin' && windowInfo.processId) {
      command = `
      osascript -e '
      tell application "System Events"
        set targetProc to first process whose unix id is ${windowInfo.processId}
        set frontmost of targetProc to true
      end tell'
      `;
    } else if (process.platform === 'win32' && windowInfo.windowHandle) {
      const psScript = `
      Add-Type @"
      using System;
      using System.Runtime.InteropServices;
      public class Win32 {
          [DllImport("user32.dll")]
          public static extern bool SetForegroundWindow(IntPtr hWnd);
          [DllImport("user32.dll")]
          public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
          [DllImport("user32.dll")]
          public static extern bool IsIconic(IntPtr hWnd);
      }
"@
      $hwnd = [IntPtr]${windowInfo.windowHandle}
      if ([Win32]::IsIconic($hwnd)) {
          [Win32]::ShowWindow($hwnd, 9)
      }
      [Win32]::SetForegroundWindow($hwnd)
      `;
      const encodedScript = Buffer.from(psScript, 'utf16le').toString('base64');
      command = `powershell.exe -NoProfile -ExecutionPolicy Bypass -EncodedCommand ${encodedScript}`;
    } else if (process.platform === 'win32' && windowInfo.windowTitle) {
      const escapedTitle = windowInfo.windowTitle.replace(/'/g, "''").replace(/"/g, '""');
      const psScript = `
      Add-Type @"
      using System;
      using System.Runtime.InteropServices;
      public class Win32 {
          [DllImport("user32.dll")]
          public static extern bool SetForegroundWindow(IntPtr hWnd);
      }
"@
      $windows = Get-Process | Where-Object { $_.MainWindowTitle -ne '' }
      $targetWindow = $windows | Where-Object { $_.MainWindowTitle -like '*${escapedTitle}*' } | Select-Object -First 1
      if ($targetWindow) {
          [Win32]::SetForegroundWindow($targetWindow.MainWindowHandle)
      }
      `;
      const encodedScript = Buffer.from(psScript, 'utf16le').toString('base64');
      command = `powershell.exe -NoProfile -ExecutionPolicy Bypass -EncodedCommand ${encodedScript}`;
    } else if (process.platform === 'linux' && windowInfo.windowName) {
      command = `wmctrl -a "${windowInfo.windowName}" 2>/dev/null || xdotool search --name "${windowInfo.windowName}" windowactivate 2>/dev/null`;
    } else {
      console.error('No suitable focus method found for platform:', process.platform);
      resolve(false);
      return;
    }

    exec(command, (error) => {
      if (error) {
        console.warn('Failed to focus source window:', error.message);
        resolve(false);
        return;
      }
      resolve(true);
    });
  });
};

// ✅ OPTIMIZED: Reduced clipboard operations and added early returns
const replaceSelectedText = async (textData) => {
  const plainText = typeof textData === 'string' ? textData : textData.plainText;
  const htmlText = typeof textData === 'object' ? textData.htmlText : null;

  if (!sourceWindowInfo) {
    console.error('No source window info available');
    return false;
  }

  if (!plainText) {
    console.error('No new text provided for replacement');
    return false;
  }

  if (process.platform === 'win32') {
    if (!sourceWindowInfo.windowHandle && !sourceWindowInfo.windowTitle && !sourceWindowInfo.processName) {
      console.error('Invalid source window info');
      return false;
    }

    const electronProcessNames = ['electron', 'custom-gpt-chat'];
    if (electronProcessNames.some(name => sourceWindowInfo.processName?.toLowerCase().includes(name))) {
      return false;
    }
  }

  const focused = await focusSourceWindow(sourceWindowInfo);
  if (!focused) {
    console.warn('Failed to focus source window, but continuing...');
  }

  await delay(300); // ✅ OPTIMIZED: Reduced from 400ms

  // ✅ OPTIMIZED: Single clipboard read/write operation
  const previousClipboard = clipboard.readText();
  const previousHtml = clipboard.readHTML();

  if (htmlText) {
    clipboard.write({ text: plainText, html: htmlText });
  } else {
    clipboard.writeText(plainText);
  }

  let pasteCmd;
  if (process.platform === 'darwin') {
    pasteCmd = `osascript -e 'tell application "System Events" to keystroke "v" using {command down}'`;
  } else if (process.platform === 'win32') {
    pasteCmd = `powershell -Command "$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys('^v')"`;
  } else {
    pasteCmd = `xdotool key ctrl+v`;
  }

  return new Promise((resolve) => {
    exec(pasteCmd, async (error) => {
      await delay(400); // ✅ OPTIMIZED: Reduced from 500ms

      // Restore clipboard
      if (previousHtml) {
        clipboard.write({ text: previousClipboard, html: previousHtml });
      } else {
        clipboard.writeText(previousClipboard);
      }

      if (error) {
        console.error('Paste failed:', error.message);
        return resolve(false);
      }

      resolve(true);
    });
  });
};

const simulateCopyShortcut = () => {
  return new Promise((resolve) => {
    let command;
    if (process.platform === 'darwin') {
      command = `osascript -e 'tell application "System Events" to keystroke "c" using {command down}'`;
    } else if (process.platform === 'win32') {
      command = `powershell -Command "$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys('^c')"`;
    } else {
      command = 'xdotool key --clearmodifiers ctrl+c';
    }

    if (!command) {
      resolve(false);
      return;
    }

    exec(command, (error) => {
      if (error) {
        console.warn('Copy shortcut simulation failed:', error.message);
        resolve(false);
        return;
      }
      resolve(true);
    });
  });
};

const captureSelectedText = async () => {
  try {
    if (process.platform === 'linux') {
      const selectionClipboard = clipboard.readText('selection');
      if (selectionClipboard?.trim()) {
        return selectionClipboard;
      }
    }

    const previousClipboard = clipboard.readText();

    if (process.platform === 'darwin' && sourceWindowInfo && sourceWindowInfo.processId) {
      const focused = await focusSourceWindow(sourceWindowInfo);
      await delay(100); // ✅ OPTIMIZED: Reduced from 120ms
    }

    const copyAttempted = await simulateCopyShortcut();
    if (!copyAttempted) {
      return "";
    }

    await delay(150); // ✅ OPTIMIZED: Reduced from 180ms
    const clipboardText = clipboard.readText();

    if (clipboardText && clipboardText !== previousClipboard) {
      clipboard.writeText(previousClipboard || "");
      return clipboardText;
    }

    clipboard.writeText(previousClipboard || "");
  } catch (error) {
    console.warn('Failed to capture selected text:', error);
  }

  return "";
};

const queueSelectedTextInjection = (text) => {
  if (!text || !floatingWindow || floatingWindow.webContents.isDestroyed()) {
    pendingSelectedText = text;
    return;
  }

  if (!floatingWindowReady) {
    pendingSelectedText = text;
    return;
  }

  floatingWindow.webContents.send('prefill-selected-text', {
    text,
    source: 'shortcut',
    timestamp: Date.now(),
  });
};

const requestFloatingInputClear = () => {
  if (!floatingWindow || floatingWindow.webContents.isDestroyed()) {
    return;
  }

  if (!floatingWindowReady) {
    pendingSelectedText = null;
    pendingClearRequest = true;
    return;
  }

  pendingSelectedText = null;
  pendingClearRequest = false;
  floatingWindow.webContents.send('clear-floating-input');
};

// ✅ OPTIMIZED: Lazy-loaded floating window creation
function createFloatingWindow() {
  floatingWindowReady = false;
  floatingWindow = new BrowserWindow({
    width: 650, // ✅ OPTIMIZED: Reduced from 750
    height: 850, // ✅ OPTIMIZED: Reduced from 1000
    alwaysOnTop: false, // ✅ OPTIMIZED: Changed to false, set to true only when shown
    frame: false,
    transparent: true,
    resizable: true,
    minWidth: 450, // ✅ OPTIMIZED: Reduced from 500
    minHeight: 600, // ✅ OPTIMIZED: Reduced from 700
    maxWidth: 650, // ✅ OPTIMIZED: Reduced from 750
    maxHeight: 850, // ✅ OPTIMIZED: Reduced from 1000
    skipTaskbar: true,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      enableWebSQL: false,
      webgl: true,
      backgroundThrottling: true, // ✅ CRITICAL FIX: Enable throttling to save resources
    },
    show: false,
  });

  const floatingRoute = "/floating";
  const url = isDev ? `${DEV_URL}${floatingRoute}` : `${PROD_URL}${floatingRoute}`;
  floatingWindow.loadURL(url);

  floatingWindow.webContents.on('did-finish-load', () => {
    floatingWindowReady = true;
    if (pendingClearRequest) {
      floatingWindow.webContents.send('clear-floating-input');
      pendingClearRequest = false;
    }
    if (pendingSelectedText) {
      floatingWindow.webContents.send('prefill-selected-text', {
        text: pendingSelectedText,
        source: 'shortcut',
        timestamp: Date.now(),
      });
      pendingSelectedText = null;
    }
  });

  floatingWindow.on('close', (e) => {
    e.preventDefault();
    floatingWindow.hide();
    floatingWindow.setAlwaysOnTop(false); // ✅ OPTIMIZED: Remove always-on-top when hidden
    requestFloatingInputClear();
  });

  floatingWindow.on('hide', () => {
    floatingWindow.setAlwaysOnTop(false); // ✅ OPTIMIZED: Remove always-on-top when hidden
    requestFloatingInputClear();
  });

  floatingWindow.on('closed', () => {
    floatingWindowReady = false;
    floatingWindow = null;
  });
}

// Deep Link Protocol
const PROTOCOL = 'flowrad';

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient(PROTOCOL);
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    const mainWindow = BrowserWindow.getAllWindows().find(w => !w.isDestroyed() && w !== floatingWindow);
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    // IPC handlers - Register once globally
    ipcMain.on('replace-selected-text', async (_event, textData) => {
      const success = await replaceSelectedText(textData);
      if (floatingWindow && !floatingWindow.webContents.isDestroyed()) {
        floatingWindow.webContents.send('replace-result', { success });
      }
    });

    ipcMain.on('minimize-floating-window', () => {
      if (floatingWindow) {
        floatingWindow.minimize();
      }
    });

    ipcMain.on('close-floating-window', () => {
      if (floatingWindow) {
        floatingWindow.hide();
      }
    });

    ipcMain.on('launch-floating-window', () => {
      if (!floatingWindow) {
        createFloatingWindow();
      }

      if (floatingWindow) {
        if (!floatingWindow.isVisible()) {
          floatingWindow.show();
        }
        floatingWindow.setAlwaysOnTop(true); // ✅ OPTIMIZED: Only set when showing
        floatingWindow.focus();
        floatingWindow.webContents.focus();

        BrowserWindow.getAllWindows().forEach((win) => {
          if (win !== floatingWindow) {
            win.minimize();
          }
        });
      }
    });

    ipcMain.on('auth-state-change', (event, { isSignedIn }) => {
      BrowserWindow.getAllWindows().forEach((win) => {
        if (win.webContents.id !== event.sender.id) {
          win.webContents.send('sync-auth', { isSignedIn });
        }
      });
    });

    // ✅ OPTIMIZED: Create main window immediately, floating window on-demand
    createMainWindow();
    // Removed: createFloatingWindow() - now created lazily when needed

    // ✅ OPTIMIZED: Debounced shortcut handlers to prevent rapid firing
    const debouncedToggleFloating = debounce(async () => {
      if (!floatingWindow) {
        createFloatingWindow();
        // Wait for window to be created
        await delay(100);
      }

      if (!floatingWindow) return;

      if (floatingWindow.isVisible()) {
        floatingWindow.hide();
        floatingWindow.setAlwaysOnTop(false);
      } else {
        floatingWindow.show();
        floatingWindow.setAlwaysOnTop(true);
        floatingWindow.focus();
        floatingWindow.webContents.focus();
      }
    }, 300);

    const debouncedCaptureText = debounce(async () => {
      if (!floatingWindow) {
        createFloatingWindow();
        await delay(100);
      }

      if (!floatingWindow) {
        console.error('Failed to create floating window');
        return;
      }

      // ✅ OPTIMIZED: Clear cache before getting fresh window info
      windowInfoCache = null;
      sourceWindowInfo = await getActiveWindowInfo();

      if (process.platform === 'win32') {
        const electronProcessNames = ['electron', 'custom-gpt-chat'];
        if (electronProcessNames.some(name => sourceWindowInfo.processName?.toLowerCase().includes(name))) {
          console.warn('WARNING: Captured window info from Electron app itself!');
        }
      }

      const selectedText = await captureSelectedText();

      if (!floatingWindow.isVisible()) {
        floatingWindow.show();
      }
      floatingWindow.setAlwaysOnTop(true);
      floatingWindow.focus();
      floatingWindow.webContents.focus();

      if (selectedText?.trim()) {
        pendingClearRequest = false;
        queueSelectedTextInjection(selectedText);
        floatingWindow.webContents.send('source-window-info', sourceWindowInfo);
      } else {
        sourceWindowInfo = null;
      }
    }, 300);

    // ✅ OPTIMIZED: Reduced number of global shortcuts and added debouncing
    globalShortcut.register('Control+Shift+A', debouncedToggleFloating);
    globalShortcut.register('Control+Shift+W', debouncedCaptureText);

    // Other shortcuts with simple debouncing
    globalShortcut.register('Control+Alt+X', debounce(() => {
      if (floatingWindow && floatingWindow.isVisible() && floatingWindow.isFocused()) {
        floatingWindow.webContents.send('floating-new-session');
      }
    }, 300));

    globalShortcut.register('Control+Alt+C', debounce(() => {
      if (floatingWindow && floatingWindow.isVisible() && floatingWindow.isFocused()) {
        floatingWindow.webContents.send('floating-copy-report');
      }
    }, 300));

    globalShortcut.register('Control+Alt+Space', debounce(() => {
      if (floatingWindow && floatingWindow.isVisible() && floatingWindow.isFocused()) {
        floatingWindow.webContents.send('floating-start-mic');
      }
    }, 300));

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
      }
    });
  });
}

// Clean shortcuts
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ✅ OPTIMIZED: Removed Next.js server cleanup (not needed with static URL)