import catalog from "@/lib/data/a-share-catalog.json";

const DEFAULT_REASON_LINES = [
  "已命中 A 股股票目录，可直接进入个股详情页。",
  "当前优先保证代码、简称与拼音缩写检索稳定可用。",
  "更完整的实时行情、公告与财报口径会继续补齐。"
];

export function normalizeStockKeyword(value = "") {
  return String(value || "")
    .normalize("NFKC")
    .replace(/\s+/g, "")
    .replace(/\*/g, "")
    .trim()
    .toLowerCase();
}

const preparedCatalog = catalog.map((item) => ({
  ...item,
  symbolKey: normalizeStockKeyword(item.symbol),
  nameKey: normalizeStockKeyword(item.normalizedName || item.name),
  initialsKey: normalizeStockKeyword(item.initials),
  pinyinKey: normalizeStockKeyword(item.pinyin)
}));

function inferMatchType(item, keyword) {
  if (item.symbolKey === keyword || item.symbolKey.includes(keyword)) {
    return "symbol";
  }

  if (item.nameKey === keyword || item.nameKey.includes(keyword)) {
    return "name";
  }

  return "pinyin";
}

function getCatalogMatchScore(item, keyword) {
  if (item.symbolKey === keyword) return 100;
  if (item.nameKey === keyword) return 98;
  if (item.initialsKey === keyword) return 96;
  if (item.pinyinKey === keyword) return 95;
  if (item.symbolKey.startsWith(keyword)) return 92;
  if (item.nameKey.startsWith(keyword)) return 90;
  if (item.initialsKey.startsWith(keyword)) return 88;
  if (item.pinyinKey.startsWith(keyword)) return 86;
  if (item.nameKey.includes(keyword)) return 82;
  if (item.initialsKey.includes(keyword)) return 80;
  if (item.pinyinKey.includes(keyword)) return 78;
  if (item.symbolKey.includes(keyword)) return 74;
  return 0;
}

export function getLocalStockBySymbol(symbol) {
  const normalized = normalizeStockKeyword(symbol);
  if (!normalized) {
    return null;
  }

  return preparedCatalog.find((item) => item.symbolKey === normalized) ?? null;
}

export function searchLocalStockCatalog(query, { limit = 8 } = {}) {
  const keyword = normalizeStockKeyword(query);
  if (!keyword) {
    return [];
  }

  const matched = [];

  for (const item of preparedCatalog) {
    const score = getCatalogMatchScore(item, keyword);
    if (score <= 0) {
      continue;
    }

    matched.push({
      symbol: item.symbol,
      name: item.name,
      market: item.market,
      normalizedName: item.normalizedName,
      initials: item.initials,
      pinyin: item.pinyin,
      score,
      matchType: inferMatchType(item, keyword)
    });
  }

  matched.sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    return left.symbol.localeCompare(right.symbol, "zh-Hans-CN");
  });

  return matched.slice(0, limit);
}

export function buildLocalUniverseItem(match) {
  const matchLabel =
    match.matchType === "symbol" ? "代码匹配" : match.matchType === "name" ? "简称匹配" : "拼音匹配";

  return {
    symbol: match.symbol,
    name: match.name,
    market: match.market,
    sector: "待补充",
    price: "--",
    changePercent: 0,
    summary: `已命中 ${match.name}（${match.symbol}），当前可直接进入个股详情页查看研究入口与风险评估。`,
    riskLevel: "待评估",
    score: match.score,
    reasons: [`${matchLabel}命中`, ...DEFAULT_REASON_LINES],
    metrics: {
      trend: 0,
      valuation: 0,
      growth: 0,
      risk: 0
    },
    matchType: match.matchType,
    meta: {
      poolMode: "local_catalog"
    }
  };
}

export function buildLocalSearchIntelPayload(query, limit = 6) {
  const keyword = String(query || "").trim();
  const candidates = searchLocalStockCatalog(keyword, { limit: Math.max(limit, 6) });
  const resolved = candidates[0] ?? null;

  const guide = {
    title: "结构化情报搜索工作台",
    description: keyword
      ? "当前先返回稳定的 A 股目录匹配结果，避免搜索阶段被慢接口或默认演示股误导。"
      : "输入股票代码、简称或拼音缩写后，系统会先锁定个股，再继续补充公告、新闻与研究观点。",
    tips: [
      "优先输入 6 位股票代码，命中最稳定。",
      "支持简称与拼音缩写，例如 宁德时代 / ndsd、万科A / wka。",
      "当前页优先保证“先找到正确股票”，再逐步补齐更深的实时情报。"
    ],
    exampleQueries: ["300750", "688472", "000002", "宁德时代", "wka"]
  };

  const sections = resolved
    ? {
        news: {
          label: "新闻",
          count: 1,
          items: [
            {
              id: `local-news-${resolved.symbol}`,
              type: "news",
              title: `已锁定 ${resolved.name} ${resolved.symbol}`,
              summary: "当前先返回稳定的目录匹配结果，便于先进入个股详情与风险页，不再把搜索结果错误回退到默认演示股。",
              publishedAt: "",
              source: "本地目录",
              url: "",
              tags: [resolved.name, resolved.symbol, "目录匹配"],
              signal: "中性",
              extractText: `${resolved.name} ${resolved.symbol}\n已命中 A 股股票目录，可继续进入个股详情页与风险页。`
            }
          ],
          emptyMessage: "当前暂无可展示的新闻结果。"
        },
        announcements: {
          label: "公告",
          count: 1,
          items: [
            {
              id: `local-announcement-${resolved.symbol}`,
              type: "announcements",
              title: `可继续围绕 ${resolved.name} 补充公告与财报`,
              summary: "当前版本先保证搜索锁定正确个股，后续会继续增强公告、研报与原文提炼链路。",
              publishedAt: "",
              source: "系统提示",
              url: "",
              tags: ["研究入口", resolved.symbol],
              signal: "中性",
              extractText: `${resolved.name} ${resolved.symbol}\n当前可以继续进入个股详情页与文档提炼流程。`
            }
          ],
          emptyMessage: "当前暂无可展示的公告结果。"
        },
        research: {
          label: "机构观点",
          count: 1,
          items: [
            {
              id: `local-research-${resolved.symbol}`,
              type: "research",
              title: `${resolved.name} 当前已支持正确检索与跳转`,
              summary: "重点先修复“搜索正确性”，避免所有关键词都落回宁德时代；更深的真实情报源会继续补齐。",
              publishedAt: "",
              source: "系统提示",
              url: "",
              tags: ["可用性修复", resolved.symbol],
              signal: "中性",
              extractText: `${resolved.name} ${resolved.symbol}\n当前优先保证代码、简称与拼音检索稳定可用。`
            }
          ],
          emptyMessage: "当前暂无可展示的机构观点结果。"
        },
        digest: {
          label: "市场情报",
          count: 0,
          items: [],
          emptyMessage: "当前未加载市场级情报摘要。"
        }
      }
    : {
        news: {
          label: "新闻",
          count: 0,
          items: [],
          emptyMessage: "当前没有命中股票目录，请优先输入 6 位代码、完整简称或拼音缩写。"
        },
        announcements: {
          label: "公告",
          count: 0,
          items: [],
          emptyMessage: "当前没有命中股票目录，请优先输入更精确的关键词。"
        },
        research: {
          label: "机构观点",
          count: 0,
          items: [],
          emptyMessage: "当前没有命中股票目录，请优先输入更精确的关键词。"
        },
        digest: {
          label: "市场情报",
          count: 1,
          items: [
            {
              id: "local-digest-1",
              type: "digest",
              title: "未锁定明确个股，先优化关键词",
              summary: "建议优先输入 6 位代码或更完整简称。当前版本会先保证个股定位正确，再逐步补强更深的情报聚合。",
              publishedAt: "",
              source: "系统提示",
              url: "",
              tags: ["搜索提示"],
              signal: "中性",
              extractText: "请优先输入 6 位股票代码、完整简称或拼音缩写。"
            }
          ],
          emptyMessage: "当前暂无市场情报。"
        }
      };

  const summary = resolved
    ? {
        title: `${resolved.name} 情报跟踪`,
        description: `已锁定 ${resolved.name}（${resolved.symbol}），当前优先保证搜索结果正确可用，再逐步补齐更深的新闻、公告与研究源。`,
        totalHits: 3,
        signalBreakdown: {
          positive: 0,
          negative: 0,
          neutral: 3
        }
      }
    : {
        title: keyword ? "未锁定明确个股" : "情报搜索工作台",
        description: keyword
          ? "当前关键词没有稳定命中 A 股目录，请优先输入股票代码、完整简称或拼音缩写。"
          : "输入股票代码、简称或拼音缩写后，系统会先锁定正确个股，再继续补充结构化情报。",
        totalHits: 0,
        signalBreakdown: {
          positive: 0,
          negative: 0,
          neutral: 1
        }
      };

  return {
    query: {
      keyword,
      limit,
      hasQuery: Boolean(keyword)
    },
    summary,
    resolved,
    candidates,
    tabs: [
      { key: "all", label: "全部情报", count: resolved ? 3 : 1 },
      { key: "news", label: "新闻", count: sections.news.count },
      { key: "announcements", label: "公告", count: sections.announcements.count },
      { key: "research", label: "机构观点", count: sections.research.count },
      { key: "digest", label: "市场情报", count: sections.digest.count }
    ],
    sections,
    guide,
    updatedAt: new Date().toISOString().slice(0, 16).replace("T", " ")
  };
}
