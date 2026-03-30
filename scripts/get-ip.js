#!/usr/bin/env node

/**
 * 获取本机 IP 地址工具脚本
 * 
 * 使用方法:
 * node scripts/get-ip.js
 */

import { networkInterfaces } from 'os';

function getLocalIP() {
  const nets = networkInterfaces();
  
  for (const name of Object.keys(nets)) {
    const netArray = nets[name];
    if (!netArray) continue;
    
    for (const net of netArray) {
      // 跳过内部和 IPv6 地址
      const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4;
      if (net.family === familyV4Value && !net.internal) {
        return net.address;
      }
    }
  }
  
  return '127.0.0.1';
}

const ip = getLocalIP();

console.log('\n========================================');
console.log('🌐 本机 IP 地址信息');
console.log('========================================\n');
console.log(`💻 本机 IP: ${ip}`);
console.log(`📱 局域网访问地址：http://${ip}:3000`);
console.log(`🏠 本地访问地址：http://localhost:3000`);
console.log('\n========================================');
console.log('📋 使用说明:');
console.log('========================================');
console.log('1. 确保手机/平板与电脑在同一 WiFi 网络');
console.log('2. 在移动设备浏览器中访问上述 IP 地址');
console.log('3. 如果无法访问，请检查防火墙设置');
console.log('\n🔥 提示：运行 npm run dev 启动开发服务器');
console.log('========================================\n');
