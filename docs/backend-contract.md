# FastAPI 接口约定

前端统一通过 `lib/services/*` 请求数据，并默认优先访问 FastAPI。当前项目已经形成三层结构：

1. 页面或组件调用 `lib/services/*`
2. `service` 层根据环境变量决定走 FastAPI、seeded 数据或 mock
3. 页面通过 `meta.source`、`meta.fallback` 和分段 `dataLineage` 判断数据来源

## 统一返回结构

所有 FastAPI 接口返回统一 envelope：

```json
{
  "meta": {
    "source": "fastapi",
    "fallback": false,
    "warnings": [],
    "fetchedAt": "2026-04-24T12:00:00Z"
  },
  "data": {}
}
```

字段说明：

- `meta.source`
  - `fastapi`：由后端真实或 seeded 逻辑返回
  - `mock`：由前端或 Next API fallback 返回
- `meta.fallback`
  - `false`：当前结果不是前端兜底
  - `true`：当前结果来自 fallback
- `meta.warnings`
  - 用于提示字段缺失、数据源降级等信息

## 已实现接口

### 1. 健康检查

`GET /v1/health`

示例：

```json
{
  "meta": {
    "source": "fastapi",
    "fallback": false,
    "warnings": [],
    "fetchedAt": "2026-04-24T12:00:00Z"
  },
  "data": {
    "status": "ok"
  }
}
```

### 2. 市场总览

`GET /v1/market/overview`

核心字段：

```json
{
  "productName": "InvestPilot",
  "heroTitle": "用更清晰的中文结论，先判断市场环境，再决定该关注哪些风险与机会。",
  "heroDescription": "首页优先回答市场强弱、情绪温度、主线方向与系统性风险。",
  "overview": {
    "updatedAt": "2026-04-24 14:30",
    "regime": "市场偏强",
    "riskLevel": "中风险",
    "summary": "指数表现、市场宽度与资金承接同步改善。",
    "strategyNote": "更适合围绕主线方向做结构性跟随。",
    "primaryCall": "先判断环境，再决定仓位与节奏。"
  },
  "indices": [],
  "breadth": [],
  "hotSectors": [],
  "riskSignals": [],
  "coachNotes": [],
  "macroSignals": [],
  "globalMarkets": [],
  "charts": {
    "trendSeries": {},
    "sectorHeatmap": [],
    "capitalFlowSeries": {}
  },
  "dataLineage": {
    "indices": {
      "source": "real",
      "label": "真实指数行情",
      "note": "指数、成交额与宽度来自真实行情接口。"
    },
    "globalMarkets": {
      "source": "real",
      "label": "真实全球行情",
      "note": "全球指数卡片来自 AKShare 实时数据。"
    },
    "macroSignals": {
      "source": "mock",
      "label": "演示宏观卡片",
      "note": "当前仍为演示卡片，后续会替换为稳定真实序列。"
    },
    "capitalFlowSeries": {
      "source": "real",
      "label": "真实资金流序列",
      "note": "若实时源不可用，前端会明确标记为演示序列。"
    }
  },
  "systemicRiskScore": 52
}
```

### 3. 个股分析

`GET /v1/stocks/{symbol}/analysis?position=0.45`

参数说明：

- `symbol`：股票代码，例如 `300750`
- `position`：仓位暴露程度，范围 `0.1` 到 `1.0`

核心字段：

```json
{
  "stock": {
    "symbol": "300750",
    "name": "宁德时代",
    "market": "深市",
    "sector": "电力设备",
    "price": "196.82",
    "changePercent": 2.14,
    "amplitude": "3.82%",
    "turnover": "87.4 亿元",
    "summary": "趋势修复与基本面改善暂时同向，但估值与市场环境仍要求更注重节奏控制。",
    "thesis": [],
    "coachNotes": [],
    "technicalView": {
      "trend": "",
      "volume": "",
      "support": "188.20",
      "resistance": "201.40"
    },
    "fundamentals": [],
    "catalysts": [],
    "news": [],
    "radarMetrics": [],
    "priceSeries": [],
    "riskProfile": {},
    "riskNotes": {},
    "selectionReasons": [],
    "selectionSummary": "趋势修复明确；机构资金回补；估值回到合理区间"
  },
  "risk": {
    "totalScore": 53,
    "level": "中风险",
    "exposure": 49,
    "factors": [],
    "managementAdvice": "风险仍在可控区间，但更适合分批执行与动态跟踪。",
    "coachHint": "先写清买入理由、加仓条件与失效位置，再决定是否执行。",
    "actionSummary": "分批观察，纪律优先"
  }
}
```

### 4. 股票池搜索

`GET /v1/stocks/universe?q=&limit=20`

用途：

- 首页搜索候选
- 自选股候选
- 量化选股基础股票池

当前说明：

- 该接口已经由 FastAPI 提供
- 默认列表模式已升级为 `hybrid`
- 当带 `q` 查询时，会切换为 `catalog` 检索模式，用于全市场代码 / 名称匹配
- 查询态已支持代码、简称、拼音缩写等更自然的检索
- 返回结果不是前端 mock，而是后端维护的种子股票池与股票目录检索结果

核心字段：

```json
{
  "items": [
    {
      "symbol": "300750",
      "name": "宁德时代",
      "market": "深市",
      "sector": "电力设备",
      "price": "196.82",
      "changePercent": 2.14,
      "summary": "趋势修复明确；机构资金回补；估值回到合理区间",
      "riskLevel": "中风险",
      "score": 71,
      "reasons": [
        "趋势修复明确",
        "机构资金回补",
        "估值回到合理区间"
      ],
      "metrics": {
        "trend": 76,
        "valuation": 58,
        "growth": 78,
        "risk": 54
      },
      "meta": {
        "systemicScore": 52,
        "poolMode": "seeded"
      }
    }
  ],
  "poolName": "市场关注股票池",
  "poolSize": 12,
  "poolMode": "hybrid",
  "catalogSize": 5510,
  "updatedAt": "2026-04-24 15:10"
}
```

查询态示例：

```json
{
  "items": [
    {
      "symbol": "000001",
      "name": "平安银行",
      "market": "主板",
      "sector": "行业待加载",
      "price": "--",
      "changePercent": 0.0,
      "summary": "已匹配股票代码或名称，可进入个股详情页查看真实行情、风险评估与中文分析结论。",
      "riskLevel": "待评估",
      "score": 50,
      "reasons": [
        "已匹配全市场股票目录",
        "支持进入个股详情做真实分析",
        "当前搜索候选仍以快速定位为主"
      ],
      "metrics": {
        "trend": 0,
        "valuation": 0,
        "growth": 0,
        "risk": 0
      },
      "meta": {
        "systemicScore": 52,
        "poolMode": "catalog"
      }
    }
  ],
  "poolName": "全市场检索候选",
  "poolSize": 1,
  "poolMode": "catalog",
  "updatedAt": "2026-04-25 10:30"
}
```

### 5. 量化选股快照

`GET /v1/screener/snapshot?trend=all&valuation=all&growth=all&risk=all&limit=12`

支持条件：

- `trend`：`all` / `uptrend` / `breakout`
- `valuation`：`all` / `reasonable` / `low`
- `growth`：`all` / `positive` / `strong`
- `risk`：`all` / `medium_or_below` / `low`
- `limit`：1 到 30

核心字段：

```json
{
  "strategies": [
    "趋势跟随",
    "放量突破",
    "估值筛选",
    "盈利成长",
    "多因子平衡"
  ],
  "filters": {},
  "appliedFilters": {
    "trend": "uptrend",
    "valuation": "all",
    "growth": "all",
    "risk": "medium_or_below"
  },
  "poolSummary": {
    "poolName": "核心股票池",
    "poolSize": 5,
    "poolMode": "seeded",
    "matchCount": 4
  },
  "items": []
}
```

### 6. 财经日历

`GET /v1/calendar/events`

核心字段：

```json
{
  "filters": [
    "财报",
    "宏观",
    "重要事件"
  ],
  "items": [
    {
      "id": "macro-cpi-2026-04-24",
      "date": "04-24",
      "weekday": "周五",
      "time": "09:30",
      "type": "宏观",
      "importance": "高",
      "title": "CPI 数据公布",
      "detail": "关注通胀斜率变化及其对风险偏好的影响。"
    }
  ]
}
```

### 7. 文档提炼

`POST /v1/documents/summarize`

请求体：

```json
{
  "text": "原始文本",
  "source_name": "测试研报",
  "source_type": "text"
}
```

返回字段：

```json
{
  "title": "测试研报",
  "sourceName": "测试研报",
  "sourceType": "text",
  "characterCount": 2680,
  "summary": "当前材料更支持基本面改善的判断，但仍需结合后续财务兑现继续验证。",
  "conclusion": "结论偏中性偏多。当前材料更支持基本面修复，但更适合在后续业绩兑现后再提高信心。",
  "highlights": [],
  "keyData": [],
  "risks": [],
  "institutionSummary": "机构视角更偏向确认基本面改善与盈利兑现，重点在于后续数据能否跟上当前预期。"
}
```

### 8. 情报搜索

`GET /v1/search/intel?q=300750&limit=6`

当前说明：

- 已支持个股新闻、个股公告、个股研报与市场级情报
- 搜索结果已包含标题、来源、时间、标签、摘要、利好 / 利空 / 中性提示
- 搜索结果可直接跳转原文，也可一键送入文档提炼流程
- 更适合输入股票代码或完整公司名
- 当前仍是“研究辅助型搜索”，不是通用全网聚合搜索引擎

核心字段：

```json
{
  "query": {
    "keyword": "300750",
    "limit": 6,
    "hasQuery": true
  },
  "summary": {
    "title": "宁德时代 情报跟踪",
    "description": "已围绕宁德时代（300750）聚合新闻、公告和机构观点，适合用于事件跟踪与研究补充。",
    "totalHits": 14
  },
  "resolved": {
    "symbol": "300750",
    "name": "宁德时代",
    "market": "创业板",
    "score": 100
  },
  "candidates": [],
  "tabs": [
    { "key": "all", "label": "全部情报", "count": 14 },
    { "key": "news", "label": "新闻", "count": 6 },
    { "key": "announcements", "label": "公告", "count": 4 },
    { "key": "research", "label": "机构观点", "count": 4 },
    { "key": "digest", "label": "市场情报", "count": 2 }
  ],
  "sections": {
    "news": {
      "label": "新闻",
      "count": 6,
      "items": []
    },
    "announcements": {
      "label": "公告",
      "count": 4,
      "items": []
    },
    "research": {
      "label": "机构观点",
      "count": 4,
      "items": []
    },
    "digest": {
      "label": "市场情报",
      "count": 2,
      "items": []
    }
  },
  "guide": {
    "title": "最小可用的联网情报搜索",
    "description": "当前已接入个股新闻、个股公告与个股研报三类真实数据。",
    "tips": [],
    "exampleQueries": ["300750", "宁德时代", "招商银行", "美的集团"]
  },
  "updatedAt": "2026-04-25 10:35"
}
```

## 前端 service 层

数据切换逻辑集中在以下文件：

- [shared.js](/C:/Users/33348/Documents/New project/invest-decision-mvp/lib/services/shared.js:1)
- [market-service.js](/C:/Users/33348/Documents/New project/invest-decision-mvp/lib/services/market-service.js:1)
- [calendar-service.js](/C:/Users/33348/Documents/New project/invest-decision-mvp/lib/services/calendar-service.js:1)
- [stocks-service.js](/C:/Users/33348/Documents/New project/invest-decision-mvp/lib/services/stocks-service.js:1)
- [screener-service.js](/C:/Users/33348/Documents/New project/invest-decision-mvp/lib/services/screener-service.js:1)
- [documents-service.js](/C:/Users/33348/Documents/New project/invest-decision-mvp/lib/services/documents-service.js:1)
- [search-service.js](/C:/Users/33348/Documents/New project/invest-decision-mvp/lib/services/search-service.js:1)

## 环境变量切换规则

- `INVESTPILOT_DATA_SOURCE=auto`
  - 优先 FastAPI
  - 失败回退 seeded 或 mock
- `INVESTPILOT_DATA_SOURCE=fastapi`
  - 强制真实接口
  - 失败直接报错
- `INVESTPILOT_DATA_SOURCE=mock`
  - 强制使用 mock

## 后续接口预留建议

### 联网搜索后续拆分

建议下一阶段进一步拆成：

- `GET /v1/search/news?q=`
- `GET /v1/search/announcements?q=`
- `GET /v1/search/research?q=`

建议统一结构：

```json
{
  "query": "宁德时代",
  "items": [
    {
      "id": "news-1",
      "type": "news",
      "title": "标题",
      "source": "来源",
      "publishedAt": "2026-04-24T09:30:00Z",
      "url": "https://example.com",
      "summary": "结构化摘要",
      "sentiment": "neutral"
    }
  ]
}
```
