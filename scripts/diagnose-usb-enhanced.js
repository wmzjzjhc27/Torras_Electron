/**
 * 增强的 USB 设备诊断工具 - 支持 libusb-win32
 * 
 * 使用方法：
 * node scripts/diagnose-usb-enhanced.js
 */

import { getDeviceList, UsbDevice } from 'usb';

console.log('🔍 增强版 USB 设备诊断工具 (libusb-win32)\n');
console.log('=' .repeat(60));

// 常见电源设备 Vendor ID
const KNOWN_POWER_VENDORS = {
  '0x0483': 'STMicroelectronics',
  '0x0451': 'Texas Instruments',
  '0x0403': 'FTDI',
  '0x067b': 'Prolific Technology',
  '0x04d9': 'Holtek Semiconductor',
  '0x16c0': 'Van Ooijen Technische Informatica',
  '0x1781': 'Multiple Vendors',
  '0xffff': 'Custom/Development Board'
};

try {
  const devices = getDeviceList();
  
  console.log(`\n发现 ${devices.length} 个 USB 设备\n`);
  
  if (devices.length === 0) {
    console.log('❌ 未检测到任何 USB 设备');
    process.exit(0);
  }
  
  let targetDeviceIndex = -1;
  
  devices.forEach((device, index) => {
    console.log(`${'='.repeat(60)}`);
    console.log(`设备 ${index + 1}:`);
    console.log(`${'='.repeat(60)}`);
    
    const desc = device.deviceDescriptor;
    
    if (!desc) {
      console.log('  ⚠️ 无法获取设备描述符');
      return;
    }
    
    const vendorId = `0x${desc.idVendor.toString(16).padStart(4, '0')}`;
    const productId = `0x${desc.idProduct.toString(16).padStart(4, '0')}`;
    
    console.log(`  📍 索引：${index}`);
    console.log(`  📍 总线编号：${device.busNumber}`);
    console.log(`  📍 设备地址：${device.deviceAddress}`);
    console.log(`  🔖 Vendor ID: ${vendorId}`);
    console.log(`  🔖 Product ID: ${productId}`);
    console.log(`  🏷️ 设备版本：${(desc.bcdDevice / 256).toFixed(2)}`);
    
    // 检查是否是已知厂商
    if (KNOWN_POWER_VENDORS[vendorId]) {
      console.log(`  ✨ 已知厂商：${KNOWN_POWER_VENDORS[vendorId]}`);
      if (vendorId === '0xffff') {
        console.log(`  💡 这可能是目标电源设备！`);
        targetDeviceIndex = index;
      }
    }
    
    // 尝试获取更多信息
    let deviceOpened = false;
    try {
      device.open();
      deviceOpened = true;
      
      if (desc.iManufacturer) {
        try {
          const manufacturer = device.getStringDescriptor(desc.iManufacturer);
          console.log(`  🏭 制造商：${manufacturer || 'N/A'}`);
        } catch (e) {
          console.log(`  🏭 制造商：无法读取`);
        }
      }
      
      if (desc.iProduct) {
        try {
          const product = device.getStringDescriptor(desc.iProduct);
          console.log(`  📦 产品名称：${product || 'N/A'}`);
        } catch (e) {
          console.log(`  📦 产品名称：无法读取`);
        }
      }
      
      if (desc.iSerialNumber) {
        try {
          const serial = device.getStringDescriptor(desc.iSerialNumber);
          console.log(`  🔢 序列号：${serial || 'N/A'}`);
        } catch (e) {
          console.log(`  🔢 序列号：无法读取`);
        }
      }
      
      device.close();
    } catch (e) {
      console.log(`  ⚠️ 打开设备失败：${e.message}`);
      if (e.message.includes('pending request')) {
        console.log(`  💡 提示：设备可能被占用或驱动不兼容`);
      }
    }
    
    // 显示端点信息（关键）
    console.log(`\n  📡 端点信息:`);
    if (!device.endpoints || device.endpoints.length === 0) {
      console.log(`    ⚠️ 未找到端点 - 这可能不是标准 USB 设备`);
    } else {
      device.endpoints.forEach((ep, epIndex) => {
        console.log(`    端点 ${epIndex + 1}:`);
        console.log(`      - 地址：0x${ep.address.toString(16).padStart(2, '0')}`);
        console.log(`      - 方向：${ep.direction}`);
        console.log(`      - 类型：${ep.type}`);
      });
    }
    
    // 显示接口信息
    console.log(`\n  🔌 接口信息:`);
    try {
      const iface = device.interface(0);
      console.log(`    接口 0:`);
      console.log(`      - 编号：${iface.interfaceNumber}`);
      
      if (iface.alt) {
        console.log(`      - 备用设置：${iface.alt.interfaceNumber || 'N/A'}`);
        
        if (iface.alt.endpoints && iface.alt.endpoints.length > 0) {
          console.log(`      - 端点数：${iface.alt.endpoints.length}`);
          iface.alt.endpoints.forEach((ep, idx) => {
            console.log(`        端点 ${idx + 1}: 0x${ep.address.toString(16).padStart(2, '0')}, ${ep.direction}, ${ep.type}`);
          });
        } else {
          console.log(`      - ⚠️ 该接口没有端点`);
        }
      } else {
        console.log(`      - ⚠️ 无备用设置`);
      }
    } catch (e) {
      console.log(`    ⚠️ 无法访问接口：${e.message}`);
    }
    
    console.log('');
  });
  
  // 输出建议
  console.log('=' .repeat(60));
  console.log('\n💡 诊断结论和建议:\n');
  
  if (targetDeviceIndex >= 0) {
    console.log(`✅ 发现可能的目标设备：设备 ${targetDeviceIndex + 1} (0xffff:0xffff)`);
    console.log('\n📋 在代码中使用的配置:');
    console.log(`   vendorId: ${parseInt('ffff', 16)}  // 0xffff`);
    console.log(`   productId: ${parseInt('ffff', 16)}  // 0xffff`);
    console.log(`   endpoint: 0x81  // 默认 IN 端点 1`);
    console.log(`   packetSize: 64  // 默认包大小`);
  } else {
    console.log('⚠️ 未发现典型的电源设备 (0xffff:0xffff)');
    console.log('\n请检查:');
    console.log('1. 设备是否正确连接');
    console.log('2. 是否已安装 libusb-win32 驱动');
    console.log('3. 使用 Zadig 工具重新安装驱动');
  }
  
  console.log('\n🛠️ 下一步操作:');
  console.log('1. 在前端界面选择对应的设备');
  console.log('2. 如果看不到设备，点击"扫描 USB 设备"按钮');
  console.log('3. 查看 Electron 主进程的详细日志');
  console.log('4. 如果仍然失败，尝试重启应用或重新插拔设备');
  
} catch (error) {
  console.error('\n❌ 诊断过程出错:', error.message);
  console.error('\n堆栈跟踪:', error.stack);
  
  if (error.message.includes('LIBUSB_ERROR')) {
    console.error('\n💡 这是底层 USB 错误，可能原因:');
    console.error('1. libusb-win32 驱动未正确安装');
    console.error('2. 设备被其他程序占用');
    console.error('3. 权限不足（尝试以管理员身份运行）');
  }
  
  process.exit(1);
}
