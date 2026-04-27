"use client";

import { useEffect } from "react";
import { recordRecentView } from "@/lib/guest-memory";

export function StockVisitTracker({ symbol, name }) {
  useEffect(() => {
    recordRecentView({
      symbol,
      name,
      href: `/stock/${symbol}`
    });
  }, [name, symbol]);

  return null;
}
