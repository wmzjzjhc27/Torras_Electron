import { useEffect, useState } from "react";

interface UsbDevice {
  busNumber: number;
  deviceAddress: number;
  deviceVersion: string;
  idProduct: string;
  idVendor: string;
  manufacturer: number | null;
  product: number | null;
  serialNumber: number | null;
  // 新增驱动相关字段
  driverName?: string;      // 驱动名称
  driverType?: string;      // 驱动类型（如 USB 驱动、串口驱动等）
  deviceClass?: number;     // 设备类代码
  deviceSubClass?: number;  // 设备子类代码
  manufacturerName?: string; // 厂牌名称
  productName?: string;     // 产品名称
}

export default function DeviceManager() {
  const [devices, setDevices] = useState<UsbDevice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [selectedDevice, setSelectedDevice] = useState<UsbDevice | null>(null);
  const [deviceData, setDeviceData] = useState<number[]>([]);

  // 获取 USB 设备列表
  const handleScanDevices = async () => {
    if (!window.electronAPI) {
      setError("当前环境不支持 Electron API");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result = await window.electronAPI.getUsbDevices();
      if (result.success && result.devices) {
        setDevices(result.devices);
        setDeviceData([]);
        setSelectedDevice(null);
      } else {
        setError(result.error || "扫描设备失败");
      }
    } catch (err: any) {
      setError(err.message || "发生未知错误");
    } finally {
      setLoading(false);
    }
  };

  // 读取选中设备的数据
  const handleReadData = async () => {
    if (!selectedDevice || !window.electronAPI) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result = await window.electronAPI.readDeviceData({
        vendorId: parseInt(selectedDevice.idVendor),
        productId: parseInt(selectedDevice.idProduct),
        endpoint: 0x81, // 默认端点
        packetSize: 64, // 默认包大小
      });
      
      if (result.success && result.data) {
        setDeviceData(result.data);
      } else {
        setError(result.error || "读取数据失败");
      }
    } catch (err: any) {
      setError(err.message || "发生未知错误");
    } finally {
      setLoading(false);
    }
  };

  // 获取设备类描述
  const getClassDescription = (deviceClass: number): string => {
    const classMap: Record<number, string> = {
      0x00: "未指定",
      0x01: "音频",
      0x02: "通信/CDC",
      0x03: "HID (人机接口设备)",
      0x05: "物理",
      0x06: "图像",
      0x07: "打印",
      0x08: "大容量存储",
      0x09: "USB 集线器",
      0x0A: "CDC-数据",
      0x0B: "智能卡",
      0x0D: "安全内容",
      0x0E: "视频",
      0x0F: "个人医疗",
      0xDC: "诊断设备",
      0xE0: "无线控制器",
      0xEF: "杂项",
      0xFE: "应用特定",
      0xFF: "供应商特定"
    };
    return classMap[deviceClass] || `未知 (0x${deviceClass.toString(16).toUpperCase()})`;
  };

  useEffect(() => {
    // 组件加载时自动扫描设备
    if (window.electronAPI) {
      handleScanDevices();
    }
  }, []);

  // 监听选中设备变化，打印驱动信息到控制台
  useEffect(() => {
    if (selectedDevice) {
      console.log("\n========== 选中设备驱动信息 ==========");
      console.log("📌 基本信息:");
      console.log(`   总线号：${selectedDevice.busNumber}`);
      console.log(`   设备地址：${selectedDevice.deviceAddress}`);
      console.log(`   厂商 ID: ${selectedDevice.idVendor}`);
      console.log(`   产品 ID: ${selectedDevice.idProduct}`);
      console.log(`   设备版本：${selectedDevice.deviceVersion}`);
      console.log(`   制造商：${selectedDevice.manufacturerName || '未知'}`);
      console.log(`   产品名称：${selectedDevice.productName || '未知'}`);
      
      console.log("\n🎯 驱动信息:");
      console.log(`   驱动类型：${selectedDevice.driverType || '未知'}`);
      console.log(`   驱动名称：${selectedDevice.driverName || '未知'}`);
      console.log(`   设备类：${getClassDescription(selectedDevice.deviceClass || 0)} (0x${((selectedDevice.deviceClass || 0).toString(16)).toUpperCase().padStart(2, '0')})`);
      console.log(`   设备子类：0x${((selectedDevice.deviceSubClass || 0).toString(16)).toUpperCase().padStart(2, '0')}`);
      console.log("========================================\n");
    }
  }, [selectedDevice]);

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
        <h1 className="text-3xl mb-3">🔌 USB 设备管理器</h1>
        <p className="text-lg mb-4">
          使用 Node.js USB 模块直接访问硬件设备，支持工业级 USB 设备
        </p>

        {/* 操作按钮 */}
        <button
          onClick={handleScanDevices}
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
            marginRight: "10px",
          }}
        >
          {loading ? "⏳ 扫描中..." : "🔄 重新扫描设备"}
        </button>

        {selectedDevice && (
          <button
            onClick={handleReadData}
            disabled={loading}
            style={{
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "wait" : "pointer",
              padding: "12px 24px",
              background: "#ff6b6b",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            {loading ? "⏳ 读取中..." : "📖 读取设备数据"}
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
            <p style={{ marginBottom: "5px", fontWeight: "bold", color: "#ff5252" }}>
              ❌ 错误提示
            </p>
            <p style={{ fontSize: "14px", color: "#fff" }}>{error}</p>
          </div>
        )}
      </div>

      {/* 设备列表 */}
      <div className="row">
        <div className="col col-12 mb-4">
          <h2 className="text-2xl mb-3" style={{ color: "#667eea" }}>
            📱 发现 {devices.length} 个 USB 设备
          </h2>

          {devices.length === 0 ? (
            <div
              style={{
                background: "rgba(102, 126, 234, 0.1)",
                padding: "30px",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <p style={{ fontSize: "18px", color: "#667eea" }}>
                🔍 暂未发现 USB 设备，请连接设备后重新扫描
              </p>
            </div>
          ) : (
            <div className="row">
              {devices.map((device, index) => (
                <div key={`${device.busNumber}-${device.deviceAddress}`} className="col col-12 col-md-6 col-lg-4 mb-4">
                  <div
                    onClick={() => setSelectedDevice(device)}
                    style={{
                      border: selectedDevice === device 
                        ? "2px solid #667eea" 
                        : "1px solid #e0e0e0",
                      borderRadius: "var(--border-radius-md)",
                      background: selectedDevice === device
                        ? "rgba(102, 126, 234, 0.05)"
                        : "#fff",
                      padding: "20px",
                      height: "100%",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      boxShadow: selectedDevice === device
                        ? "0 4px 12px rgba(102, 126, 234, 0.2)"
                        : "0 2px 8px rgba(0, 0, 0, 0.08)",
                    }}
                  >
                    <h3
                      className="text-xl mb-2"
                      style={{ color: "#667eea" }}
                    >
                      🔌 设备 #{index + 1}
                    </h3>
                    <ul style={{ paddingLeft: "20px", lineHeight: "1.8", fontSize: "14px" }}>
                      <li><strong>总线号:</strong> {device.busNumber}</li>
                      <li><strong>设备地址:</strong> {device.deviceAddress}</li>
                      <li><strong>厂商 ID:</strong> {device.idVendor}</li>
                      <li><strong>产品 ID:</strong> {device.idProduct}</li>
                      <li><strong>设备版本:</strong> {device.deviceVersion}</li>
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 选中设备详情 - 显示驱动信息 */}
        {selectedDevice && (
          <div className="col col-12 mb-4">
            <div
              style={{
                background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
                padding: "25px",
                borderRadius: "var(--border-radius-lg)",
                border: "2px solid #667eea",
                boxShadow: "0 4px 20px rgba(102, 126, 234, 0.15)",
              }}
            >
              <h3 className="text-2xl mb-4" style={{ color: "#667eea" }}>
                🔍 选中设备详情 - {selectedDevice.productName || `设备 ${selectedDevice.busNumber}-${selectedDevice.deviceAddress}`}
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
                {/* 基本信息 */}
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.8)",
                    padding: "20px",
                    borderRadius: "8px",
                    border: "1px solid rgba(102, 126, 234, 0.2)",
                  }}
                >
                  <h4 className="text-lg mb-3" style={{ color: "#764ba2", fontWeight: "bold" }}>
                    📌 基本信息
                  </h4>
                  <ul style={{ paddingLeft: "20px", lineHeight: "2", fontSize: "14px" }}>
                    <li><strong>总线号:</strong> {selectedDevice.busNumber}</li>
                    <li><strong>设备地址:</strong> {selectedDevice.deviceAddress}</li>
                    <li><strong>厂商 ID:</strong> {selectedDevice.idVendor}</li>
                    <li><strong>产品 ID:</strong> {selectedDevice.idProduct}</li>
                    <li><strong>设备版本:</strong> {selectedDevice.deviceVersion}</li>
                    {selectedDevice.manufacturerName && (
                      <li><strong>制造商:</strong> {selectedDevice.manufacturerName}</li>
                    )}
                    {selectedDevice.productName && (
                      <li><strong>产品名称:</strong> {selectedDevice.productName}</li>
                    )}
                  </ul>
                </div>

                {/* 驱动信息 */}
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.8)",
                    padding: "20px",
                    borderRadius: "8px",
                    border: "1px solid rgba(102, 126, 234, 0.2)",
                  }}
                >
                  <h4 className="text-lg mb-3" style={{ color: "#764ba2", fontWeight: "bold" }}>
                    🎯 驱动信息
                  </h4>
                  <ul style={{ paddingLeft: "20px", lineHeight: "2", fontSize: "14px" }}>
                    <li>
                      <strong>驱动类型:</strong> 
                      <span style={{ color: "#667eea", fontWeight: "bold" }}> {selectedDevice.driverType || "未知"}</span>
                    </li>
                    <li>
                      <strong>驱动名称:</strong> 
                      <span style={{ color: "#4ecdc4", fontWeight: "bold", fontFamily: "Consolas, monospace" }}> {selectedDevice.driverName || "未知"}</span>
                    </li>
                    <li>
                      <strong>设备类:</strong> 
                      <span style={{ color: "#ff6b6b" }}> 
                        {getClassDescription(selectedDevice.deviceClass || 0)} 
                        (0x{((selectedDevice.deviceClass || 0).toString(16)).toUpperCase().padStart(2, '0')})
                      </span>
                    </li>
                    <li>
                      <strong>设备子类:</strong> 
                      <span style={{ color: "#888" }}> 
                        0x{((selectedDevice.deviceSubClass || 0).toString(16)).toUpperCase().padStart(2, '0')}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* 操作按钮 */}
              <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                <button
                  onClick={handleReadData}
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
                  }}
                >
                  {loading ? "⏳ 读取中..." : "📖 读取设备数据"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 设备数据展示 */}
        {deviceData.length > 0 && (
          <div className="col col-12">
            <div
              style={{
                background: "rgba(78, 205, 196, 0.15)",
                padding: "20px",
                borderRadius: "8px",
                border: "1px solid rgba(78, 205, 196, 0.4)",
              }}
            >
              <h3 className="text-xl mb-3" style={{ color: "#4ecdc4" }}>
                📊 读取的数据9666666666666666666
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))", gap: "8px" }}>
                {deviceData.map((byte, index) => (
                  <div
                    key={index}
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      padding: "10px",
                      borderRadius: "4px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "12px", color: "#aaa", marginBottom: "4px" }}>
                      [{index}]
                    </div>
                    <div style={{ fontSize: "16px", fontWeight: "bold", color: "#fff" }}>
                      {byte.toString(16).padStart(2, '0').toUpperCase()}
                    </div>
                    <div style={{ fontSize: "10px", color: "#888" }}>
                      {byte}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
