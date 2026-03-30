import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { pathToFileURL } from 'url';

// 获取 __dirname 的 ES Module 兼容写法
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 检查是否为开发模式
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

// 创建主窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false, // 禁用 Node 集成以提高安全性
      contextIsolation: true, // 启用上下文隔离
      preload: path.join(__dirname, 'preload.js'), // 预加载脚本
      webviewTag: true, // 启用 webview 标签
    },
    icon: path.join(__dirname, '../build/icon.png'),
    autoHideMenuBar: true, // 自动隐藏菜单栏（文件、编辑、视图等）
    titleBarStyle: 'default',
    frame: true,
    backgroundColor: '#0a0e21',
  });

  // 加载应用
  if (isDev) {
    // 开发模式：加载 Vite 开发服务器
    mainWindow.loadURL('http://localhost:3000');
    // 自动打开开发者工具
    mainWindow.webContents.openDevTools();
  } else {
    // 生产模式：加载 app.asar 中的 dist/index.html
    const appPath = app.getAppPath();
    console.log('应用路径:', appPath);
    const indexPath = path.join(appPath, 'dist', 'index.html');
    console.log('Index 路径:', indexPath);

    // 使用 file:// URL 的方式加载
    const indexURL = pathToFileURL(indexPath).href;
    console.log('Index URL:', indexURL);
    
    // 关键：设置正确的 referrer 和 base URL
    mainWindow.loadURL(indexURL, {
      extraHeaders: 'Content-Security-Policy: default-src * \'self\' \'unsafe-inline\' \'unsafe-eval\'; script-src * \'unsafe-inline\' \'unsafe-eval\'; connect-src * \'unsafe-inline\'; img-src * data: blob: \'unsafe-inline\'; frame-src *; style-src * \'unsafe-inline\';'
    });
  }

  // 窗口关闭时清空引用
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 当 Electron 完成初始化时创建窗口
app.whenReady().then(() => {
  createWindow();
  // 监听前端发来的 USB 设备列表请求
  ipcMain.handle('get-usb-devices', async () => {
    try {
      // 动态导入 usb 模块（支持 ES Module）
      const usbModule = await import('usb');
      const usb = usbModule.default || usbModule;
      console.log(usb, 'usb信息数据');

      const devices = usb.getDeviceList();

      const deviceInfo = devices.map((dev) => {
        const desc = dev.deviceDescriptor;
        
        // 获取设备类、子类和协议
        const deviceClass = dev.deviceDescriptor?.bDeviceClass || 0;
        const deviceSubClass = dev.deviceDescriptor?.bDeviceSubClass || 0;
        const deviceProtocol = dev.deviceDescriptor?.bDeviceProtocol || 0;
        
        // 根据设备类判断驱动类型
        let driverType = 'USB';
        let driverName = '';
        
        // USB 设备类驱动映射
        const driverMap = {
          0x01: { type: '音频驱动', name: 'usb_audio.sys' },
          0x02: { type: '通信驱动', name: 'usbser.sys / cdc_acm.sys' },
          0x03: { type: 'HID 驱动', name: 'hidclass.sys / usbhid.sys' },
          0x06: { type: '图像驱动', name: 'uvcvideo.sys / usb_video_class.sys' },
          0x07: { type: '打印驱动', name: 'usbprint.sys' },
          0x08: { type: '大容量存储驱动', name: 'usbstor.sys' },
          0x09: { type: 'Hub 驱动', name: 'usbhub.sys' },
          0x0E: { type: '视频驱动', name: 'uvc.sys' },
          0xE0: { type: '无线驱动', name: 'usb_bluetooth.sys' },
          0xFF: { type: '供应商特定驱动', name: '厂商自定义驱动' }
        };
        
        if (driverMap[deviceClass]) {
          driverType = driverMap[deviceClass].type;
          driverName = driverMap[deviceClass].name;
        } else if (deviceClass === 0 && desc) {
          // 类为 0 时，可能是复合设备，使用默认驱动
          driverType = 'USB 复合设备驱动';
          driverName = 'usbccgp.sys (Windows) / usbcore (Linux)';
        }
        
        const deviceData = {
          busNumber: dev.busNumber,
          deviceAddress: dev.deviceAddress,
          deviceVersion: desc && `${desc.bcdDevice.toString(16)}`,
          idProduct: desc && `0x${desc.idProduct.toString(16).padStart(4, '0')}`,
          idVendor: desc && `0x${desc.idVendor.toString(16).padStart(4, '0')}`,
          manufacturer: desc ? desc.iManufacturer : null,
          product: desc ? desc.iProduct : null,
          serialNumber: desc ? desc.iSerialNumber : null,
          deviceClass: deviceClass,
          deviceSubClass: deviceSubClass,
          driverType: driverType,
          driverName: driverName
        };
        
        // 打印每个设备的详细信息到控制台
        console.log(`\n========== USB 设备 #${dev.busNumber}-${dev.deviceAddress} ==========`);
        console.log('📌 基本信息:');
        console.log(`   总线号：${dev.busNumber}`);
        console.log(`   设备地址：${dev.deviceAddress}`);
        console.log(`   厂商 ID: ${deviceData.idVendor}`);
        console.log(`   产品 ID: ${deviceData.idProduct}`);
        console.log(`   设备版本：${deviceData.deviceVersion}`);
        console.log(`   制造商索引：${desc?.iManufacturer || 'N/A'}`);
        console.log(`   产品索引：${desc?.iProduct || 'N/A'}`);
        console.log(`   序列号索引：${desc?.iSerialNumber || 'N/A'}`);
        
        console.log('\n🎯 驱动信息:');
        console.log(`   驱动类型：${driverType}`);
        console.log(`   驱动名称：${driverName}`);
        console.log(`   设备类代码：0x${deviceClass.toString(16).toUpperCase().padStart(2, '0')}`);
        console.log(`   设备子类代码：0x${deviceSubClass.toString(16).toUpperCase().padStart(2, '0')}`);
        console.log(`   设备协议代码：0x${deviceProtocol.toString(16).toUpperCase().padStart(2, '0')}`);
        console.log('===========================================\n');
        
        return deviceData;
      });
      console.log('USB 设备列表:', deviceInfo);
      return { success: true, devices: deviceInfo };
    } catch (error) {
      console.error('获取 USB 设备失败:', error);
      return { success: false, error: error.message };
    }
  });

  // 监听前端发来的读取设备信息请求
  ipcMain.handle('read-device-data', async (event, deviceConfig) => {
    // const usbModule = await import('usb');
    // const usb = usbModule.default || usbModule;
    // const device = usb.findByIds(0xffff, 0xffff);
    // if (!device) {
    //   throw new Error('设备未找到');
    // }
    // device.open();
    // const iface = device.interfaces[0];
    // iface.claim();
    // const endpointIn = iface.endpoints.find(e => e.direction === 'in');
    // const endpointOut = iface.endpoints.find(e => e.direction === 'out');
    // // 监听数据
    // endpointIn.on('data', (data) => {
    //   console.log('收到数据:', data);
    // });
    // // 开始轮询
    // endpointIn.startPoll(1, 64);
    // // 👉 发送初始化指令（非常关键）
    // if (endpointOut) {
    //   endpointOut.transfer(Buffer.from([0x01]), (err) => {
    //     if (err) console.error(err);
    //     else console.log('初始化指令已发送');
    //   });
    // }



    // return
    try {
      console.log('\n========== 开始读取 USB 设备 ==========');
      console.log('收到的设备配置:', deviceConfig);

      const usbModule = await import('usb');
      const usb = usbModule.default || usbModule;
      const getDeviceList = usb.getDeviceList;
      const devices = getDeviceList();

      console.log('当前系统上的 USB 设备总数:', devices.length);

      // 显示所有设备信息
      // devices.forEach((dev, idx) => {
      //   const desc = dev.deviceDescriptor;
      //   if (desc) {
      //     const deviceInfo = {
      //       busNumber: dev.busNumber,
      //       deviceAddress: dev.deviceAddress,
      //       idVendor: `0x${desc.idVendor.toString(16).padStart(4, '0')}`,
      //       idProduct: `0x${desc.idProduct.toString(16).padStart(4, '0')}`
      //     };

      //     // 添加端点信息 - 改进的端点检测
      //     try {
      //       // 临时打开设备以获取端点信息（仅在扫描时）
      //       dev.open();

      //       // 尝试获取接口和备用设置的端点
      //       let endpointsFound = [];
      //       const maxInterfaces = Math.min(8, dev.interfaces?.length || 0);

      //       for (let i = 0; i < maxInterfaces; i++) {
      //         try {
      //           const iface = dev.interface(i);
      //           if (iface && iface.altSetting && Array.isArray(iface.altSetting)) {
      //             for (let j = 0; j < iface.altSetting.length; j++) {
      //               const alt = iface.altSetting[j];
      //               if (alt.endpoints && Array.isArray(alt.endpoints)) {
      //                 alt.endpoints.forEach(ep => {
      //                   endpointsFound.push({
      //                     address: ep.address,
      //                     direction: ep.direction || 'unknown',
      //                     type: ep.type || 'unknown'
      //                   });
      //                 });
      //               }
      //             }
      //           }
      //         } catch (ifaceError) {
      //           // 跳过无法访问的接口
      //         }
      //       }

      //       if (endpointsFound.length > 0) {
      //         deviceInfo.endpoints = endpointsFound;
      //       } else {
      //         deviceInfo.endpoints = '无可用端点';
      //       }

      //       dev.close();
      //     } catch (epError) {
      //       try { dev.close(); } catch (e) { }
      //       console.log(`设备 ${idx} 端点检测失败:`, epError.message);
      //       deviceInfo.endpoints = `检测失败：${epError.message}`;
      //     }

      //     console.log(`设备 ${idx}:`, deviceInfo);
      //   }
      // });

      // 根据配置查找设备 - 改进的查找逻辑
      let targetDevice = null;

      // 方法 1: 精确匹配 Vendor ID 和 Product ID
      if (deviceConfig.vendorId && deviceConfig.productId) {
        targetDevice = devices.find((dev) => {
          const desc = dev.deviceDescriptor;
          return desc &&
            desc.idVendor === parseInt(deviceConfig.vendorId) &&
            desc.idProduct === parseInt(deviceConfig.productId);
        });

        if (targetDevice) {
          console.log('\n通过 Vendor/Product ID 找到设备');
        }
      }

      // 方法 2: 如果方法 1 失败，尝试只匹配 Vendor ID
      if (!targetDevice && deviceConfig.vendorId) {
        console.log('\n精确匹配失败，尝试只匹配 Vendor ID...');
        targetDevice = devices.find((dev) => {
          const desc = dev.deviceDescriptor;
          return desc && desc.idVendor === parseInt(deviceConfig.vendorId);
        });

        if (targetDevice) {
          console.log('通过 Vendor ID 找到设备（宽松匹配）');
        }
      }

      // 方法 3: 如果没有指定 Vendor ID，使用第一个可用的设备
      if (!targetDevice && !deviceConfig.vendorId && devices.length > 0) {
        console.log('\n未指定 Vendor ID，使用第一个设备');
        targetDevice = devices[0];
      }

      console.log('\n找到的目标设备:', targetDevice ? '成功' : '失败');

      if (!targetDevice) {
        const errorMsg = [
          '未找到指定的 USB 设备',
          '',
          '请检查以下项目:',
          '1. 设备是否已正确连接',
          '2. libusb-win32 驱动是否已安装（使用 Zadig 工具）',
          '3. Vendor ID 和 Product ID 是否正确',
          '',
          `配置的 VendorId: ${deviceConfig.vendorId || '未指定'}`,
          `配置的 ProductId: ${deviceConfig.productId || '未指定'}`,
          '',
          '当前可用设备列表:',
          ...devices.map((dev, idx) => {
            const desc = dev.deviceDescriptor;
            return `  ${idx + 1}. ${desc ? `0x${desc.idVendor.toString(16)}:0x${desc.idProduct.toString(16)}` : '未知设备'}`;
          }).join('\n'),
          '',
          '建议：',
          '- 重新插拔 USB 设备',
          '- 以管理员身份运行应用',
          '- 关闭其他可能占用该设备的软件'
        ].join('\n');

        console.error(errorMsg);
        throw new Error(errorMsg);
      }

      // 打开设备（带重试机制）
      let openSuccess = false;
      let openAttempts = 0;
      const maxOpenAttempts = 3;

      while (!openSuccess && openAttempts < maxOpenAttempts) {
        try {
          openAttempts++;
          console.log(`尝试打开设备 (第 ${openAttempts}/${maxOpenAttempts} 次)...`);
          targetDevice.open();
          openSuccess = true;
          console.log('设备已打开');
        } catch (openError) {
          console.warn(`打开设备失败：${openError.message}`);
          if (openAttempts < maxOpenAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100)); // 等待 100ms 后重试
          }
        }
      }

      if (!openSuccess) {
        throw new Error(`无法打开设备，已尝试 ${maxOpenAttempts} 次`);
      }

      // 选择配置（如果设备没有配置）
      if (!targetDevice.configuration) {
        console.log('设备未选择配置，正在选择配置 1...');
        try {
          await targetDevice.selectConfiguration(1);
          console.log('✅ 配置 1 已选择');
        } catch (configError) {
          console.warn('⚠️ 选择配置失败:', configError.message);
          // 某些设备可能不需要显式选择配置
        }
      } else {
        console.log('设备已有配置:', targetDevice.configuration.value);
      }

      // 获取第一个接口
      let iface;
      try {
        iface = targetDevice.interface(0);
        console.log('获取接口 0 成功');
      } catch (ifaceError) {
        throw new Error(`无法获取设备接口：${ifaceError.message}`);
      }

      // 尝试分离内核驱动（如果需要）
      try {
        if (iface.isKernelDriverActive()) {
          iface.detachKernelDriver();
          console.log('已分离内核驱动');
        }
      } catch (e) {
        console.log('无需分离内核驱动或已分离:', e.message);
      }

      // 声明接口
      iface.claim();
      console.log('接口已声明');

      // ✅ 使用简单直接的方式读取数据（基于第 94-117 行的正确实现）
      console.log('\n=== 开始读取 USB 设备数据 ===');
      
      // 查找输入和输出端点
      const endpointIn = iface.endpoints.find(e => e.direction === 'in');
      const endpointOut = iface.endpoints.find(e => e.direction === 'out');
      
      if (!endpointIn) {
        throw new Error('未找到输入端点');
      }
      
      console.log('输入端点:', endpointIn);
      console.log('输出端点:', endpointOut ? endpointOut : '未找到');
      
      // 设置数据监听器
      let receivedData = null;
      endpointIn.on('data', (data) => {
        console.log('📦 收到数据:', data);
        console.log('数据长度:', data.length);
        console.log('十六进制:', Array.from(data).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' '));
        
        if (!receivedData) {
          receivedData = data;
        }
      });
      
      // 开始轮询（每 1ms 读取 64 字节）
      console.log('⏱️ 开始轮询...');
      endpointIn.startPoll(1, 64);
      
      // 发送初始化指令（非常关键）
      if (endpointOut) {
        console.log('📤 发送初始化指令 [0x01]...');
        await new Promise((resolve, reject) => {
          endpointOut.transfer(Buffer.from([0x01]), (err) => {
            if (err) {
              console.error('❌ 发送初始化指令失败:', err);
              reject(err);
            } else {
              console.log('✅ 初始化指令已发送');
              resolve(true);
            }
          });
        });
      } else {
        console.log('⚠️ 未找到输出端点，跳过初始化指令');
      }
      
      // 等待数据接收（最多等待 2 秒）
      console.log('⏳ 等待数据接收...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 停止轮询
      console.log('⏹️ 停止轮询');
      endpointIn.stopPoll();
      
      // 如果没有通过事件接收到数据，尝试主动读取一次
      let data;
      if (!receivedData) {
        console.log('⚠️ 未通过事件接收到数据，尝试主动读取...');
        data = await new Promise((resolve, reject) => {
          endpointIn.transfer(64, (error, data) => {
            if (error) {
              console.error('端点传输失败:', error);
              reject(error);
            } else {
              console.log('读取到的原始数据:', data);
              resolve(data);
            }
          });
        });
      } else {
        data = receivedData;
      }
      
      console.log('✅ 数据传输完成，准备关闭设备');

      // 转换为 Uint8Array
      const uint8Data = new Uint8Array(data);
      console.log('读取的数据:', Array.from(uint8Data));

      // 打印十六进制和ASCII格式，方便调试
      const hexString = Array.from(uint8Data).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
      console.log('十六进制:', hexString);

      // 尝试解析常见协议格式
      if (uint8Data.length >= 4) {
        // 检查是否包含帧头（如 A5 5A）
        for (let i = 0; i < uint8Data.length - 1; i++) {
          if (uint8Data[i] === 0xA5 && uint8Data[i + 1] === 0x5A) {
            console.log(`\n📦 检测到帧头 A5 5A @位置 ${i}:`);
            console.log(`  帧头区域：${hexString.substring(i * 3, (i + 16) * 3)}`);

            // 尝试解析遥测数据（基于 Android 日志格式）
            if (uint8Data.length >= 16) {
              // 假设 SOC 在某个偏移位置（需要根据实际协议调整）
              const socOffset = 9; // 示例偏移
              const voltageOffset = 10; // 示例偏移
              const currentOffset = 12; // 示例偏移

              if (uint8Data.length > Math.max(socOffset, voltageOffset, currentOffset)) {
                const soc = uint8Data[socOffset];
                const voltageRaw = (uint8Data[voltageOffset + 1] << 8) | uint8Data[voltageOffset];
                const voltage = (voltageRaw / 100).toFixed(2); // 假设单位是 0.01V
                const currentRaw = ((uint8Data[currentOffset + 1] << 8) | uint8Data[currentOffset]);
                const current = (currentRaw - 32768) / 100; // 假设有符号，单位 0.01A

                console.log(`\n⚡ 遥测数据解析:`);
                console.log(`  SOC: ${soc}%`);
                console.log(`  Voltage: ${voltage}V`);
                console.log(`  Current: ${current.toFixed(2)}A`);
              }
            }
            break;
          }
        }
      }

      // 关闭设备（带重试机制）
      try {
        iface.release(true);
        console.log('接口已释放');

        // 等待一小段时间确保 pending 请求完成
        await new Promise(resolve => setTimeout(resolve, 100));  

        targetDevice.close();
        console.log('✅ 设备已关闭');
      } catch (closeError) {
        console.warn('⚠️ 关闭设备时出错:', closeError.message);
        console.warn('尝试强制关闭...');

        // 如果是因为 pending request，等待后重试
        if (closeError.message.includes('pending')) {
          await new Promise(resolve => setTimeout(resolve, 500));
          try {
            targetDevice.close();
            console.log('✅ 设备已强制关闭');
          } catch (retryError) {
            console.warn('仍然无法关闭设备，但数据已成功读取:', retryError.message);
          }
        } else {
          throw closeError;
        }
      }

      return {
        success: true,
        data: Array.from(uint8Data),
        hexData: Array.from(uint8Data).map(b => b.toString(16).padStart(2, '0')).join(' '),
        // 添加解析后的数据（如果有）
        parsedData: uint8Data.length >= 16 ? {
          soc: uint8Data[9],
          voltage: (((uint8Data[11] << 8) | uint8Data[10]) / 100).toFixed(2),
          current: ((((uint8Data[13] << 8) | uint8Data[12]) - 32768) / 100).toFixed(2)
        } : null
      };
    } catch (error) {
      console.error('读取设备数据失败:', error);
      return { success: false, error: error.message };
    }
  });

  // 监听退出应用
  ipcMain.on('quit-app', () => {
    app.quit();
  });
});

// macOS 专属：当点击 dock 图标且没有窗口时重新创建窗口
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 所有窗口关闭时退出应用（Windows/Linux）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
