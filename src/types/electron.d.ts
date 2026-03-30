// Electron API 类型定义
export interface ParsedData {
  soc: number;
  voltage: number;
  current: number;
}

export interface ElectronAPI {
  isElectron: boolean;
  getUsbDevices: () => Promise<{
    success: boolean;
    devices?: any[];
    error?: string;
  }>;
  readDeviceData: (config: {
    vendorId: number;
    productId: number;
    endpoint: number;
    packetSize: number;
  }) => Promise<{
    success: boolean;
    data?: number[];
    hexData?: string;
    parsedData?: ParsedData;
    error?: string;
  }>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};