"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readRecentViews, readSearchHistory, readWatchlistSymbols } from "@/lib/guest-memory";

function listen(channel, callback) {
  window.addEventListener(channel, callback);
  return () => window.removeEventListener(channel, callback);
}

export function GuestActivityPanel() {
  const [watchlist, setWatchlist] = useState([]);
  const [recentViews, setRecentViews] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);

  useEffect(() => {
    function syncWatchlist(event) {
      setWatchlist(Array.isArray(event?.detail) ? event.detail : readWatchlistSymbols());
    }

    function syncRecentViews(event) {
      setRecentViews(Array.isArray(event?.detail) ? event.detail : readRecentViews());
    }

    function syncSearchHistory(event) {
      setSearchHistory(Array.isArray(event?.detail) ? event.detail : readSearchHistory());
    }

    syncWatchlist();
    syncRecentViews();
    syncSearchHistory();

    const unsubs = [
      listen("investpilot-watchlist-change", syncWatchlist),
      listen("investpilot-recent-views-change", syncRecentViews),
      listen("investpilot-search-history-change", syncSearchHistory)
    ];

    return () => unsubs.forEach((unsubscribe) => unsubscribe());
  }, []);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <section className="soft-panel rounded-[28px] p-5">
        <p className="section-kicker">游客自选</p>
        <h3 className="mt-2 font-display text-2xl font-semibold text-slate-950">{watchlist.length} 只</h3>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          不登录也能保存自选股。当前列表保存在本地浏览器中，适合先体验再决定是否长期使用。
        </p>
        <Link href="/watchlist" className="mt-4 inline-flex text-sm font-medium text-slate-950">
          查看自选股 →
        </Link>
      </section>

      <section className="soft-panel rounded-[28px] p-5">
        <p className="section-kicker">最近浏览</p>
        <div className="mt-4 grid gap-3">
          {recentViews.length ? (
            recentViews.slice(0, 3).map((item) => (
              <Link
                key={item.symbol}
                href={item.href}
                className="rounded-[18px] border border-slate-900/8 bg-white/84 px-4 py-3 text-sm transition hover:border-slate-900/16"
              >
                <p className="font-medium text-slate-950">
                  {item.name} <span className="text-slate-400">{item.symbol}</span>
                </p>
              </Link>
            ))
          ) : (
            <p className="text-sm leading-7 text-slate-600">当你浏览个股研究页后，最近浏览会自动记录在这里。</p>
          )}
        </div>
      </section>

      <section className="soft-panel rounded-[28px] p-5">
        <p className="section-kicker">搜索历史</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {searchHistory.length ? (
            searchHistory.slice(0, 6).map((item) => (
              <Link
                key={item}
                href={`/search?q=${encodeURIComponent(item)}`}
                className="rounded-full border border-slate-900/10 bg-white px-3 py-2 text-sm text-slate-600 transition hover:border-slate-900/20 hover:text-slate-950"
              >
                {item}
              </Link>
            ))
          ) : (
            <p className="text-sm leading-7 text-slate-600">常用搜索关键词会自动保存在这里，方便继续研究。</p>
          )}
        </div>
      </section>
    </div>
  );
}
