const { contextBridge, ipcRenderer } = require('electron');

// 在渲染进程中暴露安全的 API
contextBridge.exposeInMainWorld('electronAPI', {
  // 获取 USB 设备列表
  getUsbDevices: () => ipcRenderer.invoke('get-usb-devices'),
  
  // 读取指定设备的数据
  readDeviceData: (deviceConfig) => ipcRenderer.invoke('read-device-data', deviceConfig),
  
  // 退出应用
  quitApp: () => ipcRenderer.send('quit-app'),
  
  // 检查是否为 Electron 环境
  isElectron: true,
});
