import { cache } from "react";
import { resolveServiceData } from "@/lib/services/shared";

function buildMockSearchIntel(query = "", limit = 6) {
  const keyword = query.trim();
  const resolved =
    keyword && (keyword.includes("300750") || keyword.includes("宁德"))
      ? {
          symbol: "300750",
          name: "宁德时代",
          market: "创业板",
          score: 100,
          matchType: "name"
        }
      : null;

  const newsItems = resolved
    ? [
        {
          id: "mock-news-1",
          type: "news",
          title: "一季报盈利表现强于市场预期，板块关注度继续提升",
          summary: "公司最新业绩表现改善，市场更关注产能利用率、海外需求与后续盈利兑现节奏。",
          publishedAt: "2026-04-25 09:30",
          source: "演示新闻",
          url: "",
          tags: ["宁德时代", "300750"],
          signal: "利好",
          extractText: "一季报盈利表现强于市场预期，板块关注度继续提升。公司最新业绩表现改善，市场更关注产能利用率、海外需求与后续盈利兑现节奏。"
        }
      ]
    : [];

  const announcementItems = resolved
    ? [
        {
          id: "mock-announcement-1",
          type: "announcements",
          title: "关于员工持股计划预留份额授予的公告",
          summary: "建议结合原文核对是否涉及股权激励、治理结构或中长期经营预期变化。",
          publishedAt: "2026-04-24",
          source: "演示公告",
          url: "",
          tags: ["公司公告", "300750"],
          signal: "中性",
          extractText: "关于员工持股计划预留份额授予的公告。建议结合原文核对是否涉及股权激励、治理结构或中长期经营预期变化。"
        }
      ]
    : [];

  const researchItems = resolved
    ? [
        {
          id: "mock-research-1",
          type: "research",
          title: "技术迭代驱动多维增长，龙头优势仍在",
          summary: "机构观点偏中性偏多，重点关注技术升级、产品结构和海外业务扩张节奏。",
          publishedAt: "2026-04-24",
          source: "演示机构",
          url: "",
          tags: ["买入", "电池", "300750"],
          signal: "利好",
          extractText: "技术迭代驱动多维增长，龙头优势仍在。机构观点偏中性偏多，重点关注技术升级、产品结构和海外业务扩张节奏。"
        }
      ]
    : [];

  const digestItems = [
    {
      id: "mock-digest-1",
      type: "digest",
      title: "市场风险偏好维持修复，板块轮动仍然偏快",
      summary: "当前更适合把重点放在主线持续性、增量资金承接和高位板块分化，而不是单日涨跌本身。",
      publishedAt: "2026-04-25",
      source: "演示市场情报",
      url: "",
      tags: ["市场情报", "政策跟踪"],
      signal: "中性",
      extractText: "市场风险偏好维持修复，板块轮动仍然偏快。当前更适合把重点放在主线持续性、增量资金承接和高位板块分化，而不是单日涨跌本身。"
    },
    {
      id: "mock-digest-2",
      type: "digest",
      title: "宏观与政策变量仍将影响风险偏好切换",
      summary: "情报搜索后续会继续接入更多新闻、公告与研报源，当前先保留最小可用结果结构。",
      publishedAt: "2026-04-25",
      source: "演示市场情报",
      url: "",
      tags: ["市场情报", "宏观跟踪"],
      signal: "中性",
      extractText: "宏观与政策变量仍将影响风险偏好切换。情报搜索后续会继续接入更多新闻、公告与研报源，当前先保留最小可用结果结构。"
    }
  ].slice(0, limit);

  const sections = {
    news: {
      label: "新闻",
      count: newsItems.length,
      items: newsItems,
      emptyMessage: "当前未获取到相关新闻。"
    },
    announcements: {
      label: "公告",
      count: announcementItems.length,
      items: announcementItems,
      emptyMessage: "当前未获取到公告结果。"
    },
    research: {
      label: "机构观点",
      count: researchItems.length,
      items: researchItems,
      emptyMessage: "当前未获取到机构观点结果。"
    },
    digest: {
      label: "市场情报",
      count: digestItems.length,
      items: digestItems,
      emptyMessage: "当前未获取到市场级情报。"
    }
  };

  const totalHits = newsItems.length + announcementItems.length + researchItems.length;

  return {
    query: {
      keyword,
      limit,
      hasQuery: Boolean(keyword)
    },
    summary: {
      title: resolved ? `${resolved.name} 情报跟踪` : "情报搜索工作台",
      description: resolved
        ? `已围绕 ${resolved.name}（${resolved.symbol}）整理新闻、公告与机构观点，便于快速补充研究。`
        : "输入股票代码或公司名称，系统会返回相关新闻、公告、机构观点与市场级情报。",
      totalHits,
      signalBreakdown: {
        positive: newsItems.filter((item) => item.signal === "利好").length + researchItems.filter((item) => item.signal === "利好").length,
        negative: 0,
        neutral: announcementItems.length + digestItems.length
      }
    },
    resolved,
    candidates: resolved ? [resolved] : [],
    tabs: [
      { key: "all", label: "全部情报", count: totalHits || digestItems.length },
      { key: "news", label: "新闻", count: newsItems.length },
      { key: "announcements", label: "公告", count: announcementItems.length },
      { key: "research", label: "机构观点", count: researchItems.length },
      { key: "digest", label: "市场情报", count: digestItems.length }
    ],
    sections,
    guide: {
      title: "最小可用的联网情报搜索",
      description: "当前已预留真实接口结构，离线或后端不可用时会自动回退到演示结果。",
      tips: [
        "优先输入股票代码或完整公司名。",
        "公告更适合核对原文，研报更适合快速掌握机构观点。",
        "当前结果以研究辅助为主，不构成投资建议。"
      ],
      exampleQueries: ["300750", "宁德时代", "ndsd", "招商银行", "美的集团"]
    },
    updatedAt: "2026-04-25 10:00"
  };
}

export const getSearchIntel = cache(async function getSearchIntel(options = {}) {
  const query = options.query ?? "";
  const limit = options.limit ?? 6;
  const search = new URLSearchParams();
  if (query) {
    search.set("q", query);
  }
  search.set("limit", String(limit));

  return resolveServiceData({
    endpoint: `/v1/search/intel?${search.toString()}`,
    buildMockData: () => buildMockSearchIntel(query, limit)
  });
});
