/**
 * USB 设备诊断脚本
 * 
 * 使用方法：
 * node scripts/diagnose-usb.js
 */

import { getDeviceList } from 'usb';

console.log('🔍 USB 设备诊断工具\n');
console.log('=' .repeat(50));

try {
  const devices = getDeviceList();
  
  console.log(`\n发现 ${devices.length} 个 USB 设备\n`);
  
  if (devices.length === 0) {
    console.log('❌ 未检测到任何 USB 设备');
    console.log('\n请检查:');
    console.log('1. USB 设备是否已连接');
    console.log('2. 设备是否供电正常');
    console.log('3. 尝试更换 USB 端口');
    process.exit(0);
  }
  
  devices.forEach((device, index) => {
    console.log(`${'='.repeat(50)}`);
    console.log(`设备 ${index + 1}:`);
    console.log(`${'='.repeat(50)}`);
    
    const desc = device.deviceDescriptor;
    
    if (!desc) {
      console.log('  ⚠️ 无法获取设备描述符');
      return;
    }
    
    console.log(`  📍 总线编号：${device.busNumber}`);
    console.log(`  📍 设备地址：${device.deviceAddress}`);
    console.log(`  🔖 厂商 ID: 0x${desc.idVendor.toString(16).padStart(4, '0')}`);
    console.log(`  🔖 产品 ID: 0x${desc.idProduct.toString(16).padStart(4, '0')}`);
    console.log(`  🏷️  设备版本：${(desc.bcdDevice / 256).toFixed(2)}`);
    
    // 尝试获取字符串描述符
    try {
      device.open();
      
      if (desc.iManufacturer) {
        try {
          const manufacturer = device.getStringDescriptor(desc.iManufacturer);
          console.log(`  🏭 制造商：${manufacturer}`);
        } catch (e) {
          console.log(`  🏭 制造商：无法读取 (${e.message})`);
        }
      }
      
      if (desc.iProduct) {
        try {
          const product = device.getStringDescriptor(desc.iProduct);
          console.log(`  📦 产品名称：${product}`);
        } catch (e) {
          console.log(`  📦 产品名称：无法读取 (${e.message})`);
        }
      }
      
      if (desc.iSerialNumber) {
        try {
          const serial = device.getStringDescriptor(desc.iSerialNumber);
          console.log(`  🔢 序列号：${serial}`);
        } catch (e) {
          console.log(`  🔢 序列号：无法读取 (${e.message})`);
        }
      }
      
      device.close();
    } catch (e) {
      console.log(`  ⚠️ 无法打开设备：${e.message}`);
    }
    
    // 显示端点信息
    console.log(`\n  📡 端点信息:`);
    if (!device.endpoints || device.endpoints.length === 0) {
      console.log('    ⚠️ 未找到端点');
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
      console.log(`      - 备用设置：${iface.alt?.interfaceNumber || 'N/A'}`);
      
      if (iface.alt && iface.alt.endpoints) {
        console.log(`      - 端点数：${iface.alt.endpoints.length}`);
        iface.alt.endpoints.forEach((ep, idx) => {
          console.log(`        端点 ${idx + 1}: 0x${ep.address.toString(16)}, ${ep.direction}, ${ep.type}`);
        });
      }
    } catch (e) {
      console.log(`    ⚠️ 无法访问接口 0: ${e.message}`);
    }
    
    console.log('');
  });
  
  console.log('=' .repeat(50));
  console.log('\n💡 提示:');
  console.log('1. 电源设备通常有特定的 Vendor ID 和 Product ID');
  console.log('2. 常见电源芯片厂商:');
  console.log('   - STMicroelectronics: 0x0483');
  console.log('   - Texas Instruments: 0x0451');
  console.log('   - FTDI: 0x0403');
  console.log('   - Prolific: 0x067b');
  console.log('\n3. 如果看不到设备，请检查驱动是否已安装');
  
} catch (error) {
  console.error('\n❌ 诊断过程出错:', error.message);
  console.error('\n可能的原因:');
  console.error('1. USB 模块未正确安装');
  console.error('2. 权限不足（Linux/Mac 可能需要 sudo）');
  console.error('3. 设备被其他程序占用');
  
  process.exit(1);
}
