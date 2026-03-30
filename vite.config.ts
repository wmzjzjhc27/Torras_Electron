import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // 使用相对路径，支持 asar 打包环境
  base: './',
  plugins: [
    react(),
  ],
  esbuild: {
    // 生产环境移除 console.log
    drop: ['console'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@types': path.resolve(__dirname, './src/types'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@styles': path.resolve(__dirname, './src/styles'),
    },
  },
  server: {
    port: 3000,
    open: true,
    host: true, // 允许外部访问
    strictPort: false, // 端口被占用时自动尝试下一个可用端口
  },
  build: {
    // 使用 esbuild 压缩（比 terser 快 20-40 倍）
    minify: 'esbuild',
    
    // 关闭 source map（生产环境）
    sourcemap: false,
    
    // CSS 代码分割
    cssCodeSplit: true,
    
    // 资源大小限制警告
    chunkSizeWarningLimit: 500,
    
    // 目标浏览器支持 ESModules
    target: 'esnext',
    
    // 动态导入目录命名
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor';
            }
            if (id.includes('antd') || id.includes('@ant-design')) {
              return 'antd-vendor';
            }
            if (id.includes('three')) {
              return 'three-vendor';
            }
            if (id.includes('axios')) {
              return 'utils-vendor';
            }
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'i18n-vendor';
            }
          }
        },
        // 资源文件命名规则
        assetFileNames: (assetInfo: any) => {
          if (/\.(png|jpe?g|jpg|gif|svg|webp|ico)$/.test(assetInfo.name || '')) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name || '')) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          return `assets/[name]-[hash][extname]`;
        },
        // JS 文件命名规则
        entryFileNames: 'assets/js/[name]-[hash].js',
        chunkFileNames: 'assets/js/[name]-[hash].js',
      },
    },
  },
  optimizeDeps: {
    // 预打包依赖
    include: ['react', 'react-dom', 'react-router-dom', 'antd', '@ant-design/icons', 'axios'],
    exclude: ['three'], // Three.js 太大，不预打包
  },
  css: {
    // CSS 模块化配置
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]___[hash:base64:5]',
    },
    // CSS 预处理器配置
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  // 定义环境变量
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '0.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
})
