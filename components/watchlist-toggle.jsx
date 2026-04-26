"use client";

import { useEffect, useState } from "react";
import { hasWatchlistSymbol, toggleWatchlistSymbol } from "@/lib/watchlist";

export function WatchlistToggle({ symbol, className = "" }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(hasWatchlistSymbol(symbol));

    function syncState() {
      setSaved(hasWatchlistSymbol(symbol));
    }

    window.addEventListener("investpilot-watchlist-change", syncState);
    return () => window.removeEventListener("investpilot-watchlist-change", syncState);
  }, [symbol]);

  return (
    <button
      type="button"
      onClick={() => setSaved(toggleWatchlistSymbol(symbol))}
      className={`rounded-full border px-4 py-2 text-sm transition ${
        saved
          ? "border-slate-950 bg-slate-950 text-white"
          : "border-slate-900/10 bg-white text-slate-700 hover:border-slate-900/20"
      } ${className}`}
    >
      {saved ? "已加入自选" : "加入自选"}
    </button>
  );
}
