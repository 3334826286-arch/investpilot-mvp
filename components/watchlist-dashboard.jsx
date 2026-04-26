"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DataStatusNote } from "@/components/data-status-note";
import { WatchlistToggle } from "@/components/watchlist-toggle";
import { readWatchlist } from "@/lib/watchlist";

function pickSuggestions(universe, watchSymbols) {
  return universe.filter((item) => !watchSymbols.includes(item.symbol)).slice(0, 4);
}

export function WatchlistDashboard({ universePayload }) {
  const [symbols, setSymbols] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const universe = universePayload?.data?.items ?? [];

  useEffect(() => {
    function syncWatchlist(event) {
      if (Array.isArray(event?.detail)) {
        setSymbols(event.detail);
        return;
      }

      setSymbols(readWatchlist());
    }

    syncWatchlist();
    window.addEventListener("investpilot-watchlist-change", syncWatchlist);
    return () => window.removeEventListener("investpilot-watchlist-change", syncWatchlist);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    if (!symbols.length) {
      setItems([]);
      return () => controller.abort();
    }

    setLoading(true);
    setError("");

    Promise.all(
      symbols.map(async (symbol) => {
        const response = await fetch(`/api/v1/stocks/${symbol}/analysis?position=0.35`, {
          signal: controller.signal,
          cache: "no-store"
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.meta?.errorMessage || "自选股分析获取失败。");
        }

        return payload;
      })
    )
      .then((payloads) => {
        setItems(payloads);
      })
      .catch((nextError) => {
        if (nextError.name === "AbortError") {
          return;
        }

        setError(nextError.message);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [symbols]);

  const suggestions = pickSuggestions(universe, symbols);

  return (
    <div className="grid gap-6">
      <section className="strong-panel rounded-[34px] px-5 py-6 sm:px-6">
        <p className="section-kicker">自选股</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-slate-950">用本地自选列表持续跟踪重点标的</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          第一版先使用本地存储记录自选股，不依赖登录。你可以添加、删除，并查看每只股票的最新风险与分析摘要。
        </p>
        {universePayload?.data?.poolMode === "seeded" ? (
          <p className="mt-3 text-sm text-slate-500">当前候选池为后端种子池，后续会继续扩展为更完整的实时股票池。</p>
        ) : null}
        <DataStatusNote meta={universePayload?.meta} className="mt-4" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="grid gap-4">
          {items.length ? (
            items.map((payload) => {
              const stock = payload.data.stock;
              const risk = payload.data.risk;
              return (
                <div key={stock.symbol} className="soft-panel rounded-[28px] p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <Link href={`/stock/${stock.symbol}`} className="text-xl font-semibold text-slate-950">
                        {stock.name} <span className="text-sm text-slate-400">{stock.symbol}</span>
                      </Link>
                      <p className="mt-2 text-sm text-slate-500">
                        {stock.sector} · {stock.market} · {risk.level}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{stock.summary}</p>
                    </div>

                    <div className="flex flex-col items-start gap-3 lg:items-end">
                      <div className="text-left lg:text-right">
                        <p className="font-display text-3xl font-semibold text-slate-950">{stock.price}</p>
                        <p className={`mt-1 text-sm ${stock.changePercent >= 0 ? "value-positive" : "value-negative"}`}>
                          {stock.changePercent >= 0 ? "+" : ""}
                          {stock.changePercent}%
                        </p>
                      </div>
                      <WatchlistToggle symbol={stock.symbol} />
                    </div>
                  </div>

                  <div className="mt-5 rounded-[22px] border border-slate-900/8 bg-white/84 px-4 py-4 text-sm leading-7 text-slate-600">
                    风险提示：{risk.managementAdvice}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="soft-panel rounded-[28px] p-6 text-sm leading-7 text-slate-600">
              {loading ? "正在加载自选股分析..." : "当前还没有添加自选股。可以先从右侧候选池开始。"}
            </div>
          )}
          {error ? <div className="text-sm text-rose-600">{error}</div> : null}
        </div>

        <div className="soft-panel rounded-[30px] p-5 sm:p-6">
          <p className="section-kicker">候选池</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-slate-950">添加重点跟踪标的</h2>
          <div className="mt-5 grid gap-3">
            {suggestions.map((item) => (
              <div key={item.symbol} className="rounded-[22px] border border-slate-900/8 bg-white/84 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-950">
                      {item.name} <span className="text-slate-400">{item.symbol}</span>
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.sector} · {item.market}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.summary}</p>
                  </div>
                  <WatchlistToggle symbol={item.symbol} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
