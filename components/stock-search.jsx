"use client";

import Link from "next/link";
import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WatchlistToggle } from "@/components/watchlist-toggle";
import { recordSearchHistory } from "@/lib/guest-memory";

export function StockSearch({ stocks }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState(stocks.slice(0, 6));
  const [isSearching, setIsSearching] = useState(false);
  const [feedback, setFeedback] = useState("");
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    const controller = new AbortController();
    const keyword = deferredQuery.trim();

    if (!keyword) {
      setMatches(stocks.slice(0, 6));
      setFeedback("");
      return () => controller.abort();
    }

    setIsSearching(true);
    setFeedback("");
    setMatches([]);

    fetch(`/api/v1/stocks/universe?q=${encodeURIComponent(keyword)}&limit=6`, {
      signal: controller.signal,
      cache: "no-store"
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.meta?.errorMessage || "股票搜索接口暂时不可用。");
        }

        startTransition(() => {
          const nextItems = payload?.data?.items ?? [];
          setMatches(nextItems);
          setFeedback(nextItems.length ? "" : "没有命中结果，请优先输入 6 位代码、完整简称或拼音缩写。");
        });
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          return;
        }

        setMatches([]);
        setFeedback(error.message || "当前搜索暂时不可用，请稍后重试。");
      })
      .finally(() => {
        setIsSearching(false);
      });

    return () => controller.abort();
  }, [deferredQuery, stocks]);

  function navigateToSymbol(symbol) {
    startTransition(() => {
      router.push(`/stock/${symbol}`);
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const keyword = query.trim().normalize("NFKC");
    recordSearchHistory(keyword);

    if (/^\d{6}$/.test(keyword)) {
      navigateToSymbol(keyword);
      return;
    }

    const target = matches[0];
    if (!target) {
      setFeedback("当前没有可跳转的股票，请先输入正确代码或从候选里选择。");
      return;
    }

    navigateToSymbol(target.symbol);
  }

  return (
    <div className="strong-panel rounded-[30px] p-5 sm:p-6">
      <p className="section-kicker">快速搜索</p>
      <h2 className="mt-2 font-display text-2xl font-semibold text-slate-950">从搜索直接进入个股研究</h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        输入股票代码、公司简称或拼音缩写，直接进入个股研究页。页面会优先展示稳定候选，再逐步切到更完整的 A 股目录检索。
      </p>

      <form className="mt-5 flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="例如：300750、688472、宁德时代、wka"
          className="h-12 flex-1 rounded-full border border-slate-900/10 bg-white px-4 text-sm outline-none transition focus:border-slate-900/30 focus:ring-4 focus:ring-slate-900/5"
        />
        <button
          type="submit"
          className="h-12 rounded-full bg-slate-950 px-5 text-sm font-medium text-white shadow-[0_12px_28px_rgba(15,23,42,0.16)] transition hover:-translate-y-0.5"
        >
          查看个股分析
        </button>
      </form>

      <div className="mt-5 grid gap-3">
        {isSearching ? <p className="text-sm text-slate-500">正在检索更完整的 A 股目录…</p> : null}
        {feedback ? <p className="text-sm text-amber-700">{feedback}</p> : null}

        {matches.length ? (
          matches.map((item) => (
            <div
              key={item.symbol}
              className="rounded-[20px] border border-slate-900/8 bg-white/84 px-4 py-3 transition hover:border-slate-900/16 hover:bg-white"
            >
              <div className="flex items-start justify-between gap-3">
                <Link href={`/stock/${item.symbol}`} className="min-w-0 flex-1">
                  <p className="font-medium text-slate-950">
                    {item.name} <span className="text-slate-400">{item.symbol}</span>
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {item.sector} · {item.market}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.summary}</p>
                </Link>
                <div className="flex flex-col items-end gap-3">
                  {item.price === "--" ? (
                    <span className="text-sm text-slate-500">目录匹配</span>
                  ) : (
                    <span className={`text-sm font-medium ${item.changePercent >= 0 ? "value-positive" : "value-negative"}`}>
                      {item.changePercent >= 0 ? "+" : ""}
                      {item.changePercent}%
                    </span>
                  )}
                  <WatchlistToggle symbol={item.symbol} />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[20px] border border-dashed border-slate-900/12 bg-white/72 px-4 py-4 text-sm leading-7 text-slate-600">
            当前没有命中结果。建议优先输入 6 位股票代码、完整公司简称或更接近的拼音缩写。
          </div>
        )}
      </div>
    </div>
  );
}
