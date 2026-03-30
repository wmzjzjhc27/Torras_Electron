import { useNavigate, useLocation } from "react-router-dom";
import { Form, Input, Button, Checkbox, message, Typography, Card } from "antd";
import { UserOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";
import FloatingLines from "./FloatingLines";
import { useAuthContext } from "@/contexts/AuthContext";
import { useWindowSize } from "@/hooks/useResponsive";
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

type LoginFormValues = {
  username: string;
  password: string;
  remember?: boolean;
};

/**
 * 登录页面组件
 *
 * 功能特性：
 * - 科技感浮动线条背景动画
 * - 用户名/密码表单验证
 * - 路由守卫集成（登录后自动跳转）
 * - 记住我功能
 * - 加载状态管理
 */
export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuthContext();
  const { isMobile, isTablet } = useWindowSize();
  const { t } = useTranslation();
  const [form] = Form.useForm();

  // 获取登录后的目标页面路径
  const from = (location.state as any)?.from?.pathname || "/home";

  // 响应式宽度配置
  const getCardWidth = () => {
    if (isMobile) return "90%"; // 小手机：90% 宽度，留边距
    if (isTablet) return "85%"; // 平板：85% 宽度
    return "420px"; // 桌面：固定宽度
  };

  /**
   * 处理登录提交
   */
  const onFinish = async (values: LoginFormValues) => {
    try {
      const result = await login({
        username: values.username,
        password: values.password,
        remember: values.remember,
      });

      if (result.success) {
        message.success(t('login.loginSuccess'));
        // 跳转到目标页面或首页
        navigate(from, { replace: true });
      } else {
        message.error(result.error || t('login.loginFailed'));
      }
    } catch (error) {
      console.error(t('login.retry'), error);
      message.error(t('login.retry'));
    }
  };

  /**
   * 表单验证失败回调
   */
  const onFinishFailed = (errorInfo: any) => {
    console.log("表单验证失败:", errorInfo);
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "#0a0a0a",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 背景动画层 */}
      <div
        style={{
          width: "100%",
          height: "100vh",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1,
        }}
      >
        <FloatingLines
          enabledWaves={["top", "middle", "bottom"]}
          lineCount={5}
          lineDistance={5}
          bendRadius={5}
          bendStrength={-0.5}
          interactive={true}
          parallax={true}
          mixBlendMode="normal"
          parallaxStrength={0.6}
          animationSpeed={4}
        />
      </div>

      {/* 登录卡片内容层 */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 10,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: isMobile ? "20px" : "0",
          pointerEvents: "none",
        }}
      >
        <Card
          className="login-card"
          style={{
            width: getCardWidth(),
            maxWidth: isMobile ? "100%" : "420px",
            background: "rgba(10, 10, 10, 0.85)",
            backdropFilter: "blur(10px)",
            border: "2px solid rgba(102, 126, 234, 0.6)",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(102, 126, 234, 0.2)",
            margin: isMobile ? "0 auto" : "0",
            pointerEvents: "auto",
          }}
        >
          <div
            style={{
              textAlign: "center",
              marginBottom: isMobile ? "20px" : "32px",
            }}
          >
            <LoginOutlined
              style={{
                fontSize: isMobile ? "36px" : "48px",
                color: "#667eea",
                marginBottom: isMobile ? "12px" : "16px",
                filter: "drop-shadow(0 0 10px rgba(102, 126, 234, 0.5))",
              }}
            />
            <Title
              level={isMobile ? 3 : 2}
              style={{
                color: "#ffffff",
                margin: 0,
                fontWeight: 600,
                letterSpacing: isMobile ? "1px" : "2px",
                fontSize: isMobile ? "20px" : "auto",
              }}
            >
              {t('login.title')}
            </Title>
            <Text
              type="secondary"
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: isMobile ? "13px" : "14px",
              }}
            >
              {t('login.subtitle')}
            </Text>
          </div>

          <Form
            form={form}
            name="login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            size="large"
            autoComplete="off"
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: t('login.usernameRequired') },
                { min: 3, message: t('login.usernameMinLength') },
              ]}
            >
              <Input
                className="login-input"
                prefix={<UserOutlined style={{ color: "#667eea" }} />}
                placeholder={t('login.username')}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(102, 126, 234, 0.3)",
                  color: "#fff",
                }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: t('login.passwordRequired') },
                { min: 6, message: t('login.passwordMinLength') },
              ]}
            >
              <Input.Password
                className="login-input"
                prefix={<LockOutlined style={{ color: "#667eea" }} />}
                placeholder={t('login.password')}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(102, 126, 234, 0.3)",
                  color: "#fff",
                }}
              />
            </Form.Item>

            <Form.Item>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox style={{ color: "rgba(255,255,255,0.8)" }}>
                    {t('login.remember')}
                  </Checkbox>
                </Form.Item>
                <a
                  href="#forgot"
                  style={{
                    color: "#667eea",
                    textDecoration: "none",
                  }}
                  onClick={(e) => e.preventDefault()}
                >
                  {t('login.forgotPassword')}
                </a>
              </div>
            </Form.Item>

            <Form.Item>
              <Button
              
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size={isMobile ? "large" : "large"}
                style={{
                  height: isMobile ? "40px" : "44px",
                  fontSize: isMobile ? "14px" : "16px",
                  fontWeight: 600,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 4px 20px rgba(102, 126, 234, 0.4)",
                  transition: "all 0.3s ease",
                }}
              >
                {loading ? t('login.loggingIn') : t('login.submit')}
              </Button>
            </Form.Item>
            <div
              style={{
                textAlign: "center",
                marginTop: "24px",
                color: "rgba(255,255,255,0.6)",
                fontSize: "14px",
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  marginTop: "24px",
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "14px",
                }}
              >
                {t('login.noAccount')}
              </Text>{" "}
              <a
                href="#register"
                style={{
                  color: "#21a4f1",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
                onClick={(e) => e.preventDefault()}
              >
                {t('login.register')}
              </a>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
}
