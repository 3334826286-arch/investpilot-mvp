"use client";

import dynamic from "next/dynamic";

const ReactECharts = dynamic(() => import("echarts-for-react"), {
  ssr: false
});

export function EChartPanel({ option, height = 320, className = "" }) {
  return (
    <div className={`soft-panel rounded-[28px] p-4 ${className}`}>
      <ReactECharts option={option} notMerge lazyUpdate style={{ height, width: "100%" }} />
    </div>
  );
}
