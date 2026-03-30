/**
 * 响应式导航栏组件
 * 包含顶部导航栏和左侧可折叠侧边栏
 */
import { useI18n } from "@/hooks/useI18n";
import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useWindowSize } from "@/hooks/useResponsive";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Modal, Button, message, Avatar, Tag, Divider, Space } from "antd";
import {
  BarsOutlined,
  CloseOutlined,
  RightCircleFilled,
  LeftCircleFilled,
  SettingOutlined,
  PieChartOutlined,
  FileSearchOutlined,
  LaptopOutlined,
  GlobalOutlined,
  CaretDownOutlined,
  UserOutlined,
  LogoutOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  SafetyCertificateOutlined,
  ClockCircleOutlined,
  StarOutlined,
} from "@ant-design/icons";

interface NavbarProps {
  sidebarOpen?: boolean;
  onSidebarToggle?: (open: boolean) => void;
}
export const Navbar: React.FC<NavbarProps> = ({
  sidebarOpen: parentSidebarOpen,
  onSidebarToggle,
}) => {
  const { t } = useI18n();
  const { isMobile, isTablet, isDesktop } = useWindowSize();
  const [menuOpen, setMenuOpen] = useState(false);
  
  // 从 localStorage 读取保存的侧边栏状态，默认为 true（展开）
  const [localSidebarOpen, setLocalSidebarOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('sidebar_open');
      console.log('初始化侧边栏状态，localStorage 值:', saved);
      return saved !== null ? JSON.parse(saved) : true;
    } catch (error) {
      console.error('读取侧边栏状态失败:', error);
      return true;
    }
  });
  
  const sidebarOpen =
    parentSidebarOpen !== undefined ? parentSidebarOpen : localSidebarOpen;
  const location = useLocation();
  const navigate = useNavigate(); // 用于路由跳转

  // 用户信息弹窗状态
  const [userInfoModalVisible, setUserInfoModalVisible] = useState(false);

  // 模拟用户数据（实际应从 useAuth 或 localStorage 获取）
  const currentUser = {
    username: "张伟",
    role: "系统管理员",
    email: "zhangwei@example.com",
    phone: "138****8888",
    department: "技术部",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=b6e3f4",
  };

  // 关闭菜单的辅助函数
  const closeMenu = () => setMenuOpen(false);

  // 切换菜单状态
  const toggleMenu = () => setMenuOpen(!menuOpen);

  // 导航链接数据
  const navLinks = [
    {
      to: "/home",
      label: t("nav.dashboard"),
      icon: <PieChartOutlined style={{ fontSize: "18px" }} />,
      hasSubmenu: false,
      children: [],
    },
    {
      to: "/help",
      label: t("nav.help"),
      icon: <GlobalOutlined style={{ fontSize: "18px" }} />,
      hasSubmenu: false,
      children: [],
    },
    {
      to: "/devices",
      label: t("nav.devices"),
      icon: <LaptopOutlined style={{ fontSize: "18px" }} />,
      hasSubmenu: true,
      children: [
        { to: "/devices/list", label: t("nav.deviceList") },
        { to: "/devices/monitor", label: t("nav.deviceMonitor") },
        { to: "/devices/maintenance", label: t("nav.maintenanceRecord") },
      ],
    },
    {
      to: "/logs",
      label: t("nav.journal"),
      icon: <FileSearchOutlined style={{ fontSize: "18px" }} />,
      hasSubmenu: true,
      children: [
        { to: "/logs/system", label: t("nav.systemLogs") },
        { to: "/logs/operation", label: t("nav.operationLogs") },
        { to: "/logs/error", label: t("nav.errorLogs") },
      ],
    },
    {
      to: "/settings",
      label: t("nav.settings"),
      icon: <SettingOutlined style={{ fontSize: "18px" }} />,
      hasSubmenu: true,
      children: [
        { to: "/settings/general", label: t("nav.generalSettings") },
        { to: "/settings/security", label: t("nav.securitySettings") },
        { to: "/settings/network", label: t("nav.networkSettings") },
      ],
    },
  ];

  // 二级菜单展开状态
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(
    {}
  );

  // 切换二级菜单展开/收起
  const toggleSubmenu = (menuKey: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

  // 切换侧边栏（当有父组件传入的状态时，由父组件管理 localStorage）
  const toggleSidebar = () => {
    const newOpen = !sidebarOpen;
    console.log('切换侧边栏，新状态:', newOpen, '当前 sidebarOpen:', sidebarOpen);
    
    // 如果使用父组件的状态
    if (parentSidebarOpen !== undefined) {
      if (onSidebarToggle) {
        onSidebarToggle(newOpen);
      }
    } else {
      // 使用本地状态并保存到 localStorage
      setLocalSidebarOpen(newOpen);
      try {
        localStorage.setItem('sidebar_open', JSON.stringify(newOpen));
        console.log('已保存侧边栏状态到 localStorage:', newOpen);
      } catch (error) {
        console.error('保存侧边栏状态失败:', error);
      }
      if (onSidebarToggle) {
        onSidebarToggle(newOpen);
      }
    }
  };

  // 退出登录处理
  const handleLogout = () => {
    try {
      // 清除本地存储
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_info");

      console.log(t('auth.logoutSuccess'));

      // 关闭弹窗
      setUserInfoModalVisible(false);

      // 跳转到登录页
      navigate("/login", { replace: true });

      // 显示成功提示
      message.success({
        content: t('auth.logoutSuccess'),
        duration: 2,
        style: {
          marginTop: "80px",
        },
      });
    } catch (error) {
      console.error(t('auth.logoutFailed'), error);
      // 即使出错也跳转到登录页
      navigate("/login", { replace: true });
    }
  };

  // 打开用户信息弹窗
  const handleShowUserInfo = () => {
    setUserInfoModalVisible(true);
    // 禁止 body 滚动
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
  };

  // 关闭用户信息弹窗
  const handleCloseUserInfo = () => {
    setUserInfoModalVisible(false);
    // 恢复 body 滚动
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.width = "";
  };

  return (
    <>
      {/* ===== 用户信息弹窗滚动条样式 ===== */}
      <style>{`
        .user-info-modal .ant-modal-body {
          padding: 0 !important;
        }
        
        /* 自定义滚动条样式 - Webkit 浏览器 */
        .user-info-modal .ant-modal-body::-webkit-scrollbar {
          width: 6px;
        }
        
        .user-info-modal .ant-modal-body::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        
        .user-info-modal .ant-modal-body::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 3px;
          transition: all 0.3s ease;
        }
        
        .user-info-modal .ant-modal-body::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
          box-shadow: 0 0 8px rgba(102, 126, 234, 0.4);
        }
        
        /* Firefox 滚动条样式 */
        .user-info-modal .ant-modal-body {
          scrollbar-width: thin;
          scrollbar-color: #667eea #f1f1f1;
        }
        
        /* 禁止 body 滚动时的样式 */
        body.modal-open {
          overflow: hidden;
          position: fixed;
          width: 100%;
        }
      `}</style>

      {/* ===== 顶部导航栏 ===== */}
      <nav
        className="container-fluid p-0"
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(180deg, rgba(26, 27, 46, 0.95) 0%, rgba(15, 16, 32, 0.95) 100%)", // 与侧边栏一致的深邃蓝黑渐变
          backdropFilter: "blur(20px) saturate(160%)", // 毛玻璃效果
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)", // 微妙边框
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.3)", // 深邃阴影
        }}
      >
        <div className="container">
          <div
            className="flex justify-between align-center"
            style={{ height: "64px", display: "flex" }}
          >
            {/* Logo / 品牌名称 + 移动端汉堡菜单 */}
            <div
              className="flex align-center gap-3"
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 20px",
              }}
            >
              <NavLink
                to="/"
                onClick={closeMenu}
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "var(--font-size-large)",
                  fontWeight: "bold",
                  color: "#ffffff", // 白色文字适配深色背景
                  textDecoration: "none",
                  textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)", // 微妙文字阴影
                }}
              >
                🚀 Embedded System
              </NavLink>
              {/* 移动端汉堡菜单按钮 */}
              {isMobile && (
                <button
                  onClick={toggleMenu}
                  className="p-2"
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "24px",
                    color: "#ffffff", // 白色图标
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))", // 图标阴影
                  }}
                  aria-label="切换菜单"
                >
                  {!menuOpen ? (
                    <BarsOutlined style={{ fontSize: "30px" }} />
                  ) : (
                    <CloseOutlined style={{ fontSize: "30px" }} />
                  )}
                </button>
              )}
              {/* 桌面端导航菜单 + 语言切换 */}
              {!isMobile && (
                <div className="flex gap-3 align-center">
                  {/* 语言切换器 - 深色风格 */}
                  <LanguageSwitcher
                    variant="dropdown"
                    size="small"
                    theme="dark"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ===== 移动端下拉菜单 (从右到左滑入) ===== */}
      {isMobile && (
        <>
          {/* 遮罩层 - 高级毛玻璃效果 */}
          <div
            className={`mobile-menu-overlay ${
              menuOpen ? "overlay-visible" : "overlay-hidden"
            }`}
            style={{
              position: "fixed",
              top: "64px",
              left: "0",
              right: "0",
              bottom: "0",
              width: "100%",
              height: "calc(100vh - 64px)",
              zIndex: 1200,
              background: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(12px) saturate(180%)",
              WebkitBackdropFilter: "blur(12px) saturate(180%)",
              transition:
                "opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
              opacity: menuOpen ? 1 : 0,
              visibility: menuOpen ? "visible" : "hidden",
            }}
            onClick={closeMenu}
          >
            {/* 菜单面板 - 现代化抽屉设计 */}
            <div
              className={`mobile-menu-panel ${
                menuOpen ? "menu-visible" : "menu-hidden"
              }`}
              style={{
                position: "absolute",
                top: "0",
                right: "0",
                width: "100%", // 使用百分比避免固定宽度导致的留白
                maxWidth: "420px",
                height: "100%",
                background: "#fafafa",
                overflowY: "auto",
                overflowX: "hidden",
                transition:
                  "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                transform: menuOpen ? "translateX(0)" : "translateX(100%)",
                opacity: menuOpen ? 1 : 0,
                visibility: menuOpen ? "visible" : "hidden",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 菜单头部 - 沉浸式渐变背景 */}

              {/* 导航链接区域 - 卡片式设计 */}
              <div
                style={{
                  padding: "24px 20px",
                  background: "#ffffff",
                  borderRadius: "20px",
                  margin: "16px 16px 0",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "18px",
                  }}
                >
                  <div
                    style={{
                      width: "4px",
                      height: "20px",
                      background:
                        "linear-gradient(180deg, #667eea 0%, #764ba2 100%)",
                      borderRadius: "2px",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#374151",
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                    }}
                  >
                    主要导航
                  </span>
                </div>
                <nav
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <NavLink
                    to="/home"
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      `d-flex align-items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                        isActive ? "active-mobile-nav" : "mobile-nav-link"
                      }`
                    }
                    style={({ isActive }) => ({
                      textDecoration: "none",
                      color: isActive ? "#ffffff" : "#1f2937",
                      background: isActive
                        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        : "transparent",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      padding: "4px 20px",
                      fontWeight: isActive ? 600 : 500,
                      fontSize: "15px",
                      transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                      position: "relative",
                      overflow: "hidden",
                      border: isActive ? "none" : "1px solid transparent",
                    })}
                  >
                    {({ isActive }) => (
                      <>
                        {/* 激活状态的光效背景 */}
                        {isActive && (
                          <div
                            style={{
                              position: "absolute",
                              top: "0",
                              left: "0",
                              right: "0",
                              bottom: "0",
                              background:
                                "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 100%)",
                              zIndex: 0,
                            }}
                          />
                        )}
                        {/* 图标容器 */}

                        {/* 文字内容 */}
                        <span
                          style={{
                            flex: 1,
                            fontWeight: isActive ? 700 : 500,
                            position: "relative",
                            zIndex: 1,
                            letterSpacing: "0.2px",
                          }}
                        >
                          {t('nav.home')}
                        </span>
                        {/* 激活指示器 */}
                        {isActive && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              position: "relative",
                              zIndex: 1,
                            }}
                          >
                            <span
                              style={{
                                fontSize: "20px",
                                color: "#ffffff",
                                filter:
                                  "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
                              }}
                            >
                              ›
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </NavLink>

                  <NavLink
                    to="/about"
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      `d-flex align-items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                        isActive ? "active-mobile-nav" : "mobile-nav-link"
                      }`
                    }
                    style={({ isActive }) => ({
                      textDecoration: "none",
                      color: isActive ? "#ffffff" : "#1f2937",
                      background: isActive
                        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        : "transparent",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      padding: "4px 20px",
                      fontWeight: isActive ? 600 : 500,
                      fontSize: "15px",
                      transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                      position: "relative",
                      overflow: "hidden",
                      border: isActive ? "none" : "1px solid transparent",
                    })}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <div
                            style={{
                              position: "absolute",
                              top: "0",
                              left: "0",
                              right: "0",
                              bottom: "0",
                              background:
                                "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 100%)",
                              zIndex: 0,
                            }}
                          />
                        )}
                        <span
                          style={{
                            flex: 1,
                            fontWeight: isActive ? 700 : 500,
                            position: "relative",
                            zIndex: 1,
                            letterSpacing: "0.2px",
                          }}
                        >
                          {t('nav.about')}
                        </span>
                        {isActive && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              position: "relative",
                              zIndex: 1,
                            }}
                          >
                            <span
                              style={{
                                fontSize: "20px",
                                color: "#ffffff",
                                filter:
                                  "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
                              }}
                            >
                              ›
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </NavLink>
                </nav>
              </div>

              {/* 渐变分隔线 */}
              <div
                style={{
                  margin: "8px 28px",
                  height: "1px",
                  background:
                    "linear-gradient(to right, transparent, #e5e7eb 0%, #d1d5db 50%, #e5e7eb 100%, transparent)",
                }}
              />

              {/* 语言切换器 - 精致容器 */}
              <div
                style={{
                  padding: "24px 20px",
                  background: "#ffffff",
                  borderRadius: "20px",
                  margin: "0 16px 12px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "4px",
                      height: "20px",
                      background:
                        "linear-gradient(180deg, #f59e0b 0%, #d97706 100%)",
                      borderRadius: "2px",
                    }}
                  />
                  <span style={{ fontSize: "18px" }}>🌐</span>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#374151",
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                    }}
                  >
                    语言 / Language
                  </div>
                </div>
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)",
                    borderRadius: "14px",
                    padding: "10px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "inset 0 2px 6px rgba(0,0,0,0.04)",
                  }}
                >
                  <LanguageSwitcher variant="button" size="small" />
                </div>
              </div>

              {/* 用户信息区域 - 可点击弹窗 */}
              <div
                onClick={() => {
                  handleShowUserInfo();
                  closeMenu();
                }}
                style={{
                  padding: "20px 20px",
                  background: "#ffffff",
                  borderRadius: "20px",
                  margin: "0 16px 16px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  cursor: "pointer",
                  transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                  position: "relative",
                  overflow: "hidden",
                  border: "1px solid rgba(102, 126, 234, 0.15)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)";
                  e.currentTarget.style.borderColor =
                    "rgba(102, 126, 234, 0.3)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 24px rgba(102, 126, 234, 0.15), 0 0 30px rgba(102, 126, 234, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#ffffff";
                  e.currentTarget.style.borderColor =
                    "rgba(102, 126, 234, 0.15)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 20px rgba(0,0,0,0.08)";
                }}
              >
                {/* 动态扫光效果 */}
                <div
                  style={{
                    position: "absolute",
                    top: "0",
                    left: "-100%",
                    width: "100%",
                    height: "100%",
                    background:
                      "linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.15), transparent)",
                    transition: "left 0.6s ease",
                    pointerEvents: "none",
                  }}
                  className="mobile-user-info-hover-glow"
                />

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {/* 头像容器 - 带渐变光环 */}
                  <div
                    style={{
                      position: "relative",
                      width: "52px",
                      height: "52px",
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      padding: "3px",
                      boxShadow:
                        "0 4px 16px rgba(102, 126, 234, 0.4), 0 0 20px rgba(102, 126, 234, 0.2)",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    }}
                  >
                    <img
                      src={currentUser.avatar}
                      alt="用户头像"
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid rgba(255, 255, 255, 0.5)",
                      }}
                    />
                    {/* 在线状态指示点 */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: "3px",
                        right: "3px",
                        width: "11px",
                        height: "11px",
                        borderRadius: "50%",
                        background:
                          "linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)",
                        border: "2px solid #ffffff",
                        boxShadow: "0 0 8px rgba(78, 205, 196, 0.8)",
                        animation: "pulse 2s ease-in-out infinite",
                      }}
                    />
                  </div>

                  {/* 用户信息文本 */}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "#1f2937",
                        marginBottom: "4px",
                        letterSpacing: "-0.2px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {currentUser.username}
                      <Tag
                        color="blue"
                        style={{
                          fontSize: "10px",
                          fontWeight: 600,
                          padding: "1px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        {t('user.online')}
                      </Tag>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#6b7280",
                          fontWeight: 500,
                        }}
                      >
                        {currentUser.role}
                      </div>
                      <div
                        style={{
                          width: "4px",
                          height: "4px",
                          borderRadius: "50%",
                          background: "rgba(107, 114, 128, 0.3)",
                        }}
                      />
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#9ca3af",
                          fontWeight: 400,
                        }}
                      >
                        {currentUser.department}
                      </div>
                    </div>
                  </div>

                  {/* 箭头图标 */}
                  <RightCircleFilled
                    style={{
                      fontSize: "22px",
                      color: "#667eea",
                      transition: "transform 0.3s ease",
                      filter: "drop-shadow(0 2px 4px rgba(102, 126, 234, 0.3))",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ===== 左侧侧边导航栏 (仅桌面端/平板端显示) ===== */}
      {(isDesktop || isTablet) && (
        <>
          {/* 侧边栏切换按钮 - 始终显示在左侧边缘 */}
          <div
            onClick={toggleSidebar}
            style={{
              position: "fixed",
              top: "calc(64px + (100vh - 64px) / 2)", // 顶部导航栏下方中间位置
              transform: "translateY(-50%)",
              left: sidebarOpen ? "206px" : "-12px", // 侧边栏展开时在右侧，收起时贴左边缘
              width: "40px",
              height: "40px",
              background: "#ffffff",
              borderRadius: "20px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              color: "var(--text-color)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
              zIndex: 1001,
              transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            aria-label="切换侧边栏"
            title={sidebarOpen ? "收起侧边栏" : "展开侧边栏"}
          >
            {sidebarOpen ? (
              <RightCircleFilled
                style={{ fontSize: "42px", color: "#121324" }}
              />
            ) : (
              <LeftCircleFilled
                style={{ fontSize: "42px", color: "#121324" }}
              />
            )}
          </div>

          {/* 侧边栏主体 - 深色高端设计 */}
          <aside
            style={{
              position: "fixed",
              top: "64px", // 从顶部导航栏下方开始
              left: sidebarOpen ? "0" : "-220px",
              width: "220px",
              height: "calc(100vh - 64px)", // 减去顶部导航栏高度
              background: "linear-gradient(180deg, #1a1b2e 0%, #0f1020 100%)", // 深邃蓝黑渐变
              borderRight: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: sidebarOpen
                ? "4px 0 24px rgba(0, 0, 0, 0.4), inset 0 0 60px rgba(0, 0, 0, 0.3)"
                : "none",
              transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              zIndex: 1000,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* 顶部品牌 Logo */}
            {/* <div
              style={{
                padding: "24px 24px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
                  }}
                >
                  💠
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#ffffff",
                    letterSpacing: "-0.3px",
                  }}
                >
                  {t("app.title")}
                </div>
              </div>
            </div> */}

            {/* 导航菜单区域 */}
            <div className="p-3" style={{ flex: 1, paddingTop: "12px" }}>
              <div className="flex flex-column gap-1">
                {navLinks.map((link) => (
                  <div key={link.to}>
                    {/* 主菜单项 - 无子菜单时使用 NavLink */}
                    {!link.hasSubmenu ? (
                      <NavLink
                        to={link.to}
                        onClick={closeMenu}
                        style={{
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          minHeight: "48px",
                          padding: "0px 16px",
                          color:
                            location.pathname === link.to
                              ? "#ffffff"
                              : "rgba(255, 255, 255, 0.75)",
                          background:
                            location.pathname === link.to
                              ? "linear-gradient(135deg, rgba(102, 126, 234, 0.25) 0%, rgba(118, 75, 162, 0.2) 100%)"
                              : "transparent",
                          borderRadius: "12px",
                          fontWeight: location.pathname === link.to ? 600 : 500,
                          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                          border:
                            location.pathname === link.to
                              ? "1px solid rgba(102, 126, 234, 0.4)"
                              : "1px solid transparent",
                          marginBottom: "6px",
                          position: "relative",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          const isCurrentActive = location.pathname === link.to;
                          if (!isCurrentActive) {
                            e.currentTarget.style.background =
                              "rgba(255, 255, 255, 0.06)";
                            e.currentTarget.style.color = "#ffffff";
                          }
                        }}
                        onMouseLeave={(e) => {
                          const isCurrentActive = location.pathname === link.to;
                          if (!isCurrentActive) {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color =
                              "rgba(255, 255, 255, 0.75)";
                          }
                        }}
                      >
                        {link.icon}
                        <span style={{ flex: 1, fontSize: "14px" }}>
                          {link.label}
                        </span>
                        {location.pathname === link.to && (
                          <span
                            style={{
                              marginLeft: "auto",
                              width: "6px",
                              height: "6px",
                              background: "#667eea",
                              borderRadius: "50%",
                              boxShadow: "0 0 10px rgba(102, 126, 234, 0.9)",
                            }}
                          />
                        )}
                      </NavLink>
                    ) : (
                      /* 主菜单项 - 有子菜单时使用 div 点击展开 */
                      <div
                        onClick={() => toggleSubmenu(link.to)}
                        style={{
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          minHeight: "48px",
                          padding: "14px 16px",
                          color:
                            location.pathname === link.to
                              ? "#ffffff"
                              : "rgba(255, 255, 255, 0.75)",
                          background:
                            location.pathname === link.to
                              ? "linear-gradient(135deg, rgba(102, 126, 234, 0.25) 0%, rgba(118, 75, 162, 0.2) 100%)"
                              : "transparent",
                          borderRadius: "12px",
                          fontWeight: location.pathname === link.to ? 600 : 500,
                          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                          border:
                            location.pathname === link.to
                              ? "1px solid rgba(102, 126, 234, 0.4)"
                              : "1px solid transparent",
                          marginBottom: "6px",
                          position: "relative",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          const isCurrentActive = location.pathname === link.to;
                          if (!isCurrentActive) {
                            e.currentTarget.style.background =
                              "rgba(255, 255, 255, 0.06)";
                            e.currentTarget.style.color = "#ffffff";
                          }
                        }}
                        onMouseLeave={(e) => {
                          const isCurrentActive = location.pathname === link.to;
                          if (!isCurrentActive) {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color =
                              "rgba(255, 255, 255, 0.75)";
                          }
                        }}
                      >
                        <span
                          style={{
                            fontSize: "20px",
                            opacity: location.pathname === link.to ? 1 : 0.8,
                            filter:
                              location.pathname === link.to
                                ? "drop-shadow(0 0 8px rgba(255,255,255,0.4))"
                                : "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minWidth: "24px",
                          }}
                        >
                          {link.icon}
                        </span>
                        <span style={{ flex: 1, fontSize: "14px" }}>
                          {link.label}
                        </span>
                        <span
                          style={{
                            fontSize: "14px",
                            opacity: location.pathname === link.to ? 1 : 0.5,
                            transition:
                              "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease",
                            transform: expandedMenus[link.to]
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                            display: "inline-block",
                          }}
                        >
                          <CaretDownOutlined style={{ fontSize: "16px" }} />
                        </span>
                      </div>
                    )}

                    {/* 二级子菜单 */}
                    {link.hasSubmenu && expandedMenus[link.to] && (
                      <div
                        style={{
                          marginTop: "4px",
                          marginBottom: "6px",
                          paddingLeft: "52px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                          animation:
                            "slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      >
                        {link.children.map((child) => (
                          <NavLink
                            key={child.to}
                            to={child.to}
                            onClick={closeMenu}
                            style={{
                              textDecoration: "none",
                              display: "block",
                              padding: "10px 12px",
                              color:
                                location.pathname === child.to
                                  ? "#ffffff"
                                  : "rgba(255, 255, 255, 0.65)",
                              background:
                                location.pathname === child.to
                                  ? "rgba(102, 126, 234, 0.15)"
                                  : "transparent",
                              borderRadius: "8px",
                              fontSize: "13px",
                              fontWeight:
                                location.pathname === child.to ? 600 : 400,
                              transition:
                                "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                              borderLeft:
                                location.pathname === child.to
                                  ? "2px solid #667eea"
                                  : "2px solid transparent",
                            }}
                            onMouseEnter={(e) => {
                              const isCurrentActive =
                                location.pathname === child.to;
                              if (!isCurrentActive) {
                                e.currentTarget.style.background =
                                  "rgba(255, 255, 255, 0.04)";
                                e.currentTarget.style.color = "#ffffff";
                              }
                            }}
                            onMouseLeave={(e) => {
                              const isCurrentActive =
                                location.pathname === child.to;
                              if (!isCurrentActive) {
                                e.currentTarget.style.background =
                                  "transparent";
                                e.currentTarget.style.color =
                                  "rgba(255, 255, 255, 0.65)";
                              }
                            }}
                          >
                            {child.label}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 底部用户信息区域 - 可点击 */}
            <div
              onClick={handleShowUserInfo}
              style={{
                padding: "27px 20px",
                borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                cursor: "pointer",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                background:
                  "linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.05) 100%)",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.1) 100%)";
                e.currentTarget.style.boxShadow =
                  "inset 0 0 40px rgba(102, 126, 234, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.05) 100%)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* 动态光效背景 */}
              <div
                style={{
                  position: "absolute",
                  top: "0",
                  left: "-100%",
                  width: "100%",
                  height: "100%",
                  background:
                    "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent)",
                  transition: "left 0.6s ease",
                  pointerEvents: "none",
                }}
                className="sidebar-user-hover-glow"
              />

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {/* 头像容器 - 带光环效果 */}
                <div
                  style={{
                    position: "relative",
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                    padding: "3px",
                    boxShadow:
                      "0 4px 16px rgba(240, 147, 251, 0.5), 0 0 20px rgba(102, 126, 234, 0.3)",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  }}
                >
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=b6e3f4"
                    alt="用户头像"
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid rgba(255, 255, 255, 0.4)",
                    }}
                  />
                  {/* 在线状态指示点 */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "2px",
                      right: "2px",
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)",
                      border: "2px solid rgba(15, 16, 32, 0.8)",
                      boxShadow: "0 0 8px rgba(78, 205, 196, 0.8)",
                      animation: "pulse 2s ease-in-out infinite",
                    }}
                  />
                </div>

                {/* 用户信息文本 */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#ffffff",
                      marginBottom: "4px",
                      letterSpacing: "-0.2px",
                      textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    {currentUser.username}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        color: "rgba(255, 255, 255, 0.6)",
                        fontWeight: 500,
                      }}
                    >
                      {currentUser.role}
                    </div>
                  </div>
                </div>

                {/* 展开箭头图标 - 带呼吸灯效果 */}
                <RightCircleFilled
                  style={{
                    fontSize: "20px",
                    color: "rgba(255, 255, 255, 0.5)",
                    transition: "transform 0.3s ease, color 0.3s ease",
                    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
                    animation: "slideRight 1.5s ease-in-out infinite",
                  }}
                />
              </div>
            </div>
          </aside>
        </>
      )}

      {/* ===== 用户信息弹窗 (所有设备都显示) ===== */}
      <Modal
        open={userInfoModalVisible}
        onCancel={handleCloseUserInfo}
        footer={null}
        centered
        closable={false}
        width={isMobile ? "80%" : 520}
        className="user-info-modal"
        maskClosable={true}
        destroyOnClose={false}
        styles={{
          body: {
            padding: 0,
            maxHeight: isMobile ? "calc(100vh - 100px)" : "calc(100vh - 150px)",
            overflowY: "auto",
          },
          header: { display: "none" },
        }}
      >
        {/* 弹窗头部 - 豪华渐变背景 */}
        <div
          style={{
            position: "relative",
            padding: "28px 32px 22px",
            background:
              "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #6a11cb 100%)",
            borderRadius: "20px 20px 0 0",
            textAlign: "center",
            overflow: "hidden",
          }}
        >
          {/* 动态装饰背景 */}
          <div
            style={{
              position: "absolute",
              top: "-50%",
              left: "-50%",
              width: "200%",
              height: "200%",
              background: `radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)`,
              animation: "rotate 20s linear infinite",
              opacity: 0.5,
              pointerEvents: "none",
            }}
          />

          {/* 网格装饰线 */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `
                    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
                  `,
              backgroundSize: "40px 40px",
              opacity: 0.3,
              pointerEvents: "none",
            }}
          />

          {/* 关闭按钮 */}
          <div
            onClick={handleCloseUserInfo}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.3s ease",
              color: "#ffffff",
              fontSize: "18px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
              e.currentTarget.style.transform = "rotate(90deg) scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
              e.currentTarget.style.transform = "rotate(0deg) scale(1)";
            }}
          >
            <CloseOutlined />
          </div>

          {/* 用户头像 - 多层光环 */}
          <div
            style={{
              position: "relative",
              width: isMobile ? "48px" : "92px",
              height: isMobile ? "48px" : "92px",
              margin: isMobile ? "0 auto 8px" : "0 auto 14px",
            }}
          >
            {/* 外圈光环动画（仅桌面端） */}
            {!isMobile && (
              <div
                style={{
                  position: "absolute",
                  top: "-6px",
                  left: "-6px",
                  right: "-6px",
                  bottom: "-6px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))",
                  animation: "pulse-ring 2s ease-out infinite",
                  pointerEvents: "none",
                }}
              />
            )}

            {/* Ant Design Avatar 组件 */}
            <Avatar
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=b6e3f4"
              size={isMobile ? 48 : 92}
              style={{
                border: isMobile
                  ? "2px solid rgba(255, 255, 255, 0.5)"
                  : "3px solid rgba(255, 255, 255, 0.4)",
                boxShadow: isMobile
                  ? "0 2px 8px rgba(240, 147, 251, 0.25), 0 0 12px rgba(102, 126, 234, 0.15)"
                  : "0 8px 32px rgba(240, 147, 251, 0.6), 0 0 60px rgba(102, 126, 234, 0.4)",
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              }}
            />

            {/* 在线状态徽章（仅桌面端显示完整，移动端简化） */}
            <div
              style={{
                position: "absolute",
                bottom: isMobile ? "1px" : "6px",
                right: isMobile ? "1px" : "6px",
                width: isMobile ? "8px" : "12px",
                height: isMobile ? "8px" : "12px",
                padding: isMobile ? "1px" : "4px",
                background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                borderRadius: "50%",
                border: isMobile
                  ? "1px solid rgba(255, 255, 255, 0.7)"
                  : "2px solid rgba(102, 126, 234, 0.8)",
                boxShadow: isMobile
                  ? "0 0 5px rgba(82, 196, 26, 0.5)"
                  : "0 0 12px rgba(82, 196, 26, 0.9), inset 0 0 8px rgba(255, 255, 255, 0.4)",
                animation: "status-pulse 2s ease-in-out infinite",
                pointerEvents: "none",
              }}
            />
          </div>

          {/* 用户名 */}
          <h2
            style={{
              margin: isMobile ? "0 0 5px" : "0 0 10px",
              fontSize: isMobile ? "16px" : "24px",
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "-0.5px",
              textShadow: isMobile
                ? "0 1px 2px rgba(0, 0, 0, 0.15), 0 0 6px rgba(255, 255, 255, 0.1)"
                : "0 2px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.2)",
            }}
          >
            {currentUser.username}
          </h2>

          {/* 角色标签和 VIP 标识 */}
          <Space size={isMobile ? 1 : 5} wrap>
            <Tag
              icon={<StarOutlined />}
              color="#faad14"
              style={{
                padding: isMobile ? "0px 4px" : "6px 10px",
                fontSize: "14px",
                fontWeight: 600,
                border: "1px solid rgba(250, 173, 20, 0.5)",
                background: "rgba(250, 173, 20, 0.2)",
                backdropFilter: "blur(10px)",
              }}
            >
              VIP
            </Tag>
            <Tag
              icon={<SafetyCertificateOutlined />}
              color="#1890ff"
              style={{
                padding: isMobile ? "0px 4px" : "6px 10px",
                fontSize: "14px",
                fontWeight: 600,
                border: "1px solid rgba(24, 144, 255, 0.5)",
                background: "rgba(24, 144, 255, 0.2)",
                backdropFilter: "blur(10px)",
              }}
            >
              {currentUser.role}
            </Tag>
            <Tag
              icon={<EnvironmentOutlined />}
              color="#52c41a"
              style={{
                padding: isMobile ? "0px 4px" : "6px 10px",
                fontSize: "14px",
                fontWeight: 600,
                border: "1px solid rgba(82, 196, 26, 0.5)",
                background: "rgba(82, 196, 26, 0.2)",
                backdropFilter: "blur(10px)",
              }}
            >
              在线
            </Tag>
          </Space>
        </div>

        {/* 用户信息详情区域 */}
        <div
          style={{
            padding: isMobile ? "10px 10px" : "20px 24px",
            background: "linear-gradient(180deg, #fafbfc 0%, #ffffff 100%)",
          }}
        >
          {/* Ant Design Descriptions 组件 - 极简设计 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {/* 电子邮箱 */}
            <div
              className="info-item"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: isMobile ? "6px 8px" : "10px 12px",
                background: "#ffffff",
                borderRadius: isMobile ? "7px" : "10px",
                border: "1px solid #f0f0f0",
                boxShadow: isMobile
                  ? "0 1px 2px rgba(0, 0, 0, 0.02)"
                  : "0 1px 4px rgba(0, 0, 0, 0.03)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "pointer",
                marginBottom: isMobile ? "5px" : "8px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#667eea";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(102, 126, 234, 0.15)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#f0f0f0";
                e.currentTarget.style.boxShadow =
                  "0 2px 6px rgba(0, 0, 0, 0.04)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flex: 1,
                }}
              >
                <div
                  style={{
                    width: isMobile ? "24px" : "28px",
                    height: isMobile ? "24px" : "28px",
                    borderRadius: "7px",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: isMobile ? "12px" : "14px",
                    color: "#ffffff",
                    boxShadow: "0 1px 4px rgba(102, 126, 234, 0.12)",
                    flexShrink: 0,
                  }}
                >
                  <MailOutlined />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "7px",
                      color: "#8c8c8c",
                      marginBottom: "1px",
                      fontWeight: 500,
                    }}
                  >
                    电子邮箱
                  </div>
                  <div
                    style={{
                      fontSize: isMobile ? "10px" : "12px",
                      color: "#262626",
                      fontWeight: 600,
                      wordBreak: "break-all",
                    }}
                  >
                    {currentUser.email}
                  </div>
                </div>
              </div>
              <Button
                type="text"
                size="small"
                icon={<GlobalOutlined style={{ fontSize: "12px" }} />}
                style={{
                  color: "#8c8c8c",
                  padding: "5px",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#667eea";
                  e.currentTarget.style.background =
                    "rgba(102, 126, 234, 0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#8c8c8c";
                  e.currentTarget.style.background = "transparent";
                }}
              />
            </div>

            {/* 手机号码 */}
            <div
              className="info-item"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: isMobile ? "6px 8px" : "12px 16px",
                background: "#ffffff",
                borderRadius: isMobile ? "7px" : "10px",
                border: "1px solid #f0f0f0",
                boxShadow: isMobile
                  ? "0 1px 2px rgba(0, 0, 0, 0.02)"
                  : "0 2px 6px rgba(0, 0, 0, 0.04)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "pointer",
                marginBottom: isMobile ? "5px" : "8px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#f5576c";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(245, 87, 108, 0.15)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#f0f0f0";
                e.currentTarget.style.boxShadow =
                  "0 2px 6px rgba(0, 0, 0, 0.04)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flex: 1,
                }}
              >
                <div
                  style={{
                    width: isMobile ? "24px" : "28px",
                    height: isMobile ? "24px" : "28px",
                    borderRadius: "7px",
                    background:
                      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: isMobile ? "12px" : "14px",
                    color: "#ffffff",
                    boxShadow: "0 1px 4px rgba(240, 147, 251, 0.12)",
                    flexShrink: 0,
                  }}
                >
                  <PhoneOutlined />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "7px",
                      color: "#8c8c8c",
                      marginBottom: "1px",
                      fontWeight: 500,
                    }}
                  >
                    手机号码
                  </div>
                  <div
                    style={{
                      fontSize: isMobile ? "10px" : "12px",
                      color: "#262626",
                      fontWeight: 600,
                    }}
                  >
                    {currentUser.phone}
                  </div>
                </div>
              </div>
              <Button
                type="text"
                size="small"
                icon={<SettingOutlined style={{ fontSize: "12px" }} />}
                style={{
                  color: "#8c8c8c",
                  padding: "5px",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#667eea";
                  e.currentTarget.style.background =
                    "rgba(102, 126, 234, 0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#8c8c8c";
                  e.currentTarget.style.background = "transparent";
                }}
              />
            </div>

            {/* 所属部门 */}
            <div
              className="info-item"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: isMobile ? "6px 8px" : "10px 12px",
                background: "#ffffff",
                borderRadius: isMobile ? "7px" : "10px",
                border: "1px solid #f0f0f0",
                boxShadow: isMobile
                  ? "0 1px 2px rgba(0, 0, 0, 0.02)"
                  : "0 1px 4px rgba(0, 0, 0, 0.03)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "pointer",
                marginBottom: isMobile ? "5px" : "8px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#4ecdc4";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(78, 205, 196, 0.15)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#f0f0f0";
                e.currentTarget.style.boxShadow =
                  "0 2px 6px rgba(0, 0, 0, 0.04)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flex: 1,
                }}
              >
                <div
                  style={{
                    width: isMobile ? "24px" : "28px",
                    height: isMobile ? "24px" : "28px",
                    borderRadius: "7px",
                    background:
                      "linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: isMobile ? "12px" : "14px",
                    color: "#ffffff",
                    boxShadow: "0 1px 4px rgba(78, 205, 196, 0.12)",
                    flexShrink: 0,
                  }}
                >
                  <UserOutlined />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "7px",
                      color: "#8c8c8c",
                      marginBottom: "1px",
                      fontWeight: 500,
                    }}
                  >
                    所属部门
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "3px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: isMobile ? "10px" : "12px",
                        color: "#262626",
                        fontWeight: 600,
                      }}
                    >
                      {currentUser.department}
                    </span>
                    <Tag
                      color="blue"
                      style={{
                        fontSize: "6px",
                        padding: isMobile ? "0px 2px" : "0px 4px",
                        borderRadius: "4px",
                        border: "1px solid rgba(24, 144, 255, 0.3)",
                        background: "rgba(24, 144, 255, 0.08)",
                        color: "#1890ff",
                        fontWeight: 600,
                      }}
                    >
                      技术部
                    </Tag>
                  </div>
                </div>
              </div>
            </div>

            {/* 最近登录 */}
            <div
              className="info-item"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: isMobile ? "6px 8px" : "12px 16px",
                background: "linear-gradient(135deg, #fafbfc 0%, #ffffff 100%)",
                borderRadius: isMobile ? "7px" : "10px",
                border: "1px solid #f0f0f0",
                boxShadow: isMobile
                  ? "inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 1px 1px rgba(0, 0, 0, 0.015)"
                  : "inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 1px 3px rgba(0, 0, 0, 0.03)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "default",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flex: 1,
                }}
              >
                <div
                  style={{
                    width: isMobile ? "24px" : "28px",
                    height: isMobile ? "24px" : "28px",
                    borderRadius: "7px",
                    background:
                      "linear-gradient(135deg, #faad14 0%, #ffd666 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: isMobile ? "12px" : "14px",
                    color: "#ffffff",
                    boxShadow: "0 1px 4px rgba(250, 173, 20, 0.12)",
                    flexShrink: 0,
                  }}
                >
                  <ClockCircleOutlined />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "7px",
                      color: "#8c8c8c",
                      marginBottom: "1px",
                      fontWeight: 500,
                    }}
                  >
                    最近登录
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "3px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: isMobile ? "9px" : "11px",
                        color: "#595959",
                        fontWeight: 500,
                      }}
                    >
                      2024-03-17 14:32:18
                    </span>
                    <div
                      style={{
                        width: "4px",
                        height: "4px",
                        borderRadius: "50%",
                        background:
                          "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                        boxShadow: "0 0 6px rgba(82, 196, 26, 0.5)",
                        animation: "status-pulse 2s ease-in-out infinite",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Divider
            style={{
              margin: isMobile ? "6px 0" : "10px 0",
              background: "#f0f0f0",
            }}
          />

          {/* 退出登录按钮（仅桌面端显示） */}
          <Button
            type="primary"
            danger
            size="large"
            onClick={handleLogout}
            icon={<LogoutOutlined />}
            block
            style={{
              height: "46px",
              fontSize: "15px",
              fontWeight: 700,
              borderRadius: "12px",
              background: "linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)",
              border: "none",
              boxShadow:
                "0 6px 20px rgba(255, 77, 79, 0.4), 0 3px 10px rgba(255, 77, 79, 0.2)",
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px) scale(1.02)";
              e.currentTarget.style.boxShadow =
                "0 12px 32px rgba(255, 77, 79, 0.5), 0 6px 16px rgba(255, 77, 79, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow =
                "0 6px 20px rgba(255, 77, 79, 0.4), 0 3px 10px rgba(255, 77, 79, 0.2)";
            }}
          >
            {t('user.logout')}
          </Button>

          {/* 辅助操作链接（仅桌面端显示） */}
          {!isMobile && (
            <Space
              size="middle"
              style={{
                width: "100%",
                marginTop: "12px",
                paddingTop: "12px",
                borderTop: "1px solid #f0f0f0",
              }}
            >
              <Button
                type="text"
                size="small"
                icon={<SettingOutlined style={{ fontSize: "12px" }} />}
                style={{
                  color: "#8c8c8c",
                  padding: "5px",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#667eea";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#8c8c8c";
                }}
              >
                {t('nav.settings')}
              </Button>
              <Button
                type="text"
                size="small"
                icon={<FileSearchOutlined style={{ fontSize: "12px" }} />}
                style={{
                  color: "#8c8c8c",
                  padding: "5px",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#667eea";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#8c8c8c";
                }}
              >
                {t('nav.operationLogs')}
              </Button>
              <Button
                type="text"
                size="small"
                icon={
                  <SafetyCertificateOutlined style={{ fontSize: "12px" }} />
                }
                style={{
                  color: "#8c8c8c",
                  padding: "5px",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#667eea";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#8c8c8c";
                }}
              >
                {t('nav.securitySettings')}
              </Button>
            </Space>
          )}
        </div>
      </Modal>
    </>
  );
};

/**
 * 响应式页脚
 */
export const ResponsiveFooter: React.FC = () => {
  useWindowSize(); // 仅用于检测设备类型，不实际使用返回值
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // Canvas 科技粒子动画
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 设置 canvas 尺寸
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = 180;
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // 发光粒子
    class GlowParticle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: number;
      opacity: number;
      pulseSpeed: number;
      pulsePhase: number;

      constructor(canvasWidth: number, canvasHeight: number) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.size = Math.random() * 2.5 + 1.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.color = Math.floor(Math.random() * 2);
        this.opacity = Math.random() * 0.6 + 0.4;
        this.pulseSpeed = Math.random() * 0.04 + 0.03;
        this.pulsePhase = Math.random() * Math.PI * 2;
      }

      update(canvasWidth: number, canvasHeight: number) {
        this.x += this.speedX;
        this.y += this.speedY;
        this.pulsePhase += this.pulseSpeed;

        if (this.x < 0 || this.x > canvasWidth) this.speedX *= -1;
        if (this.y < 0 || this.y > canvasHeight) this.speedY *= -1;
      }

      draw(ctx: CanvasRenderingContext2D, time: number) {
        const pulseOpacity =
          this.opacity * (0.5 + 0.5 * Math.sin(this.pulsePhase + time * 0.001));

        // 多层外发光
        for (let radius = this.size * 4; radius > 0; radius -= this.size) {
          const gradient = ctx.createRadialGradient(
            this.x,
            this.y,
            0,
            this.x,
            this.y,
            radius
          );
          const alpha = (radius / (this.size * 4)) * pulseOpacity * 0.3;
          gradient.addColorStop(0, `rgba(102, 126, 234, ${alpha})`);
          gradient.addColorStop(0.5, `rgba(78, 205, 196, ${alpha * 0.5})`);
          gradient.addColorStop(1, "transparent");

          ctx.beginPath();
          ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }

        // 核心亮点
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${pulseOpacity})`;
        ctx.fill();
      }
    }

    const particles: GlowParticle[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push(new GlowParticle(canvas.width, canvas.height));
    }

    let animationId: number;
    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 深邃渐变背景 - 三层渐变
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, "rgba(6, 8, 20, 0.98)");
      bgGradient.addColorStop(0.5, "rgba(10, 14, 35, 0.96)");
      bgGradient.addColorStop(1, "rgba(15, 18, 40, 0.98)");
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      time++;

      // 绘制流动的能量线
      const waveCount = 3;
      for (let w = 0; w < waveCount; w++) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(102, 126, 234, ${0.03 + w * 0.02})`;
        ctx.lineWidth = 1 + w * 0.5;

        for (let x = 0; x < canvas.width; x += 5) {
          const y =
            canvas.height * 0.3 +
            Math.sin((x + time * (0.5 + w * 0.3)) * 0.01 + w) * 20 +
            Math.cos((x + time * 0.3) * 0.02) * 10;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // 绘制连接线（网络拓扑效果）
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            const opacity = (1 - distance / 120) * 0.2;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(102, 126, 234, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      particles.forEach((particle) => {
        particle.update(canvas.width, canvas.height);
        particle.draw(ctx, time);
      });

      // 精致网格线 - 双层
      ctx.strokeStyle = "rgba(102, 126, 234, 0.05)";
      ctx.lineWidth = 1;
      const gridSize = 60;
      const offset = (time * 0.15) % gridSize;

      for (let x = -gridSize + offset; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // 横向细网格
      ctx.strokeStyle = "rgba(78, 205, 196, 0.03)";
      ctx.lineWidth = 0.5;
      for (let y = 0; y < canvas.height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // 随机闪烁光点
      if (Math.random() < 0.03) {
        const flashX = Math.random() * canvas.width;
        const flashY = Math.random() * canvas.height;
        const flashRadius = Math.random() * 30 + 20;

        const flashGradient = ctx.createRadialGradient(
          flashX,
          flashY,
          0,
          flashX,
          flashY,
          flashRadius
        );
        flashGradient.addColorStop(0, "rgba(255, 255, 255, 0.08)");
        flashGradient.addColorStop(1, "transparent");

        ctx.beginPath();
        ctx.arc(flashX, flashY, flashRadius, 0, Math.PI * 2);
        ctx.fillStyle = flashGradient;
        ctx.fill();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <footer
      className="container-fluid p-0"
      style={{
        position: "relative",
        marginTop: "var(--spacing-2xl)",
        overflow: "hidden",
      }}
    >
      {/* Canvas 背景动画 */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      />

      {/* 页脚内容 */}
      <div
        className="container"
        style={{
          position: "relative",
          zIndex: 1,
          padding: "30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          {/* 动态徽标 */}
          <div
            style={{
              position: "relative",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(78, 205, 196, 0.2))",
                animation: "spin 8s linear infinite",
              }}
            />
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #667eea, #4ecdc4)",
                boxShadow:
                  "0 0 20px rgba(102, 126, 234, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
          </div>

          {/* 文字信息 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <span
              style={{
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: 600,
                letterSpacing: "1px",
                textShadow: "0 0 20px rgba(102, 126, 234, 0.5)",
              }}
            >
              EMBEDDED SYSTEM
            </span>
            <span
              style={{
                color: "rgba(255, 255, 255, 0.5)",
                fontSize: "11px",
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              Professional Control Platform
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
          }}
        >
          {/* 系统状态 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 12px",
              background: "rgba(78, 205, 196, 0.1)",
              borderRadius: "20px",
              border: "1px solid rgba(78, 205, 196, 0.3)",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#4ecdc4",
                boxShadow: "0 0 8px rgba(78, 205, 196, 0.8)",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
            <span
              style={{
                color: "#4ecdc4",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "1px",
              }}
            >
              SYSTEM ONLINE
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
