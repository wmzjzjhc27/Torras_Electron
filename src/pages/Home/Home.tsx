import { useI18n } from "@/hooks/useI18n";
import { useEffect, useState } from "react";
import LineChart from "./components/LineChart";

interface UsbDevice {
  busNumber: number;
  deviceAddress: number;
  deviceVersion: string;
  idProduct: string;
  idVendor: string;
  manufacturer: number | null;
  product: number | null;
  serialNumber: number | null;
  // 新增字段
  manufacturerName?: string;
  productName?: string;
  deviceClass?: number;
  deviceSubClass?: number;
  endpoints?: Array<{ address: number; type: string; direction: string }>;
}


export default function Home() {
  // const { t } = useI18n(); // 暂时注释掉未使用的导入
  const [isMobile, setIsMobile] = useState(false);
  const [isElectron, setIsElectron] = useState(false);
  const [usbSupported, setUsbSupported] = useState(false);
  const [usbDevices, setUsbDevices] = useState<UsbDevice[]>([]);
  const [deviceData, setDeviceData] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  // 新增状态
  const [selectedDevice, setSelectedDevice] = useState<UsbDevice | null>(null);
  const [endpoint, setEndpoint] = useState<number>(0x81);
  const [packetSize, setPacketSize] = useState<number>(64);
  const [autoRead, setAutoRead] = useState<boolean>(false);
  const [dataStream, setDataStream] = useState<
    Array<{ time: string; data: number[]; hex: string }>
  >([]);
  const [availableEndpoints, setAvailableEndpoints] = useState<
    Array<{ address: number; direction: string; type: string }>
  >([]);

  useEffect(() => {
    // 检测设备类型
    const checkDevice = () => {
      const mobileRegex =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMob = mobileRegex.test(navigator.userAgent);
      setIsMobile(isMob);

      // 检查是否为 Electron 环境
      const isEle = !!window.electronAPI && window.electronAPI.isElectron;
      setIsElectron(isEle);

      // Web USB API 支持检测（仅在非 Electron 环境下使用）
      // @ts-ignore - Web USB API 可能没有 TypeScript 类型定义
      setUsbSupported(!!navigator.usb && !isMob && !isEle);
    };

    checkDevice();
  }, []);

  // Electron 环境下获取 USB 设备列表
  const handleGetUsbDevices = async () => {
    if (!window.electronAPI) {
      setError("当前环境不支持 Electron API");
      return;
    }

    setLoading(true);
    setError("");
    try {
      
      const result = await window.electronAPI.getUsbDevices();
      console.log(result, "USB Devices");
      if (result.success && result.devices) {
        setUsbDevices(result.devices);
        setSelectedDevice(null); // 重置选中设备
        setDataStream([]); // 清空数据流
        setAvailableEndpoints([]); // 清空端点列表

        const deviceCount = result.devices.length;
        let message = `✅ 发现 ${deviceCount} 个 USB 设备\n\n`;

        // 识别电源相关设备
        const powerDevices = result.devices.filter((dev) => {
          const vendorId = dev.idVendor?.toLowerCase();
          // 常见电源设备厂商 ID
          return (
            vendorId?.includes("0483") || // STMicroelectronics
            vendorId?.includes("0403") || // FTDI
            vendorId?.includes("16c0") || // Van Ooijen Technische Informatica
            vendorId?.includes("067b")
          ); // Prolific Technology
        });

        if (powerDevices.length > 0) {
          message += `⚡ 发现 ${powerDevices.length} 个可能的电源设备:\n`;
          powerDevices.forEach((dev, idx) => {
            message += `  ${idx + 1}. Vendor: ${dev.idVendor}, Product: ${
              dev.idProduct
            }\n`;
          });
          message += "\n";
        }

        message += JSON.stringify(result.devices, null, 2);
        setDeviceData(message);
      } else {
        setError(result.error || "获取设备失败");
      }
    } catch (err: any) {
      setError(err.message || "发生未知错误");
    } finally {
      setLoading(false);
    }
  };

  // Electron 环境下读取设备数据
  const handleReadDeviceData = async () => {
    if (!window.electronAPI) {
      setError("当前环境不支持 Electron API");
      return;
    }

    if (usbDevices.length === 0) {
      setError("请先扫描 USB 设备");
      return;
    }

    setLoading(true);
    setError("");
    try {
      // 使用选中的设备配置，如果没有选中则使用第一个设备
      const targetDevice = selectedDevice || usbDevices[0];

      if (!targetDevice) {
        throw new Error("未选择任何设备");
      }

      // 如果 endpoint 为 0 或默认值，尝试从设备信息中获取输入端点
      let currentEndpoint = endpoint;
      if (
        targetDevice.endpoints &&
        Array.isArray(targetDevice.endpoints) &&
        targetDevice.endpoints.length > 0
      ) {
        // 优先选择输入端点 (IN)
        const inEndpoint = targetDevice.endpoints.find(
          (ep) =>
            ep &&
            (ep.direction === "in" ||
              ep.address === 0x81 ||
              ep.address === 0x81)
        );

        if (inEndpoint) {
          currentEndpoint = inEndpoint.address;
          console.log(
            "自动选择输入端点:",
            currentEndpoint.toString(16).toUpperCase()
          );
        } else {
          // 如果没有明确的输入端点，使用第一个端点
          currentEndpoint = targetDevice.endpoints[0].address;
          console.log(
            "使用第一个端点:",
            currentEndpoint.toString(16).toUpperCase()
          );
        }
      } else {
        console.log("⚠️ 设备没有端点信息，使用默认端点 0x81");
      }

      const deviceConfig = {
        vendorId: parseInt(targetDevice.idVendor),
        productId: parseInt(targetDevice.idProduct),
        endpoint: currentEndpoint,
        packetSize,
      };

      console.log("读取配置:", deviceConfig);
      console.log("目标设备:", targetDevice);
      console.log("使用的端点:", currentEndpoint.toString(16).toUpperCase());

      const result = await window.electronAPI.readDeviceData(deviceConfig);
      console.log(result, "Device Data");

      if (result.success && result.data) {
        const timestamp = new Date().toLocaleTimeString();
        const hexData = result.hexData || "";
        const newDataPoint = {
          time: timestamp,
          data: result.data,
          hex: hexData,
        };

        setDataStream((prev) => [newDataPoint, ...prev].slice(0, 100)); // 保留最近 100 条

        // 构建显示信息
        let displayMessage = `读取成功！
时间：${timestamp}
端点：0x${currentEndpoint.toString(16).toUpperCase()}
包大小：${packetSize} bytes

十进制：${result.data.join(", ")}

十六进制：${result.hexData}`;

        // 如果有解析后的遥测数据，显示出来
        if (result.parsedData) {
          displayMessage += `

⚡ 遥测数据解析:
  🔋 SOC: ${result.parsedData.soc}%
  ⚡ 电压：${result.parsedData.voltage}V
  📊 电流：${result.parsedData.current}A`;
        }

        setDeviceData(displayMessage);
      } else {
        // 增强错误信息：如果有端点信息，显示可用端点
        let errorMsg = result.error || "读取设备失败";
        if (
          targetDevice.endpoints &&
          Array.isArray(targetDevice.endpoints) &&
          targetDevice.endpoints.length > 0
        ) {
          errorMsg += `\n\n📊 可用端点信息:\n`;
          targetDevice.endpoints.forEach((ep, idx) => {
            errorMsg += `   端点 ${idx + 1}: 0x${ep.address
              .toString(16)
              .toUpperCase()} (${ep.direction} - ${ep.type})\n`;
          });
          errorMsg += "\n💡 建议：在上方端点选择器中尝试其他端点地址";
        }
        setError(errorMsg);
      }
    } catch (err: any) {
      console.error("读取失败:", err);
      setError(err.message || "发生未知错误");
    } finally {
      setLoading(false);
    }
  };

  // 切换自动读取
  const toggleAutoRead = () => {
    if (autoRead) {
      setAutoRead(false);
    } else {
      if (usbDevices.length === 0) {
        setError("请先扫描 USB 设备");
        return;
      }
      setAutoRead(true);
    }
  };

  // 自动读取效果
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    if (autoRead && !loading) {
      intervalId = setInterval(() => {
        handleReadDeviceData();
      }, 1000); // 每秒读取一次
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRead, loading]);

  const handleClick = async () => {
    if (!navigator.usb) {
      console.error("Web USB API 不支持");
      return;
    }
    try {
      // 1. 请求设备
      const device = await navigator.usb.requestDevice({ filters: [] });
      console.log("Device found:", device);

      // 2. 打开设备
      await device.open();
      console.log("Device opened");

      // 3. 根据打印信息确认端点
      const config = device.configuration;
      if (!config) {
        throw new Error("无法获取设备配置");
      }
      const iface = config.interfaces[0];
      const inEndpoint = iface.alternates[0].endpoints.find(
        (e: any) => e.direction === "in"
      )?.endpointNumber;
      const outEndpoint = iface.alternates[0].endpoints.find(
        (e: any) => e.direction === "out"
      )?.endpointNumber;
      console.log("IN endpoint:", inEndpoint, "OUT endpoint:", outEndpoint);

      // 4. 读取数据（一次读取 64 字节，可根据设备文档调整）
      if (!inEndpoint) {
        throw new Error("未找到输入端点");
      }
      const result = await device.transferIn(inEndpoint, 64);
      const data = result.data
        ? new Uint8Array(result.data.buffer)
        : new Uint8Array();
      console.log("Received data:", data);
      // 6. 关闭设备
      await device.close();
      console.log("Device closed");
    } catch (err) {
      console.error("USB Error:", err);
    }
  };

  return (
    <div className="container p-4">
      <div
        className="p-5"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "var(--border-radius-lg)",
          color: "#fff",
          marginBottom: "var(--spacing-lg)",
        }}
      >
        {isMobile ? (
          <div
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              padding: "20px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            <p style={{ marginBottom: "10px" }}>⚠️ 移动端限制提示</p>
            <p style={{ fontSize: "14px", opacity: 0.9 }}>
              📱 移动设备由于浏览器限制，暂不支持 Web USB API。
              <br />
              💻 请使用桌面端 Chrome/Edge 浏览器或 Electron 应用访问此功能。①
            </p>
          </div>
        ) : !usbSupported && !isElectron ? (
          <div
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              padding: "20px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            <p style={{ marginBottom: "10px" }}>⚠️ 浏览器兼容性提示</p>
            <p style={{ fontSize: "14px", opacity: 0.9 }}>
              🔧 您的浏览器不支持 Web USB API。
              <br />
              🌐 请使用 Chrome 89+ 或 Edge 89+ 浏览器，或使用 Electron
              桌面应用。②
            </p>
          </div>
        ) : null}

        {/* Electron 专属功能按钮 */}
        {isElectron && (
          <>
            <button
              onClick={handleGetUsbDevices}
              disabled={loading}
              style={{
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "wait" : "pointer",
                padding: "12px 24px",
                background: "#4ecdc4",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontWeight: "bold",
                fontSize: "16px",
                marginTop: "10px",
                marginRight: "10px",
              }}
            >
              {loading ? "⏳ 加载中..." : "🔍 扫描 USB 设备"}
            </button>

            <button
              onClick={handleReadDeviceData}
              disabled={loading || usbDevices.length === 0}
              style={{
                opacity: loading || usbDevices.length === 0 ? 0.5 : 1,
                cursor:
                  loading || usbDevices.length === 0
                    ? "not-allowed"
                    : "pointer",
                padding: "12px 24px",
                background: "#ff6b6b",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontWeight: "bold",
                fontSize: "16px",
                marginTop: "10px",
                marginRight: "10px",
              }}
            >
              {loading ? "⏳ 读取中..." : "📖 读取设备数据"}
            </button>

            <button
              onClick={toggleAutoRead}
              disabled={usbDevices.length === 0}
              style={{
                opacity: usbDevices.length === 0 ? 0.5 : 1,
                cursor: usbDevices.length === 0 ? "not-allowed" : "pointer",
                padding: "12px 24px",
                background: autoRead ? "#ffa500" : "#4CAF50",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontWeight: "bold",
                fontSize: "16px",
                marginTop: "10px",
              }}
            >
              {autoRead ? "⏸️ 停止自动读取" : "▶️ 自动连续读取"}
            </button>
          </>
        )}

        {/* Web USB 模式按钮 */}
        {!isElectron && (
          <button
            onClick={handleClick}
            disabled={isMobile || !usbSupported}
            style={{
              opacity: isMobile || !usbSupported ? 0.5 : 1,
              cursor: isMobile || !usbSupported ? "not-allowed" : "pointer",
              padding: "12px 24px",
              background: "#fff",
              color: "#667eea",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              fontSize: "16px",
              marginTop: "10px",
            }}
          >
            {isMobile
              ? "📱 移动端不支持"
              : !usbSupported
              ? "⚠️ 浏览器不支持"
              : "🔌 点击读取 USB 设备"}
          </button>
        )}

        {/* 错误提示 */}
        {error && (
          <div
            style={{
              background: "rgba(255, 82, 82, 0.2)",
              padding: "15px",
              borderRadius: "8px",
              marginTop: "20px",
              border: "1px solid rgba(255, 82, 82, 0.5)",
            }}
          >
            <p
              style={{
                marginBottom: "5px",
                fontWeight: "bold",
                color: "#ff5252",
              }}
            >
              ❌ 错误提示
            </p>
            <p style={{ fontSize: "14px", color: "#fff" }}>{error}</p>
          </div>
        )}

        {/* 设备选择器 */}
        {usbDevices.length > 0 && (
          <div
            style={{
              background: "rgba(102, 126, 234, 0.15)",
              padding: "15px",
              borderRadius: "8px",
              marginTop: "20px",
              border: "1px solid rgba(102, 126, 234, 0.4)",
            }}
          >
            <p
              style={{
                marginBottom: "10px",
                fontWeight: "bold",
                color: "#667eea",
              }}
            >
              🔌 设备选择
            </p>
            <select
              value={
                selectedDevice
                  ? `${selectedDevice.idVendor}_${selectedDevice.idProduct}`
                  : ""
              }
              onChange={(e) => {
                const [vendorId, productId] = e.target.value.split("_");
                const device = usbDevices.find(
                  (d) => d.idVendor === vendorId && d.idProduct === productId
                );
                setSelectedDevice(device || null);

                // 更新可用端点列表（安全检查）
                if (
                  device?.endpoints &&
                  Array.isArray(device.endpoints) &&
                  device.endpoints.length > 0
                ) {
                  setAvailableEndpoints(device.endpoints);
                  // 自动选择第一个输入端点
                  const inEndpoint = device.endpoints.find(
                    (ep) =>
                      ep.direction === "in" ||
                      ep.address === 0x81 ||
                      ep.address === 0x81
                  );
                  if (inEndpoint) {
                    setEndpoint(inEndpoint.address);
                  } else if (device.endpoints[0]) {
                    setEndpoint(device.endpoints[0].address);
                  }
                } else {
                  setAvailableEndpoints([]);
                  setEndpoint(0x81); // 默认值
                }
              }}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.95)",
                color: "#333",
                fontSize: "14px",
                marginBottom: "10px",
              }}
            >
              <option value="">-- 选择设备 --</option>
              {usbDevices.map((device, index) => (
                <option
                  key={index}
                  value={`${device.idVendor}_${device.idProduct}`}
                >
                  设备 {index + 1}: Vendor {device.idVendor}, Product{" "}
                  {device.idProduct}
                  (地址：{device.deviceAddress})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 数据流历史 */}
        {dataStream.length > 0 && (
          <div
            style={{
              background: "rgba(255, 107, 107, 0.1)",
              padding: "15px",
              borderRadius: "8px",
              marginTop: "20px",
              border: "1px solid rgba(255, 107, 107, 0.3)",
              maxHeight: "300px",
              overflowY: "auto",
            }}
          >
            <p
              style={{
                marginBottom: "10px",
                fontWeight: "bold",
                color: "#ff6b6b",
              }}
            >
              📈 数据流历史 ({dataStream.length} 条)
            </p>
            {dataStream.map((item, index) => (
              <div
                key={index}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  padding: "8px",
                  borderRadius: "4px",
                  marginBottom: "8px",
                  fontSize: "12px",
                  color: "#fff",
                }}
              >
                <span style={{ color: "#4ecdc4", fontWeight: "bold" }}>
                  [{item.time}]
                </span>
                <div style={{ marginLeft: "10px", marginTop: "4px" }}>
                  <div style={{ opacity: 0.8 }}>HEX: {item.hex}</div>
                  <div
                    style={{ opacity: 0.6, fontSize: "11px", marginTop: "2px" }}
                  >
                    LEN: {item.data.length} bytes
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 📊 图表展示区域 */}
        <div
          style={{
            background: "rgba(78, 205, 196, 0.1)",
            padding: "20px",
            borderRadius: "12px",
            marginTop: "20px",
            border: "1px solid rgba(78, 205, 196, 0.3)",
          }}
        >
          <LineChart />
        </div>
      </div>
    </div>
  );
}
