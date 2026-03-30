import { useEffect, useRef } from "react";
import * as echarts from "echarts";
export default function LineChart() {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const myChart = echarts.init(chartRef.current);

    // 生成最近 8 个时间点
    const now = new Date();
    const timeData = [];
    for (let i = 7; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 5 * 60 * 1000); // 每 5 分钟一个点
      const hours = time.getHours().toString().padStart(2, "0");
      const minutes = time.getMinutes().toString().padStart(2, "0");
      timeData.push(`${hours}:${minutes}`);
    }

    // 🎨 高端科技感配色方案
    const option = {
      // 标题样式优化
      title: {
        text: "⚡ 实时电压电流监控",
        left: "center",
        top: 0,
        textStyle: {
          color: "#667eea",
          fontSize: 22,
          fontWeight: "bold",
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        },
      },

      // 提示框优化 - 毛玻璃效果
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(10, 14, 33, 0.95)",
        borderColor: "rgba(102, 126, 234, 0.5)",
        borderWidth: 2,
        textStyle: {
          color: "#fff",
          fontSize: 14,
        },
        extraCssText:
          "box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3); border-radius: 12px; backdrop-filter: blur(10px);",
      },

      // 图例优化
      legend: {
        data: ["电压 (V)", "电流 (A)"],
        bottom: 0,
        itemWidth: 25,
        itemHeight: 14,
        textStyle: {
          color: "#a0aec0",
          fontSize: 13,
          fontWeight: "500",
        },
        icon: "roundRect",
      },

      // 工具栏优化
      toolbox: {
        show: true,
        right: 0,
        top: 0,
        itemSize: 20,
        itemGap: 20,
        emphasis: {
          iconStyle: {
            shadowBlur: 10,
            shadowColor: "rgba(102, 126, 234, 0.5)",
            shadowOffsetX: 0,
            shadowOffsetY: 0,
          },
        },
        feature: {
          magicType: {
            type: ["line", "bar"],
            icon: {
              line: "path://M128 832h768v64H128z M192 640l160-160 128 128 192-256 128 96-256 320-128-128-160 160z",
              bar: "path://M128 832h768v64H128z M192 512h128v256H192z M448 320h128v448H448z M704 128h128v640H704z",
            },
          },
          restore: {
            icon: "path://M793.6 793.6H230.4c-35.3 0-64-28.7-64-64V294.4c0-35.3 28.7-64 64-64h435.2c35.3 0 64 28.7 64 64v102.4l128-128-128-128v102.4c0-70.7-57.3-128-128-128H230.4C124.5 115.2 38.4 201.3 38.4 307.2v422.4c0 105.9 86.1 192 192 192h563.2c70.7 0 128-57.3 128-128h-128c0 35.3-28.7 64-64 64z",
          },
          saveAsImage: {
            icon: "path://M512 64L512 768M512 768L256 512M512 768L768 512",
          },
        },
      },

      // 网格优化 - 增加右侧留白防止被侧边栏遮挡
      grid: {
        left: "10%",
        right: "18%", // 增加右侧空间，防止被侧边栏遮挡
        bottom: "12%",
        top: "16%",
        containLabel: true,
      },

      // X 轴优化 - 时间轴
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: timeData,
        axisLine: {
          lineStyle: {
            color: "rgba(102, 126, 234, 0.3)",
            width: 1,
          },
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: "#a0aec0",
          fontSize: 14,
          margin: 15,
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          rotate: 0,
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: "rgba(102, 126, 234, 0.05)",
            type: "dashed",
          },
        },
      },

      // Y 轴优化 - 左侧电压
      yAxis: [
        {
          type: "value",
          name: "电压 (V)",
          min: 0,
          max: 28,
          interval: 4,
          nameTextStyle: {
            color: "#667eea",
            fontSize: 13,
            fontWeight: "bold",
            padding: [0, 0, 0, 0],
          },
          axisLabel: {
            formatter: "{value} V",
            color: "#667eea",
            fontSize: 12,
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: "rgba(102, 126, 234, 0.5)",
            },
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: "rgba(102, 126, 234, 0.1)",
              width: 2,
              type: "solid",
            },
          },
        },
        // 右侧电流轴
        {
          type: "value",
          name: "电流 (A)",
          min: 0,
          max: 8,
          interval: 2,
          nameTextStyle: {
            color: "#4ecdc4",
            fontSize: 13,
            fontWeight: "bold",
            padding: [0, 0, 0, 0],
          },
          axisLabel: {
            formatter: "{value} A",
            color: "#4ecdc4",
            fontSize: 12,
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: "rgba(78, 205, 196, 0.5)",
            },
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            show: false,
                     lineStyle: {
              color: "rgba(102, 126, 234, 0.1)",
              width: 2,
              type: "solid",
            },
          },
        },
      ],

      // 系列优化 - 电压曲线
      series: [
        {
          name: "电压 (V)",
          type: "line",
          yAxisIndex: 0,
          smooth: true,
          symbol: "circle",
          symbolSize: 10,
          sampling: "average",
          itemStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "#667eea" },
                { offset: 1, color: "#4ecdc4" },
              ],
            },
            shadowBlur: 15,
            shadowColor: "rgba(102, 126, 234, 0.5)",
            shadowOffsetX: 0,
            shadowOffsetY: 5,
          },
          lineStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: "#667eea" },
                { offset: 0.5, color: "#764ba2" },
                { offset: 1, color: "#4ecdc4" },
              ],
            },
            width: 4,
            shadowBlur: 10,
            shadowColor: "rgba(102, 126, 234, 0.4)",
            shadowOffsetX: 0,
            shadowOffsetY: 3,
          },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(102, 126, 234, 0.3)" },
                { offset: 1, color: "rgba(102, 126, 234, 0.05)" },
              ],
            },
            shadowBlur: 20,
            shadowColor: "rgba(102, 126, 234, 0.3)",
          },
          data: [12.1, 12.3, 11.9, 12.5, 12.2, 12.4, 12.0, 8.3],
          markPoint: {
            symbol: "pin",
            symbolSize: 50,
            animationDuration: 1000,
            animationDelay: 500,
            itemStyle: {
              color: "#ff6b6b",
              shadowBlur: 15,
              shadowColor: "rgba(255, 107, 107, 0.5)",
            },
            label: {
              color: "#fff",
              fontSize: 12,
              fontWeight: "bold",
            },
            data: [
              { type: "max", name: "最高电压", value: "" },
              { type: "min", name: "最低电压", value: "" },
            ],
          },
          markLine: {
            symbol: ["none", "none"],
            label: {
              show: true,
              position: "end",
              offset: [30, 0], // 👉 向右偏移
              color: "#4ecdc4",
              fontSize: 12,
              fontWeight: "bold",
            },
            lineStyle: {
              color: "rgba(78, 205, 196, 0.5)",
              width: 2,
              type: "dashed",
            },
            data: [
              {
                type: "average",
                name: "平均值",
                label: {
                  formatter: "平均：{c}V",
                },
              },
            ],
          },
        },
        // 电流曲线
        {
          name: "电流 (A)",
          type: "line",
          yAxisIndex: 1,
          smooth: true,
          symbol: "circle",
          symbolSize: 10,
          sampling: "average",
          itemStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "#f093fb" },
                { offset: 1, color: "#f5576c" },
              ],
            },
            shadowBlur: 15,
            shadowColor: "rgba(240, 147, 251, 0.5)",
            shadowOffsetX: 0,
            shadowOffsetY: 5,
          },
          lineStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: "#f093fb" },
                { offset: 0.5, color: "#4facfe" },
                { offset: 1, color: "#f5576c" },
              ],
            },
            width: 4,
            shadowBlur: 10,
            shadowColor: "rgba(240, 147, 251, 0.4)",
            shadowOffsetX: 0,
            shadowOffsetY: 3,
          },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(240, 147, 251, 0.2)" },
                { offset: 1, color: "rgba(240, 147, 251, 0.02)" },
              ],
            },
            shadowBlur: 20,
            shadowColor: "rgba(240, 147, 251, 0.2)",
          },
          data: [5.2, 5.5, 5.1, 5.8, 5.4, 5.6, 5.3, 5.5],
          markPoint: {
            symbol: "pin",
            symbolSize: 45,
            animationDuration: 1000,
            animationDelay: 800,
            itemStyle: {
              color: "#4facfe",
              shadowBlur: 15,
              shadowColor: "rgba(79, 172, 254, 0.5)",
            },
            label: {
              color: "#fff",
              fontSize: 12,
              fontWeight: "bold",
            },
            data: [
              {
                name: "最低电流",
                value: "",
                type: "min",
              },
            ],
          },
          markLine: {
            symbol: ["none", "none"],
            label: {
              show: true,
              position: "end",
              offset: [30, 0], // 👉 向右偏移
              color: "#f5576c",
              fontSize: 12,
              fontWeight: "bold",
            },
            lineStyle: {
              color: "rgba(245, 87, 108, 0.5)",
              width: 2,
              type: "dashed",
            },
            data: [
              {
                type: "average",
                name: "平均值",
                label: {
                  formatter: "平均：{c}A",
                },
              },
            ],
          },
        },
      ],

      // 动画优化
      animationDuration: 1000,
      animationEasing: "cubicOut" as const,
      animationDurationUpdate: 1000,
      animationEasingUpdate: "cubicInOut" as const,
    };

    myChart.setOption(option);

    // ✅ 使用 ResizeObserver 监听容器尺寸变化（包括侧边栏展开/收起）
    const containerElement = chartRef.current.parentElement;

    // ✅ 同时监听窗口大小变化
    const handleResize = () => {
      myChart.resize();
    };
    window.addEventListener("resize", handleResize);

    if (containerElement) {
      const resizeObserver = new ResizeObserver(() => {
        myChart.resize();
      });
      resizeObserver.observe(containerElement);

      // 清理观察器
      return () => {
        resizeObserver.disconnect();
        window.removeEventListener("resize", handleResize);
        myChart.dispose();
      };
    }

    // ✅ 关键：销毁实例（防内存泄漏）
    return () => {
      window.removeEventListener("resize", handleResize);
      myChart.dispose();
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "600px",
        background:
          "linear-gradient(135deg, rgba(10, 14, 33, 0.95), rgba(26, 31, 58, 0.95))",
        borderRadius: "16px",
        padding: "20px",
        boxShadow:
          "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 顶部装饰光效 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "60%",
          height: "2px",
          background:
            "linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.5), transparent)",
          borderRadius: "2px",
        }}
      />
      <div ref={chartRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
