const STORAGE_KEY = "investpilot.watchlist.v1";

function isBrowser() {
  return typeof window !== "undefined";
}

export function readWatchlist() {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function writeWatchlist(symbols) {
  if (!isBrowser()) {
    return;
  }

  const normalized = [...new Set(symbols.filter(Boolean))];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new CustomEvent("investpilot-watchlist-change", { detail: normalized }));
}

export function toggleWatchlistSymbol(symbol) {
  const current = readWatchlist();
  if (current.includes(symbol)) {
    writeWatchlist(current.filter((item) => item !== symbol));
    return false;
  }

  writeWatchlist([symbol, ...current]);
  return true;
}

export function hasWatchlistSymbol(symbol) {
  return readWatchlist().includes(symbol);
}
