function grid() {
  return {
    left: 12,
    right: 12,
    top: 28,
    bottom: 12,
    containLabel: true
  };
}

export function buildIndexTrendOption(data) {
  return {
    backgroundColor: "transparent",
    tooltip: { trigger: "axis" },
    legend: {
      top: 0,
      textStyle: { color: "#6b7280" }
    },
    grid: grid(),
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: data.dates,
      axisLine: { lineStyle: { color: "rgba(100,116,139,0.2)" } },
      axisLabel: { color: "#64748b" }
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: "rgba(148,163,184,0.14)" } },
      axisLabel: { color: "#64748b" }
    },
    series: data.series.map((item, index) => ({
      name: item.name,
      type: "line",
      smooth: true,
      symbol: "none",
      lineStyle: { width: 3 },
      emphasis: { focus: "series" },
      color: ["#0f172a", "#d92d20", "#059669"][index],
      areaStyle: {
        opacity: 0.08
      },
      data: item.values
    }))
  };
}

export function buildFlowOption(data) {
  return {
    tooltip: { trigger: "axis" },
    legend: {
      top: 0,
      textStyle: { color: "#6b7280" }
    },
    grid: grid(),
    xAxis: {
      type: "category",
      data: data.dates,
      axisLabel: { color: "#64748b" },
      axisLine: { lineStyle: { color: "rgba(100,116,139,0.2)" } }
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#64748b" },
      splitLine: { lineStyle: { color: "rgba(148,163,184,0.14)" } }
    },
    series: [
      {
        name: "北向资金",
        type: "bar",
        barMaxWidth: 28,
        data: data.northbound,
        itemStyle: {
          color: "#d92d20",
          borderRadius: [10, 10, 0, 0]
        }
      },
      {
        name: "主力净流入",
        type: "line",
        smooth: true,
        symbolSize: 8,
        data: data.mainForce,
        color: "#0f172a"
      }
    ]
  };
}

function buildTreeNode(item) {
  return {
    name: `${item.name}\n${item.change > 0 ? "+" : ""}${item.change}%`,
    value: item.value,
    itemStyle: {
      color:
        item.change > 2 ? "#d92d20" : item.change > 0 ? "#ef6f6c" : item.change < 0 ? "#0f766e" : "#94a3b8"
    },
    children: item.children?.map(buildTreeNode)
  };
}

export function buildHeatmapOption(data) {
  return {
    tooltip: { formatter: "{b}" },
    series: [
      {
        type: "treemap",
        roam: false,
        nodeClick: false,
        breadcrumb: { show: false },
        label: {
          show: true,
          color: "#fff",
          formatter: "{b}",
          fontSize: 13,
          lineHeight: 18
        },
        upperLabel: {
          show: true,
          color: "#fff",
          height: 28
        },
        itemStyle: {
          borderColor: "rgba(255,255,255,0.18)",
          borderWidth: 3,
          gapWidth: 3
        },
        data: data.map(buildTreeNode)
      }
    ]
  };
}

export function buildRadarOption(metrics) {
  return {
    tooltip: {},
    radar: {
      radius: "65%",
      splitNumber: 4,
      splitArea: { areaStyle: { color: ["rgba(255,255,255,0.01)"] } },
      splitLine: { lineStyle: { color: "rgba(148,163,184,0.2)" } },
      axisLine: { lineStyle: { color: "rgba(148,163,184,0.2)" } },
      indicator: metrics.map((item) => ({ name: item.name, max: 100 }))
    },
    series: [
      {
        type: "radar",
        data: [
          {
            value: metrics.map((item) => item.value),
            areaStyle: {
              color: "rgba(217,45,32,0.16)"
            },
            lineStyle: { color: "#d92d20", width: 2 },
            itemStyle: { color: "#d92d20" }
          }
        ]
      }
    ]
  };
}

export function buildCandlestickOption(series) {
  return {
    animation: false,
    tooltip: { trigger: "axis" },
    axisPointer: { link: [{ xAxisIndex: "all" }] },
    grid: [
      { left: 12, right: 12, top: 24, height: "58%", containLabel: true },
      { left: 12, right: 12, top: "74%", height: "14%", containLabel: true }
    ],
    xAxis: [
      {
        type: "category",
        data: series.map((item) => item.date),
        axisLine: { lineStyle: { color: "rgba(100,116,139,0.2)" } },
        axisLabel: { color: "#64748b" }
      },
      {
        type: "category",
        gridIndex: 1,
        data: series.map((item) => item.date),
        axisLabel: { show: false },
        axisLine: { show: false }
      }
    ],
    yAxis: [
      {
        scale: true,
        splitLine: { lineStyle: { color: "rgba(148,163,184,0.14)" } },
        axisLabel: { color: "#64748b" }
      },
      {
        scale: true,
        gridIndex: 1,
        splitLine: { show: false },
        axisLabel: { color: "#64748b" }
      }
    ],
    series: [
      {
        type: "candlestick",
        data: series.map((item) => [item.open, item.close, item.low, item.high]),
        itemStyle: {
          color: "#d92d20",
          color0: "#00a76f",
          borderColor: "#d92d20",
          borderColor0: "#00a76f"
        }
      },
      {
        type: "bar",
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: series.map((item) => item.volume),
        itemStyle: {
          color: "#94a3b8"
        }
      }
    ]
  };
}
