import fs from 'fs';
import path from 'path';

/**
 * After Pack 钩子 - 在打包完成后但还没创建安装包之前执行
 * 用于修复 electron-builder 的重命名问题
 */
async function afterPack({ appOutDir, packager, electronPlatformName }) {
  console.log(`AfterPack: 处理 ${electronPlatformName} 平台的打包产物`);
  console.log(`输出目录：${appOutDir}`);
  
  if (electronPlatformName !== 'win32') {
    console.log('非 Windows 平台，跳过处理');
    return; // 只处理 Windows 平台
  }

  const oldPath = path.join(appOutDir, 'electron.exe');
  const newPath = path.join(appOutDir, 'EmbeddedUSBApp.exe');

  // 检查目标文件是否已存在
  if (fs.existsSync(newPath)) {
    console.log('✅ EmbeddedUSBApp.exe 已存在，无需重命名');
    return;
  }

  // 检查 electron.exe 是否存在
  if (fs.existsSync(oldPath)) {
    console.log(`发现 electron.exe，准备重命名为 EmbeddedUSBApp.exe`);
    try {
      await fs.promises.rename(oldPath, newPath);
      console.log('✅ 重命名成功!');
    } catch (error) {
      console.error('❌ 重命名失败:', error.message);
      throw error;
    }
  } else {
    console.log('⚠️ 警告：electron.exe 不存在');
    console.log('目录内容:', fs.readdirSync(appOutDir));
    
    // 查找任何 .exe 文件
    const exeFiles = fs.readdirSync(appOutDir).filter(f => f.endsWith('.exe'));
    if (exeFiles.length > 0) {
      console.log('找到的 .exe 文件:', exeFiles);
    } else {
      console.log('⚠️ 没有找到任何 .exe 文件');
    }
  }
}

export default afterPack;
