"use client";

import Link from "next/link";
import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { DataStatusNote } from "@/components/data-status-note";
import { WatchlistToggle } from "@/components/watchlist-toggle";

const DEFAULT_FILTERS = {
  trend: "all",
  valuation: "all",
  growth: "all",
  risk: "all"
};

export function ScreenerWorkbench({ initialPayload }) {
  const [filters, setFilters] = useState(initialPayload?.data?.appliedFilters ?? DEFAULT_FILTERS);
  const [payload, setPayload] = useState(initialPayload);
  const [error, setError] = useState("");
  const deferredFilters = useDeferredValue(filters);

  useEffect(() => {
    const controller = new AbortController();
    const search = new URLSearchParams(deferredFilters);
    setError("");

    fetch(`/api/v1/screener/snapshot?${search.toString()}`, {
      signal: controller.signal,
      cache: "no-store"
    })
      .then(async (response) => {
        const nextPayload = await response.json();
        if (!response.ok) {
          throw new Error(nextPayload?.meta?.errorMessage || "量化选股接口返回异常。");
        }

        startTransition(() => {
          setPayload(nextPayload);
        });
      })
      .catch((nextError) => {
        if (nextError.name === "AbortError") {
          return;
        }

        setError(nextError.message);
      });

    return () => controller.abort();
  }, [deferredFilters]);

  const screener = payload?.data;

  if (!screener) {
    return null;
  }

  return (
    <div className="grid gap-6">
      <section className="strong-panel rounded-[34px] px-5 py-6 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="section-kicker">量化选股</p>
            <h1 className="mt-2 font-display text-4xl font-semibold text-slate-950">规则驱动的可解释候选池</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              第一版先把基础股票池、趋势、估值、成长和风险等级做成可运行的真实筛选逻辑，确保每只股票都能解释“为什么入选”。
            </p>
          </div>
          <DataStatusNote meta={payload.meta} />
        </div>
      </section>

      <section className="soft-panel rounded-[30px] p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-4">
          {Object.entries(screener.filters).map(([key, options]) => (
            <label key={key} className="grid gap-2 text-sm text-slate-500">
              <span>{key === "trend" ? "趋势" : key === "valuation" ? "估值" : key === "growth" ? "成长" : "风险等级"}</span>
              <select
                value={filters[key]}
                onChange={(event) => setFilters((current) => ({ ...current, [key]: event.target.value }))}
                className="h-12 rounded-2xl border border-slate-900/10 bg-white px-4 outline-none transition focus:border-slate-900/30 focus:ring-4 focus:ring-slate-900/5"
              >
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span>基础股票池：{screener.poolSummary.poolName}</span>
          <span>股票数：{screener.poolSummary.poolSize}</span>
          <span>命中结果：{screener.poolSummary.matchCount}</span>
          {screener.poolSummary.poolMode === "seeded" ? <span>当前为后端种子股票池</span> : null}
          {error ? <span className="text-rose-600">{error}</span> : null}
        </div>
      </section>

      <section className="grid gap-4">
        {screener.items.length ? (
          screener.items.map((item) => (
            <div key={item.symbol} className="soft-panel rounded-[28px] p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <Link href={`/stock/${item.symbol}`} className="text-xl font-semibold text-slate-950">
                    {item.name} <span className="text-sm text-slate-400">{item.symbol}</span>
                  </Link>
                  <p className="mt-2 text-sm text-slate-500">
                    {item.sector} · {item.market} · {item.riskLevel}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.reasons.join("；")}</p>
                </div>

                <div className="flex flex-col items-start gap-3 lg:items-end">
                  <div className="text-left lg:text-right">
                    <p className="font-display text-3xl font-semibold text-slate-950">{item.score}</p>
                    <p className="mt-1 text-sm text-slate-500">综合得分</p>
                  </div>
                  <WatchlistToggle symbol={item.symbol} />
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[22px] border border-slate-900/8 bg-white/84 px-4 py-3">
                  <p className="text-sm text-slate-500">趋势因子</p>
                  <p className="mt-2 font-medium text-slate-950">{item.metrics.trend}</p>
                </div>
                <div className="rounded-[22px] border border-slate-900/8 bg-white/84 px-4 py-3">
                  <p className="text-sm text-slate-500">估值因子</p>
                  <p className="mt-2 font-medium text-slate-950">{item.metrics.valuation}</p>
                </div>
                <div className="rounded-[22px] border border-slate-900/8 bg-white/84 px-4 py-3">
                  <p className="text-sm text-slate-500">成长因子</p>
                  <p className="mt-2 font-medium text-slate-950">{item.metrics.growth}</p>
                </div>
                <div className="rounded-[22px] border border-slate-900/8 bg-white/84 px-4 py-3">
                  <p className="text-sm text-slate-500">风控因子</p>
                  <p className="mt-2 font-medium text-slate-950">{item.metrics.risk}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="soft-panel rounded-[28px] p-6 text-sm leading-7 text-slate-600">
            当前筛选条件下暂无命中结果。可以先放宽趋势或风险筛选，再观察是否出现新的候选标的。
          </div>
        )}
      </section>
    </div>
  );
}
