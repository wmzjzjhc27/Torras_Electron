import sharp from 'sharp';
import sharpIco from 'sharp-ico';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 源图标路径
const sourceIcon = path.join(__dirname, '../src/assets/images/logo.png');

// 输出目录
const buildDir = path.join(__dirname, '../build');

// 确保 build 目录存在
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
  console.log('✅ 创建 build 目录');
}

async function generateIcons() {
  try {
    // 检查源图标是否存在
    if (!fs.existsSync(sourceIcon)) {
      console.error(`❌ 源图标不存在：${sourceIcon}`);
      return;
    }

    console.log('🎨 开始生成图标...');
    console.log(`📁 源文件：${sourceIcon}`);

    // 读取源图片信息
    const metadata = await sharp(sourceIcon).metadata();
    console.log(`📊 源图片尺寸：${metadata.width}x${metadata.height}px`);

    // 1. 生成 Windows ICO (多分辨率)
    console.log('\n📦 生成 Windows ICO (多分辨率)...');
    
    // 生成多个尺寸的 PNG 用于合成 ICO
    const sizes = [16, 32, 48, 64, 128, 256];
    const pngBuffers = [];
    
    for (const size of sizes) {
      const buffer = await sharp(sourceIcon)
        .resize(size, size, { fit: 'fill' })
        .png()
        .toBuffer();
      pngBuffers.push(buffer);
      console.log(`  ✅ ${size}x${size} PNG`);
    }
    
    // 使用 sharp-ico 生成 ICO 文件
    const icoBuffer = sharpIco.encode(pngBuffers, {
      sizes: sizes.map(s => ({ width: s, height: s }))
    });
    
    fs.writeFileSync(path.join(buildDir, 'icon.ico'), icoBuffer);
    console.log('✅ icon.ico (包含所有尺寸)');

    // 2. 生成 macOS ICNS (先生成 PNG)
    console.log('\n🍎 生成 macOS/PNG 图标...');
    await sharp(sourceIcon)
      .resize(512, 512)
      .png()
      .toFile(path.join(buildDir, 'icon.png'));
    console.log('✅ icon.png (512x512)');

    // 为 macOS 生成 icns (临时方案)
    await sharp(sourceIcon)
      .resize(512, 512)
      .png()
      .toFile(path.join(buildDir, 'icon.icns'));
    console.log('✅ icon.icns (512x512, 临时方案)');

    // 3. 生成开发环境使用的图标
    const publicDir = path.join(__dirname, '../public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    await sharp(sourceIcon)
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'vite.png'));
    console.log('✅ vite.png (32x32, 用于开发环境)');

    // 4. 生成 PWA 触摸图标
    await sharp(sourceIcon)
      .resize(192, 192)
      .png()
      .toFile(path.join(publicDir, 'icon-192.png'));
    console.log('✅ icon-192.png (192x192, PWA 触摸图标)');

    console.log('\n✨ 所有图标生成完成！');
    console.log('\n📂 生成的文件位置:');
    console.log('   build/icon.ico      - Windows 打包图标 (多分辨率)');
    console.log('   build/icon.icns     - macOS 打包图标');
    console.log('   build/icon.png      - Linux 打包图标');
    console.log('   public/vite.png     - 开发环境浏览器标签图标');
    console.log('   public/icon-192.png - PWA 触摸图标');

  } catch (error) {
    console.error('❌ 生成图标失败:', error);
    process.exit(1);
  }
}

generateIcons();
