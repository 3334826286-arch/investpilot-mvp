import { cache } from "react";
import { buildLocalUniverseItem, getLocalStockBySymbol, searchLocalStockCatalog } from "@/lib/local-stock-catalog";
import { getMockStockBySymbol, getMockStockUniverse } from "@/lib/mock-data";
import { buildRiskAssessment } from "@/lib/risk-engine";
import { mergeStructuredData } from "@/lib/services/merge-utils";
import { buildServiceEnvelope, resolveServiceData } from "@/lib/services/shared";

function buildStockPayload(symbol, position = 0.45, marketRisk = 46) {
  const stock = getMockStockBySymbol(symbol);

  if (!stock) {
    return null;
  }

  return {
    stock,
    risk: buildRiskAssessment(stock, position, marketRisk)
  };
}

function buildCatalogPriceSeries(seed = 20) {
  const base = Number(seed) || 20;
  const closes = [0.986, 0.992, 0.998, 1.004, 1.009, 1.005, 1.011, 1.008].map((item) =>
    Number((base * item).toFixed(2))
  );
  const dates = ["04-14", "04-15", "04-16", "04-17", "04-18", "04-21", "04-22", "04-23"];

  return closes.map((close, index) => {
    const previous = closes[index - 1] ?? Number((close * 0.998).toFixed(2));
    const open = Number(previous.toFixed(2));
    return {
      date: dates[index],
      open,
      close,
      low: Number((Math.min(open, close) * 0.994).toFixed(2)),
      high: Number((Math.max(open, close) * 1.006).toFixed(2)),
      volume: 10 + index
    };
  });
}

function buildCatalogStockPayload(symbol, position = 0.45, marketRisk = 46) {
  const item = getLocalStockBySymbol(symbol);
  if (!item) {
    return null;
  }

  const stock = {
    symbol: item.symbol,
    name: item.name,
    market: item.market,
    sector: "待补充",
    price: "--",
    changePercent: 0,
    amplitude: "--",
    turnover: "--",
    summary: `${item.name} 已纳入 A 股目录底座。当前页先保证可以正确打开、正确识别，再逐步补齐更完整的实时行情、公告与财报口径。`,
    thesis: [
      "当前优先解决“能搜到、能打开、能区分正确股票”的基础可用性问题。",
      "这只股票已经支持从首页搜索、风险页和情报搜索页直接进入。",
      "后续会继续补强实时行情、公告、研报与文档提炼联动。"
    ],
    coachNotes: [
      "当前更适合作为研究入口，而不是直接把页面结论当成交易指令。",
      "如果准备继续研究，优先看个股公告、行业景气度和近期催化是否明确。",
      "先确认风险收益比，再决定是否继续跟踪。"
    ],
    technicalView: {
      trend: "当前是目录级分析页，主要用于先锁定正确标的，趋势结论会在实时口径补齐后进一步增强。",
      volume: "量价与资金流数据仍在补充中，当前不建议把这里当成高频交易信号页。",
      support: "--",
      resistance: "--"
    },
    fundamentals: [
      { key: "coverage", label: "覆盖状态", value: "A 股目录已接入" },
      { key: "quote", label: "行情口径", value: "补充中" },
      { key: "financial", label: "财务口径", value: "补充中" },
      { key: "market", label: "市场板块", value: item.market }
    ],
    catalysts: [
      "支持从搜索链路直接进入，不再被默认演示股覆盖。",
      "后续公告、研报与实时行情接入后，页面结论会更完整。",
      "当前更适合先作为研究入口与标的确认页使用。"
    ],
    news: [
      { title: `${item.name} 已命中 A 股股票目录，可继续进入更深的研究流程。`, source: "本地目录" },
      { title: "当前版本先确保个股定位正确，再逐步补齐更深的实时研究链路。", source: "系统提示" }
    ],
    riskProfile: {
      volatility: 42,
      drawdown: 38,
      valuation: 36,
      earnings: 32,
      sector: 35
    },
    riskNotes: {
      volatility: "当前先按中性偏谨慎口径处理，避免在实时数据未补齐前给出过激结论。",
      drawdown: "目录级页面更适合做标的确认，回撤结构仍需结合真实价格序列观察。",
      valuation: "估值维度尚未接入完整财务口径，当前先给出保守结论。",
      earnings: "业绩与财报字段会在后续版本继续补齐。",
      sector: "板块标签与景气度口径仍在完善中。"
    },
    radarMetrics: [
      { name: "趋势", value: 48 },
      { name: "成长", value: 52 },
      { name: "估值", value: 50 },
      { name: "资金", value: 40 },
      { name: "风控", value: 58 }
    ],
    priceSeries: buildCatalogPriceSeries(Number(item.symbol.slice(-2)) || 20)
  };

  return {
    stock,
    risk: buildRiskAssessment(stock, position, marketRisk)
  };
}

export const getStockUniverse = cache(async function getStockUniverse(options = {}) {
  const query = options.query?.trim() ?? "";
  const limit = Number(options.limit ?? 20);
  const search = new URLSearchParams();

  if (query) {
    search.set("q", query);
  }

  if (Number.isFinite(limit)) {
    search.set("limit", String(limit));
  }

  if (query) {
    const items = searchLocalStockCatalog(query, { limit }).map(buildLocalUniverseItem);
    return buildServiceEnvelope(
      `/v1/stocks/universe?${search.toString()}`,
      {
        items,
        poolName: "A 股目录检索",
        poolSize: items.length,
        poolMode: "local_catalog",
        updatedAt: new Date().toISOString()
      },
      {
        source: "local_catalog"
      }
    );
  }

  return resolveServiceData({
    endpoint: `/v1/stocks/universe${search.size ? `?${search.toString()}` : ""}`,
    buildMockData: () => ({
      items: getMockStockUniverse().slice(0, limit),
      poolName: "核心股票池",
      poolSize: getMockStockUniverse().length,
      updatedAt: new Date().toISOString()
    })
  });
});

export async function getStockAnalysis(symbol, options = {}) {
  const position = Number(options.position ?? 0.45);
  const marketRisk = Number(options.marketRisk ?? 46);
  const mockPayload = buildStockPayload(symbol, position, marketRisk) ?? buildCatalogStockPayload(symbol, position, marketRisk);

  return resolveServiceData({
    endpoint: `/v1/stocks/${symbol}/analysis?position=${position.toFixed(2)}`,
    buildMockData: () => mockPayload,
    normalizeRemote: (payload) => mergeStructuredData(mockPayload, payload?.data ?? payload)
  });
}
