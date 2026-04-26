"use client";

import Link from "next/link";
import { startTransition, useDeferredValue, useEffect, useRef, useState } from "react";
import { EChartPanel } from "@/components/charts/echart-panel";
import { DataStatusNote } from "@/components/data-status-note";
import { SignalBadge } from "@/components/signal-badge";
import { buildRadarOption } from "@/lib/chart-options";
import { formatPlainPercent, getRiskTone } from "@/lib/format";

export function RiskWorkbench({ stocks, initialPayload, initialPosition = 45 }) {
  const [symbol, setSymbol] = useState(initialPayload?.data?.stock?.symbol ?? stocks[0]?.symbol ?? "");
  const [position, setPosition] = useState(initialPosition);
  const [payload, setPayload] = useState(initialPayload);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("风险工作台已就绪。");
  const initialLoadSkippedRef = useRef(false);
  const deferredSymbol = useDeferredValue(symbol);
  const deferredPosition = useDeferredValue(position);

  useEffect(() => {
    if (!initialLoadSkippedRef.current) {
      initialLoadSkippedRef.current = true;
      return undefined;
    }

    const controller = new AbortController();
    setError("");
    setStatus("正在更新风险评估...");

    fetch(`/api/v1/stocks/${deferredSymbol}/analysis?position=${(deferredPosition / 100).toFixed(2)}`, {
      signal: controller.signal,
      cache: "no-store"
    })
      .then(async (response) => {
        const nextPayload = await response.json();
        if (!response.ok) {
          throw new Error(nextPayload?.meta?.errorMessage || "风险评估接口返回异常。");
        }

        startTransition(() => {
          setPayload(nextPayload);
          setStatus(
            nextPayload?.meta?.fallback
              ? "真实接口暂未连通，当前展示本地兜底结果。"
              : "风险评估已按最新参数更新。"
          );
        });
      })
      .catch((nextError) => {
        if (nextError.name === "AbortError") {
          return;
        }

        setError(nextError.message);
        setStatus("风险评估更新失败，已保留上一版结果。");
      });

    return () => controller.abort();
  }, [deferredSymbol, deferredPosition]);

  const current = payload?.data;
  const stock = current?.stock;
  const assessment = current?.risk;

  if (!stock || !assessment) {
    return (
      <div className="strong-panel rounded-[30px] p-6">
        <p className="text-sm text-slate-500">当前标的暂无可用数据。</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
      <section className="strong-panel rounded-[30px] p-5 sm:p-6">
        <p className="section-kicker">风险工作台</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-slate-950">个股 + 市场 + 仓位的综合判断</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          用统一接口拉起个股分析，再结合仓位暴露与系统性环境做规则驱动的风险评估，确保结果可解释、可复核、可扩展。
        </p>

        <DataStatusNote meta={payload?.meta} className="mt-4" />

        <div className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm text-slate-500">
            选择个股
            <select
              value={symbol}
              onChange={(event) => setSymbol(event.target.value)}
              className="h-12 rounded-2xl border border-slate-900/10 bg-white px-4 outline-none transition focus:border-slate-900/30 focus:ring-4 focus:ring-slate-900/5"
            >
              {stocks.map((item) => (
                <option key={item.symbol} value={item.symbol}>
                  {item.name} {item.symbol}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-3 text-sm text-slate-500">
            当前仓位
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={position}
              onChange={(event) => setPosition(Number(event.target.value))}
            />
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>轻仓试错</span>
              <span className="font-medium text-slate-700">{formatPlainPercent(position)}</span>
              <span>高暴露</span>
            </div>
          </label>
        </div>

        <div className="mt-6 rounded-[24px] border border-slate-900/8 bg-white/86 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <SignalBadge tone={getRiskTone(assessment.level)}>{assessment.level}</SignalBadge>
            <span className="text-sm text-slate-500">综合得分 {assessment.totalScore}</span>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-700">{assessment.managementAdvice}</p>
          <p className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-600">
            交易教练提示：{assessment.coachHint}
          </p>
          <p className="mt-3 text-sm text-slate-500">{status}</p>
          {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
          <Link
            href={`/stock/${stock.symbol}`}
            className="mt-5 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white"
          >
            进入 {stock.name} 详情页
          </Link>
        </div>
      </section>

      <div className="grid gap-6">
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="soft-panel rounded-[26px] p-5">
            <p className="text-sm text-slate-500">风险暴露</p>
            <p className="mt-3 font-display text-4xl font-semibold text-slate-950">{assessment.exposure}</p>
            <p className="mt-2 text-sm text-slate-500">综合仓位与因子后的风险温度。</p>
          </div>
          <div className="soft-panel rounded-[26px] p-5">
            <p className="text-sm text-slate-500">动作建议</p>
            <p className="mt-3 text-xl font-semibold text-slate-950">{assessment.actionSummary}</p>
            <p className="mt-2 text-sm text-slate-500">{stock.summary}</p>
          </div>
          <div className="soft-panel rounded-[26px] p-5">
            <p className="text-sm text-slate-500">当前标的</p>
            <p className="mt-3 text-xl font-semibold text-slate-950">
              {stock.name} <span className="text-sm text-slate-400">{stock.symbol}</span>
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {stock.sector} · {stock.market}
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <EChartPanel option={buildRadarOption(stock.radarMetrics)} height={330} />

          <div className="soft-panel rounded-[28px] p-5">
            <p className="section-kicker">风险因子拆解</p>
            <div className="mt-5 space-y-4">
              {assessment.factors.map((item) => (
                <div key={item.key}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-900">{item.label}</p>
                    <span className="text-sm text-slate-500">{item.score}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${
                        item.score >= 68 ? "bg-rose-500" : item.score >= 43 ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
