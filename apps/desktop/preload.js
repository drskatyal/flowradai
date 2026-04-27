const { contextBridge, ipcRenderer } = require('electron');

// Expose a minimal, safe API surface if needed later
contextBridge.exposeInMainWorld('desktop', {
  version: '1.0.0',
});

// Expose Electron APIs for window controls
contextBridge.exposeInMainWorld('electron', {
  minimizeWindow: () => ipcRenderer.send('minimize-floating-window'),
  closeWindow: () => ipcRenderer.send('close-floating-window'),
  launchFloatingWindow: () => ipcRenderer.send('launch-floating-window'),
  onSelectedText: (callback) => {
    if (typeof callback !== 'function') {
      return () => { };
    }

    const channel = 'prefill-selected-text';
    const listener = (_event, payload) => {
      callback(payload);
    };

    ipcRenderer.on(channel, listener);

    return () => {
      ipcRenderer.removeListener(channel, listener);
    };
  },

  onClearSelectedText: (callback) => {
    if (typeof callback !== 'function') {
      return () => { };
    }

    const channel = 'clear-floating-input';
    const listener = () => {
      callback();
    };

    ipcRenderer.on(channel, listener);

    return () => {
      ipcRenderer.removeListener(channel, listener);
    };
  },

  // NEW: Replace selected text functionality
  replaceSelectedText: (plainText, htmlText) => {
    ipcRenderer.send('replace-selected-text', { plainText, htmlText });
  },

  // NEW: Listen for replace operation result
  onReplaceResult: (callback) => {
    if (typeof callback !== 'function') {
      return () => { };
    }

    const channel = 'replace-result';
    const listener = (_event, payload) => {
      callback(payload);
    };

    ipcRenderer.on(channel, listener);

    return () => {
      ipcRenderer.removeListener(channel, listener);
    };
  },

  // NEW: Get source window info
  onSourceWindowInfo: (callback) => {
    if (typeof callback !== 'function') {
      return () => { };
    }

    const channel = 'source-window-info';
    const listener = (_event, payload) => {
      callback(payload);
    };

    ipcRenderer.on(channel, listener);

    return () => {
      ipcRenderer.removeListener(channel, listener);
    };
  },

  // NEW: Auth Sync
  sendAuthStateChange: (isSignedIn) => {
    ipcRenderer.send('auth-state-change', { isSignedIn });
  },

  onSyncAuth: (callback) => {
    if (typeof callback !== 'function') {
      return () => { };
    }
    const channel = 'sync-auth';
    const listener = (_event, payload) => {
      callback(payload);
    };
    ipcRenderer.on(channel, listener);
    return () => {
      ipcRenderer.removeListener(channel, listener);
    };
  },

  // NEW: Listen for Alt+X - New session shortcut
  onNewSession: (callback) => {
    if (typeof callback !== 'function') {
      return () => { };
    }
    const channel = 'floating-new-session';
    const listener = () => {
      callback();
    };
    ipcRenderer.on(channel, listener);
    return () => {
      ipcRenderer.removeListener(channel, listener);
    };
  },

  // NEW: Listen for Alt+C - Copy report shortcut
  onCopyReport: (callback) => {
    if (typeof callback !== 'function') {
      return () => { };
    }
    const channel = 'floating-copy-report';
    const listener = () => {
      callback();
    };
    ipcRenderer.on(channel, listener);
    return () => {
      ipcRenderer.removeListener(channel, listener);
    };
  },

  // NEW: Listen for Alt+Space - Start mic shortcut
  onStartMic: (callback) => {
    if (typeof callback !== 'function') {
      return () => { };
    }
    const channel = 'floating-start-mic';
    const listener = () => {
      callback();
    };
    ipcRenderer.on(channel, listener);
    return () => {
      ipcRenderer.removeListener(channel, listener);
    };
  },
});