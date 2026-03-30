/**
 * 页面布局组件
 * 为所有路由页面提供统一的导航栏和页脚
 * 支持响应式侧边栏布局 - 侧边栏展开时主内容自动收缩
 */

import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { useWindowSize } from "@/hooks/useResponsive";
import { Card } from "antd";
export const PageLayout: React.FC = () => {
  // 侧边栏状态（桌面端）- 从 localStorage 读取保存的状态，默认为 true（展开）
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('sidebar_open');
      console.log('PageLayout 初始化，读取侧边栏状态:', saved);
      return saved !== null ? JSON.parse(saved) : true;
    } catch (error) {
      console.error('读取侧边栏状态失败:', error);
      return true;
    }
  });

  // 响应式断点
  const { isDesktop, isTablet } = useWindowSize();

  // 侧边栏宽度
  const sidebarWidth = 220;

  // 移动端不需要 padding-left，只有桌面端/平板端需要
  const paddingLeft =
    (isDesktop || isTablet) && sidebarOpen ? `${sidebarWidth}px` : "0";

  // 切换侧边栏并保存到 localStorage
  const handleSidebarToggle = (open: boolean) => {
    console.log('PageLayout: 切换侧边栏，新状态:', open);
    setSidebarOpen(open);
    try {
      localStorage.setItem('sidebar_open', JSON.stringify(open));
      console.log('PageLayout: 已保存侧边栏状态到 localStorage:', open);
    } catch (error) {
      console.error('保存侧边栏状态失败:', error);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        overflowX: "hidden", // 只禁止水平溢出
        position: "relative",
      }}
    >
      {/* 顶部导航栏容器 - 固定在顶部 */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "64px",
          zIndex: 1100,
          background:
            "linear-gradient(180deg, rgba(26, 27, 46, 0.95) 0%, rgba(15, 16, 32, 0.95) 100%)", // 与导航栏一致的深色背景
          backdropFilter: "blur(20px)",
        }}
      >
        <Navbar
          sidebarOpen={sidebarOpen}
          onSidebarToggle={handleSidebarToggle}
        />
      </div>

      {/* 页面内容 - 响应式布局 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "row",
          width: "100%",
          paddingTop: "64px", // 整个内容区域从导航栏下方开始
          minHeight: "calc(100vh - 64px)",
          overflow: "hidden", // 防止溢出
          position:'relative'
        }}
      >
        {/* 主内容滚动区域 */}
        <main
          style={{
            flex: 1,
            paddingLeft: paddingLeft,
            transition: "padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            overflowX: "hidden",
            overflowY: "auto", // 允许垂直滚动
            minHeight: "calc(100vh - 64px)",
            boxSizing: "border-box",
          position:'relative',
            maxHeight:'90vh'
          }}
        >
          <div style={{ padding: "20px", minHeight: "100%" }}>
            <Card style={{ width: "100%" }} hoverable>
              <Outlet />
            </Card>
          </div>
        </main>
      </div>

      {/* 底部页脚 - 根据侧边栏状态调整左侧空白 */}
      {/* <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          paddingLeft: paddingLeft,
          transition: "padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 1000,
        }}
      >
        <ResponsiveFooter />
      </div> */}
    </div>
  );
};
