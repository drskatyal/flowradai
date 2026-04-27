export interface ElectronAPI {
  minimizeWindow: () => void;
  closeWindow: () => void;
  onSelectedText: (callback: (payload: { text: string; source: string; timestamp: number }) => void) => () => void;
  onClearSelectedText: (callback: () => void) => () => void;
  replaceSelectedText: (plainText: string, htmlText?: string) => void;
  onReplaceResult: (callback: (result: { success: boolean }) => void) => () => void;
  onSourceWindowInfo: (callback: (info: any) => void) => () => void;
}

export interface DesktopAPI {
  version: string;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
    desktop?: DesktopAPI;
  }
}

export { };