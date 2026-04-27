"use client";

const STORAGE_KEYS = {
  watchlist: "investpilot.watchlist.v2",
  recentViews: "investpilot.recent-views.v1",
  searchHistory: "investpilot.search-history.v1",
  preferences: "investpilot.preferences.v1"
};

function isBrowser() {
  return typeof window !== "undefined";
}

function readJson(key, fallback) {
  if (!isBrowser()) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function emit(channel, detail) {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new CustomEvent(channel, { detail }));
}

export function readWatchlistSymbols() {
  const parsed = readJson(STORAGE_KEYS.watchlist, []);
  return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
}

export function writeWatchlistSymbols(symbols) {
  const normalized = [...new Set(symbols.filter(Boolean))];
  writeJson(STORAGE_KEYS.watchlist, normalized);
  emit("investpilot-watchlist-change", normalized);
}

export function toggleWatchlistSymbol(symbol) {
  const current = readWatchlistSymbols();
  if (current.includes(symbol)) {
    writeWatchlistSymbols(current.filter((item) => item !== symbol));
    return false;
  }

  writeWatchlistSymbols([symbol, ...current]);
  return true;
}

export function hasWatchlistSymbol(symbol) {
  return readWatchlistSymbols().includes(symbol);
}

export function readRecentViews() {
  const parsed = readJson(STORAGE_KEYS.recentViews, []);
  return Array.isArray(parsed) ? parsed : [];
}

export function recordRecentView(view) {
  if (!view?.symbol) {
    return;
  }

  const current = readRecentViews().filter((item) => item?.symbol !== view.symbol);
  const next = [
    {
      symbol: view.symbol,
      name: view.name ?? view.symbol,
      href: view.href ?? `/stock/${view.symbol}`,
      visitedAt: new Date().toISOString()
    },
    ...current
  ].slice(0, 12);

  writeJson(STORAGE_KEYS.recentViews, next);
  emit("investpilot-recent-views-change", next);
}

export function readSearchHistory() {
  const parsed = readJson(STORAGE_KEYS.searchHistory, []);
  return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
}

export function recordSearchHistory(query) {
  const normalized = query?.trim();
  if (!normalized) {
    return;
  }

  const current = readSearchHistory().filter((item) => item !== normalized);
  const next = [normalized, ...current].slice(0, 10);
  writeJson(STORAGE_KEYS.searchHistory, next);
  emit("investpilot-search-history-change", next);
}

export function readPreferences() {
  const parsed = readJson(STORAGE_KEYS.preferences, {});
  return parsed && typeof parsed === "object" ? parsed : {};
}

export function writePreferences(nextPreferences) {
  const previous = readPreferences();
  const merged = { ...previous, ...nextPreferences };
  writeJson(STORAGE_KEYS.preferences, merged);
  emit("investpilot-preferences-change", merged);
}
