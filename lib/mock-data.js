export const navigationItems = [
  { href: "/", label: "首页" },
  { href: "/market", label: "市场检测" },
  { href: "/risk", label: "风险评估" },
  { href: "/calendar", label: "财经日历" },
  { href: "/stock/300750", label: "个股详情" },
  { href: "/screener", label: "量化选股" },
  { href: "/watchlist", label: "自选股" },
  { href: "/documents", label: "文档提炼" },
  { href: "/search", label: "情报搜索" }
];

export const mockMarketOverview = {
  productName: "InvestPilot",
  heroTitle: "帮助中文投资者更快理解市场强弱、识别风险来源，并把碎片信息变成可执行判断。",
  heroDescription:
    "聚焦市场检测、风险评估、财经日历、量化选股与文档提炼，用更清晰的结构辅助投资决策。",
  overview: {
    updatedAt: "2026-04-24 15:00",
    regime: "市场震荡",
    riskLevel: "中风险",
    summary: "指数尚未走出单边方向，热点轮动较快，市场更需要强调节奏和风险收益比。",
    strategyNote: "优先围绕有量价承接和基本面验证的方向布局，不建议在一致性过高阶段追涨。",
    primaryCall: "先判断环境，再决定仓位与节奏。"
  },
  indices: [
    { code: "000001.SH", name: "上证指数", value: "3,186.42", changePercent: 0.96, note: "权重板块承接稳定。" },
    { code: "399001.SZ", name: "深证成指", value: "10,284.60", changePercent: 1.28, note: "成长风格相对占优。" },
    { code: "399006.SZ", name: "创业板指", value: "2,086.38", changePercent: 1.71, note: "高弹性方向保持活跃。" },
    { code: "TURNOVER", name: "两市成交额", value: "1.26 万亿", changePercent: 6.8, note: "成交额较前一日继续改善。" }
  ],
  breadth: [
    { label: "上涨家数", value: "3,214", tone: "positive" },
    { label: "下跌家数", value: "1,198", tone: "negative" },
    { label: "北向资金", value: "净流入 41.2 亿元", tone: "positive" },
    { label: "热门个股", value: "新易盛", tone: "warning" }
  ],
  hotSectors: [
    { name: "算力基础设施", changePercent: 3.4, reason: "板块异动频繁，资金承接明显。" },
    { name: "有色资源", changePercent: 2.7, reason: "商品价格高位运行，板块景气度仍在。" },
    { name: "电力设备", changePercent: 2.1, reason: "龙头企稳后带动中游修复。" },
    { name: "银行", changePercent: 0.5, reason: "防御属性保留，但增量资金开始扩散。" }
  ],
  riskSignals: [
    "高位股分歧依然存在，尾盘异动需要防止情绪化追涨。",
    "板块轮动偏快，连续加速后的容错率有限。",
    "系统性风险可控，但并不支持无计划重仓。"
  ],
  coachNotes: [
    "更适合等待确认后的跟随，而不是脱离计划的情绪化出手。",
    "参与强势方向时，应先明确失效位和仓位上限。",
    "盘面允许试错，但不支持无纪律加仓。"
  ],
  macroSignals: [
    { label: "利率环境", bias: "中性偏多", detail: "流动性相对温和，对成长估值的压制有限。" },
    { label: "制造业 PMI", bias: "中性", detail: "景气度仍在荣枯线附近徘徊，复苏弹性仍需观察。" },
    { label: "通胀信号", bias: "中性", detail: "通胀水平温和，政策空间相对可控。" },
    { label: "海外通胀与利率", bias: "中性偏空", detail: "海外利率预期仍会影响外资风险偏好。" }
  ],
  globalMarkets: [
    { name: "标普500", value: "5,298.10", changePercent: 0.74, note: "美股风险偏好整体回暖。" },
    { name: "纳斯达克", value: "18,246.30", changePercent: 0.98, note: "科技链情绪仍在延续。" },
    { name: "恒生指数", value: "18,562.40", changePercent: 1.16, note: "互联网与资源板块共振。" },
    { name: "日经225", value: "39,006.80", changePercent: -0.35, note: "汇率扰动带来短线震荡。" }
  ],
  charts: {
    trendSeries: {
      dates: ["04-11", "04-14", "04-15", "04-16", "04-17", "04-18", "04-21", "04-22", "04-23"],
      series: [
        { name: "上证指数", values: [3132, 3140, 3149, 3144, 3158, 3164, 3178, 3182, 3186] },
        { name: "深证成指", values: [10036, 10082, 10074, 10090, 10146, 10188, 10228, 10244, 10285] },
        { name: "创业板指", values: [2022, 2020, 2014, 2035, 2052, 2061, 2065, 2074, 2086] }
      ]
    },
    capitalFlowSeries: {
      dates: ["周一", "周二", "周三", "周四", "周五"],
      northbound: [8.2, 18.1, 24.3, 38.6, 41.2],
      mainForce: [21, 34, 48, 56, 63]
    },
    sectorHeatmap: [
      {
        name: "AI 算力",
        value: 36,
        change: 3.4,
        children: [
          { name: "光模块", value: 12, change: 4.1 },
          { name: "服务器", value: 10, change: 3.6 },
          { name: "液冷", value: 8, change: 3.9 },
          { name: "IDC", value: 6, change: 2.7 }
        ]
      },
      {
        name: "新能源",
        value: 28,
        change: 2.1,
        children: [
          { name: "储能", value: 10, change: 2.9 },
          { name: "电池", value: 9, change: 1.9 },
          { name: "逆变器", value: 9, change: 1.6 }
        ]
      },
      {
        name: "资源品",
        value: 24,
        change: 2.7,
        children: [
          { name: "黄金", value: 8, change: 3.3 },
          { name: "铜", value: 8, change: 2.5 },
          { name: "煤炭", value: 8, change: 1.9 }
        ]
      },
      {
        name: "高股息",
        value: 18,
        change: 0.5,
        children: [
          { name: "银行", value: 8, change: 0.6 },
          { name: "运营商", value: 5, change: 0.5 },
          { name: "公用事业", value: 5, change: 0.4 }
        ]
      }
    ]
  },
  quickLinks: [
    { label: "查看市场总览", href: "/market" },
    { label: "进入风险评估", href: "/risk" },
    { label: "浏览财经日历", href: "/calendar" },
    { label: "查看量化选股", href: "/screener" }
  ],
  dataLineage: {
    indices: { source: "mock", label: "演示行情", note: "当前为本地演示数据。" },
    globalMarkets: { source: "mock", label: "演示全球行情", note: "当前为本地演示数据。" },
    macroSignals: { source: "mock", label: "演示宏观卡片", note: "当前为本地演示数据。" },
    capitalFlowSeries: { source: "mock", label: "演示资金流序列", note: "当前为本地演示数据。" }
  },
  systemicRiskScore: 52
};

export const mockCalendarFeed = {
  filters: ["财报", "宏观", "重要事件"],
  items: [
    {
      id: "evt-1",
      date: "04-24",
      weekday: "周五",
      time: "20:30",
      type: "宏观",
      importance: "高",
      title: "美国 CPI 数据",
      detail: "关注通胀对全球风险偏好和降息预期的影响。"
    },
    {
      id: "evt-2",
      date: "04-25",
      weekday: "周六",
      time: "09:00",
      type: "财报",
      importance: "高",
      title: "宁德时代年报预约披露",
      detail: "适合提前安排财报跟踪与风险复核。"
    },
    {
      id: "evt-3",
      date: "04-27",
      weekday: "周一",
      time: "18:00",
      type: "重要事件",
      importance: "中",
      title: "天宜新材业绩预告跟踪",
      detail: "建议结合估值与板块情绪同步观察。"
    }
  ]
};

export const mockStocks = [
  {
    symbol: "300750",
    name: "宁德时代",
    market: "创业板",
    sector: "电力设备",
    price: "196.82",
    changePercent: 2.14,
    amplitude: "4.70%",
    turnover: "53.2 亿",
    summary: "趋势修复正在形成，但上方仍有压力位，适合跟踪而不是无条件追高。",
    thesis: [
      "业绩预期改善与资金回流形成共振，短线趋势明显修复。",
      "龙头确定性高于中小票，但行业景气仍需继续验证。",
      "估值已回到相对合理区间，安全边际较前期有所修复。"
    ],
    coachNotes: [
      "如需参与，更适合等待放量确认后的分批介入。",
      "仓位不宜一步到位，先观察财报兑现后的承接强度。",
      "止损位应设置在趋势失效区，而不是日内情绪波动位。"
    ],
    technicalView: {
      trend: "股价重新站上短中期均线，趋势处于修复阶段。",
      volume: "成交量较前期低位明显放大，说明资金重新聚焦龙头。",
      support: "190.00",
      resistance: "205.00"
    },
    fundamentals: [
      { key: "pb", label: "市净率(PB)", value: "5.2x" },
      { key: "roe", label: "ROE", value: "17.4%" },
      { key: "revenue_growth", label: "营收同比", value: "18.9%" },
      { key: "gross_margin", label: "销售毛利率", value: "14.2%" }
    ],
    catalysts: ["海外订单改善", "财报窗口临近", "板块景气修复"],
    news: [
      { title: "储能出海预期改善，龙头估值修复延续。", source: "券商晨会纪要" },
      { title: "新能源成交回暖，龙头获得增量资金关注。", source: "盘后观察" }
    ],
    riskProfile: { volatility: 58, drawdown: 49, valuation: 42, earnings: 38, sector: 44 },
    riskNotes: {
      volatility: "波动率仍高于防御性板块，仓位管理非常重要。",
      drawdown: "长期下跌结构尚未彻底反转，高位回撤风险仍需警惕。",
      valuation: "估值不算便宜，但已脱离极端高估区间。",
      earnings: "市场对盈利修复已有预期，财报若不及预期容易引发波动。",
      sector: "新能源修复仍处于早段，持续性需要景气与订单共同验证。"
    },
    radarMetrics: [
      { name: "趋势", value: 71 },
      { name: "成长", value: 75 },
      { name: "估值", value: 58 },
      { name: "资金", value: 68 },
      { name: "风控", value: 46 }
    ],
    priceSeries: [
      { date: "04-14", open: 186.2, close: 188.9, low: 185.8, high: 189.7, volume: 24 },
      { date: "04-15", open: 188.7, close: 187.8, low: 186.5, high: 190.2, volume: 19 },
      { date: "04-16", open: 187.4, close: 190.1, low: 186.9, high: 191.0, volume: 28 },
      { date: "04-17", open: 189.8, close: 192.5, low: 189.2, high: 193.7, volume: 31 },
      { date: "04-18", open: 192.2, close: 191.3, low: 190.6, high: 193.2, volume: 26 },
      { date: "04-21", open: 193.1, close: 196.8, low: 192.6, high: 197.3, volume: 38 },
      { date: "04-22", open: 196.4, close: 195.7, low: 194.5, high: 197.2, volume: 29 },
      { date: "04-23", open: 195.8, close: 196.8, low: 194.9, high: 197.6, volume: 33 }
    ]
  },
  {
    symbol: "601899",
    name: "紫金矿业",
    market: "主板",
    sector: "有色资源",
    price: "18.76",
    changePercent: 1.38,
    amplitude: "3.40%",
    turnover: "29.8 亿",
    summary: "资源涨价逻辑仍在，但短线涨幅不小，更适合顺势跟踪而非情绪化追高。",
    thesis: [
      "黄金与铜价高位运行，资源龙头获得基本面与情绪双重支撑。",
      "兼具全球定价属性，是连接外盘与 A 股风格的关键标的。",
      "高位波动会被放大，需要区分趋势延续和情绪过热。"
    ],
    coachNotes: [
      "更适合用回踩确认做交易，而不是连续加速时追涨。",
      "如果仓位已偏重，应优先考虑利润保护而不是激进扩仓。",
      "持续关注美元、美债与金价的联动变化。"
    ],
    technicalView: {
      trend: "均线多头结构仍较完整，处于高位强势震荡区。",
      volume: "量能维持活跃，但继续上攻需要新的商品价格催化。",
      support: "18.20",
      resistance: "19.00"
    },
    fundamentals: [
      { key: "pb", label: "市净率(PB)", value: "2.8x" },
      { key: "roe", label: "ROE", value: "20.1%" },
      { key: "revenue_growth", label: "营收同比", value: "12.6%" },
      { key: "gross_margin", label: "销售毛利率", value: "11.5%" }
    ],
    catalysts: ["黄金高位运行", "铜价偏强", "资源主线延续"],
    news: [
      { title: "金价高位震荡，资源龙头仍受资金关注。", source: "行业速览" },
      { title: "海外矿山扩产节奏推进，市场关注盈利弹性。", source: "机构观点" }
    ],
    riskProfile: { volatility: 51, drawdown: 32, valuation: 36, earnings: 34, sector: 39 },
    riskNotes: {
      volatility: "资源股受外盘影响较大，短线波动受商品价格驱动。",
      drawdown: "趋势相对完整，回撤风险低于高弹性成长股。",
      valuation: "估值压力不高，更受商品周期影响。",
      earnings: "盈利质量较稳，但需关注商品价格回落风险。",
      sector: "资源板块仍是主线之一，但过热后容易震荡。"
    },
    radarMetrics: [
      { name: "趋势", value: 76 },
      { name: "成长", value: 73 },
      { name: "估值", value: 72 },
      { name: "资金", value: 66 },
      { name: "风控", value: 64 }
    ],
    priceSeries: [
      { date: "04-14", open: 18.2, close: 18.4, low: 18.0, high: 18.5, volume: 21 },
      { date: "04-15", open: 18.3, close: 18.2, low: 18.0, high: 18.4, volume: 20 },
      { date: "04-16", open: 18.1, close: 18.5, low: 18.0, high: 18.6, volume: 26 },
      { date: "04-17", open: 18.4, close: 18.7, low: 18.3, high: 18.8, volume: 30 },
      { date: "04-18", open: 18.7, close: 18.6, low: 18.4, high: 18.8, volume: 28 },
      { date: "04-21", open: 18.5, close: 18.8, low: 18.4, high: 18.9, volume: 29 },
      { date: "04-22", open: 18.8, close: 18.6, low: 18.5, high: 18.9, volume: 27 },
      { date: "04-23", open: 18.6, close: 18.8, low: 18.4, high: 18.9, volume: 31 }
    ]
  },
  {
    symbol: "600519",
    name: "贵州茅台",
    market: "主板",
    sector: "食品饮料",
    price: "1,748.20",
    changePercent: -0.42,
    amplitude: "1.30%",
    turnover: "24.5 亿",
    summary: "防御属性仍在，但进攻弹性一般，当前更像稳健配置而不是高收益进攻品种。",
    thesis: [
      "白酒龙头估值稳定，适合作为风险偏好下降时的压舱石。",
      "消费修复节奏温和，板块弹性弱于成长和资源方向。",
      "若市场持续偏进攻风格，资金可能阶段性流向更高弹性板块。"
    ],
    coachNotes: [
      "更适合中线配置，不适合期待短期爆发式弹性。",
      "如果组合已经偏防御，继续加配的必要性并不高。",
      "关注消费数据与政策预期是否出现边际改善。"
    ],
    technicalView: {
      trend: "股价仍在中期震荡区间内运行，尚未形成加速上行结构。",
      volume: "量能平稳，更像配置型资金参与而非短炒。",
      support: "1730.00",
      resistance: "1780.00"
    },
    fundamentals: [
      { key: "pb", label: "市净率(PB)", value: "8.4x" },
      { key: "roe", label: "ROE", value: "32.8%" },
      { key: "revenue_growth", label: "营收同比", value: "12.1%" },
      { key: "gross_margin", label: "销售毛利率", value: "51.4%" }
    ],
    catalysts: ["消费修复", "高端白酒韧性", "机构长期配置"],
    news: [
      { title: "消费板块震荡，白酒龙头维持窄幅整理。", source: "盘后速览" },
      { title: "机构认为高端消费韧性仍在，但短期弹性有限。", source: "行业研报" }
    ],
    riskProfile: { volatility: 32, drawdown: 28, valuation: 48, earnings: 26, sector: 41 },
    riskNotes: {
      volatility: "波动率较低，更适合作为组合稳定器。",
      drawdown: "趋势没有明显恶化，但上行速度偏慢。",
      valuation: "估值处于中高位，安全边际一般。",
      earnings: "盈利稳定性较高，业绩恶化风险相对有限。",
      sector: "消费板块缺少高频催化，资金偏好不如高景气赛道。"
    },
    radarMetrics: [
      { name: "趋势", value: 54 },
      { name: "成长", value: 89 },
      { name: "估值", value: 49 },
      { name: "资金", value: 45 },
      { name: "风控", value: 84 }
    ],
    priceSeries: [
      { date: "04-14", open: 1742, close: 1748, low: 1738, high: 1752, volume: 8 },
      { date: "04-15", open: 1747, close: 1740, low: 1734, high: 1750, volume: 7 },
      { date: "04-16", open: 1739, close: 1754, low: 1738, high: 1758, volume: 10 },
      { date: "04-17", open: 1750, close: 1760, low: 1748, high: 1766, volume: 11 },
      { date: "04-18", open: 1758, close: 1752, low: 1748, high: 1761, volume: 9 },
      { date: "04-21", open: 1752, close: 1748, low: 1741, high: 1754, volume: 8 },
      { date: "04-22", open: 1749, close: 1750, low: 1743, high: 1756, volume: 8 },
      { date: "04-23", open: 1747, close: 1748, low: 1740, high: 1752, volume: 9 }
    ]
  },
  {
    symbol: "000333",
    name: "美的集团",
    market: "主板",
    sector: "家电",
    price: "71.42",
    changePercent: 0.86,
    amplitude: "2.10%",
    turnover: "18.7 亿",
    summary: "基本面稳健、现金流扎实，适合偏稳健风格的中低风险配置。",
    thesis: [
      "现金流与分红能力稳定，兼具防御与配置属性。",
      "出口与内销改善支撑盈利预期，景气度处于温和回升区间。",
      "短线弹性不如高景气科技板块，但确定性更强。"
    ],
    coachNotes: [
      "更适合在组合需要平衡时配置，而非作为短线进攻主线。",
      "若市场风险偏好下降，这类资产更容易获得回流。",
      "持续关注原材料价格和汇率对利润率的扰动。"
    ],
    technicalView: {
      trend: "股价沿上升通道缓慢抬升，节奏稳健。",
      volume: "量能温和，配置型资金参与特征更明显。",
      support: "70.00",
      resistance: "72.50"
    },
    fundamentals: [
      { key: "pb", label: "市净率(PB)", value: "3.0x" },
      { key: "roe", label: "ROE", value: "24.1%" },
      { key: "revenue_growth", label: "营收同比", value: "9.6%" },
      { key: "gross_margin", label: "销售毛利率", value: "8.4%" }
    ],
    catalysts: ["出口订单改善", "现金流稳健", "高分红属性"],
    news: [
      { title: "白电龙头维持稳健增长，机构继续提升配置权重。", source: "家电行业跟踪" },
      { title: "回购与分红预期稳定，增强中长期资金吸引力。", source: "公司观察" }
    ],
    riskProfile: { volatility: 28, drawdown: 24, valuation: 25, earnings: 29, sector: 31 },
    riskNotes: {
      volatility: "波动率较低，适合承担组合稳定器角色。",
      drawdown: "趋势相对平稳，回撤通常小于高弹性成长股。",
      valuation: "估值处于相对合理区间，安全边际较好。",
      earnings: "盈利稳健，但若出口回落会拖累估值修复。",
      sector: "家电板块缺少高频催化，更依赖基本面兑现。"
    },
    radarMetrics: [
      { name: "趋势", value: 62 },
      { name: "成长", value: 78 },
      { name: "估值", value: 79 },
      { name: "资金", value: 52 },
      { name: "风控", value: 80 }
    ],
    priceSeries: [
      { date: "04-14", open: 70.1, close: 70.6, low: 69.9, high: 70.7, volume: 11 },
      { date: "04-15", open: 70.5, close: 70.1, low: 69.8, high: 70.6, volume: 10 },
      { date: "04-16", open: 70.0, close: 70.8, low: 69.9, high: 71.0, volume: 13 },
      { date: "04-17", open: 70.7, close: 71.1, low: 70.5, high: 71.3, volume: 14 },
      { date: "04-18", open: 71.1, close: 70.9, low: 70.7, high: 71.4, volume: 12 },
      { date: "04-21", open: 70.8, close: 71.0, low: 70.6, high: 71.2, volume: 13 },
      { date: "04-22", open: 71.0, close: 71.3, low: 70.8, high: 71.5, volume: 15 },
      { date: "04-23", open: 71.2, close: 71.4, low: 71.0, high: 71.6, volume: 14 }
    ]
  },
  {
    symbol: "688111",
    name: "金山办公",
    market: "科创板",
    sector: "软件服务",
    price: "286.30",
    changePercent: 1.92,
    amplitude: "4.20%",
    turnover: "11.4 亿",
    summary: "软件龙头修复弹性较好，但估值仍偏高，更适合跟踪景气兑现节奏。",
    thesis: [
      "国产办公软件龙头具备长期壁垒，受益于信创与企业数字化。",
      "短期估值仍不便宜，股价更依赖业绩与资金共振。",
      "若科技风格继续回暖，估值溢价有望继续修复。"
    ],
    coachNotes: [
      "更适合在趋势转强且伴随放量时参与。",
      "如果缺少业绩与机构资金同步验证，不宜盲目追高。",
      "软件股波动较大，必须先定义失效位。"
    ],
    technicalView: {
      trend: "股价从整理平台上沿重新抬头，趋势修复中。",
      volume: "量能开始回升，但仍需确认是否具备持续性。",
      support: "278.00",
      resistance: "298.00"
    },
    fundamentals: [
      { key: "pb", label: "市净率(PB)", value: "11.6x" },
      { key: "roe", label: "ROE", value: "14.9%" },
      { key: "revenue_growth", label: "营收同比", value: "20.3%" },
      { key: "gross_margin", label: "销售毛利率", value: "32.7%" }
    ],
    catalysts: ["信创景气修复", "机构回补软件龙头", "企业付费提升"],
    news: [
      { title: "信创与软件板块回暖，龙头获得资金回流。", source: "科技行业日报" },
      { title: "企业端订阅业务扩展，市场关注增长持续性。", source: "公司深度" }
    ],
    riskProfile: { volatility: 64, drawdown: 45, valuation: 66, earnings: 39, sector: 48 },
    riskNotes: {
      volatility: "软件成长股弹性高，短线波动明显强于价值股。",
      drawdown: "历史波动幅度较大，回撤管理很重要。",
      valuation: "估值仍偏高，必须依赖业绩兑现支撑。",
      earnings: "若企业付费增长低于预期，容易引发估值回撤。",
      sector: "软件板块持续性受科技风格轮动影响较大。"
    },
    radarMetrics: [
      { name: "趋势", value: 68 },
      { name: "成长", value: 70 },
      { name: "估值", value: 38 },
      { name: "资金", value: 62 },
      { name: "风控", value: 34 }
    ],
    priceSeries: [
      { date: "04-14", open: 273.6, close: 275.1, low: 272.2, high: 276.4, volume: 9 },
      { date: "04-15", open: 275.0, close: 272.4, low: 271.0, high: 276.2, volume: 7 },
      { date: "04-16", open: 272.8, close: 278.3, low: 272.0, high: 279.0, volume: 10 },
      { date: "04-17", open: 278.0, close: 281.4, low: 277.2, high: 282.0, volume: 11 },
      { date: "04-18", open: 281.5, close: 279.8, low: 278.2, high: 282.4, volume: 10 },
      { date: "04-21", open: 280.2, close: 283.4, low: 279.6, high: 284.0, volume: 12 },
      { date: "04-22", open: 283.0, close: 284.6, low: 281.8, high: 285.9, volume: 12 },
      { date: "04-23", open: 284.8, close: 286.3, low: 283.4, high: 287.0, volume: 13 }
    ]
  },
  {
    symbol: "600036",
    name: "招商银行",
    market: "主板",
    sector: "银行",
    price: "45.80",
    changePercent: 0.52,
    amplitude: "1.10%",
    turnover: "14.8 亿",
    summary: "高股息与稳健资产质量带来防御属性，更适合风险偏好回落阶段的配置思路。",
    thesis: [
      "资产质量和盈利稳定性较强，是高股息与稳健风格的代表标的。",
      "弹性不如科技与资源，但在系统性风险上升时更具承接能力。",
      "估值处于相对合理区间，适合做组合稳定器。"
    ],
    coachNotes: [
      "更适合配置型思路，而不是短线高弹性交易。",
      "若市场进入避险阶段，银行板块更容易获得回流。",
      "关注利率与资产质量的边际变化。"
    ],
    technicalView: {
      trend: "趋势平稳偏强，防御属性突出。",
      volume: "量能温和，属于配置型资金主导。",
      support: "44.80",
      resistance: "46.50"
    },
    fundamentals: [
      { key: "pb", label: "市净率(PB)", value: "0.9x" },
      { key: "roe", label: "ROE", value: "15.8%" },
      { key: "revenue_growth", label: "营收同比", value: "5.4%" },
      { key: "gross_margin", label: "净息差", value: "2.1%" }
    ],
    catalysts: ["高股息配置", "资产质量稳定", "防御资金回流"],
    news: [
      { title: "高股息风格维持活跃，银行板块承接稳健。", source: "市场观察" },
      { title: "机构偏好稳健配置，龙头银行权重提升。", source: "资金跟踪" }
    ],
    riskProfile: { volatility: 24, drawdown: 22, valuation: 18, earnings: 28, sector: 26 },
    riskNotes: {
      volatility: "波动率较低，适合承担组合防御角色。",
      drawdown: "回撤控制较好，趋势稳定性较强。",
      valuation: "估值处于偏低区间，具备一定安全边际。",
      earnings: "业绩稳定，但高增长弹性有限。",
      sector: "银行板块受系统性风格影响较大，但防御属性较强。"
    },
    radarMetrics: [
      { name: "趋势", value: 66 },
      { name: "成长", value: 58 },
      { name: "估值", value: 84 },
      { name: "资金", value: 49 },
      { name: "风控", value: 86 }
    ],
    priceSeries: [
      { date: "04-14", open: 45.0, close: 45.1, low: 44.9, high: 45.2, volume: 8 },
      { date: "04-15", open: 45.1, close: 45.0, low: 44.8, high: 45.2, volume: 7 },
      { date: "04-16", open: 44.9, close: 45.3, low: 44.8, high: 45.4, volume: 9 },
      { date: "04-17", open: 45.2, close: 45.5, low: 45.1, high: 45.7, volume: 10 },
      { date: "04-18", open: 45.5, close: 45.4, low: 45.2, high: 45.6, volume: 9 },
      { date: "04-21", open: 45.3, close: 45.6, low: 45.2, high: 45.8, volume: 10 },
      { date: "04-22", open: 45.6, close: 45.7, low: 45.4, high: 45.9, volume: 11 },
      { date: "04-23", open: 45.7, close: 45.8, low: 45.5, high: 46.0, volume: 10 }
    ]
  }
];

export const mockScreeningSnapshot = {
  strategies: ["趋势跟随", "放量突破", "估值筛选", "盈利成长", "多因子平衡"],
  filters: {
    trend: [
      { value: "all", label: "全部趋势" },
      { value: "uptrend", label: "趋势向上" },
      { value: "breakout", label: "放量突破" }
    ],
    valuation: [
      { value: "all", label: "全部估值" },
      { value: "reasonable", label: "估值合理" },
      { value: "low", label: "相对低估" }
    ],
    growth: [
      { value: "all", label: "全部成长" },
      { value: "positive", label: "正向增长" },
      { value: "strong", label: "成长更强" }
    ],
    risk: [
      { value: "all", label: "全部风险" },
      { value: "medium_or_below", label: "中风险及以下" },
      { value: "low", label: "仅低风险" }
    ]
  },
  appliedFilters: { trend: "all", valuation: "all", growth: "all", risk: "all" },
  poolSummary: { poolName: "核心股票池", poolSize: 6, matchCount: 4 },
  items: [
    {
      symbol: "300750",
      name: "宁德时代",
      sector: "电力设备",
      market: "创业板",
      price: "196.82",
      changePercent: 2.14,
      score: 82,
      riskLevel: "中风险",
      reasons: ["趋势修复明显", "机构资金回补", "估值回到合理区间"],
      metrics: { trend: 76, valuation: 58, growth: 78, risk: 54 }
    },
    {
      symbol: "601899",
      name: "紫金矿业",
      sector: "有色资源",
      market: "主板",
      price: "18.76",
      changePercent: 1.38,
      score: 79,
      riskLevel: "中风险",
      reasons: ["商品价格偏强", "盈利韧性较高", "行业主线仍在"],
      metrics: { trend: 74, valuation: 72, growth: 66, risk: 61 }
    },
    {
      symbol: "000333",
      name: "美的集团",
      sector: "家电",
      market: "主板",
      price: "71.42",
      changePercent: 0.86,
      score: 74,
      riskLevel: "低风险",
      reasons: ["现金流稳健", "ROE 较高", "分红属性明确"],
      metrics: { trend: 62, valuation: 79, growth: 68, risk: 80 }
    },
    {
      symbol: "600036",
      name: "招商银行",
      sector: "银行",
      market: "主板",
      price: "45.80",
      changePercent: 0.52,
      score: 72,
      riskLevel: "低风险",
      reasons: ["估值偏低", "高股息配置", "风险等级较低"],
      metrics: { trend: 66, valuation: 84, growth: 58, risk: 86 }
    }
  ]
};

export const mockDocumentSeed = {
  title: "某锂电龙头 2026Q1 财报提炼",
  sourceName: "示例财报文本",
  sourceType: "seed",
  characterCount: 186,
  summary: "收入与利润表现好于保守预期，库存与现金流改善明显，但市场已提前交易部分修复逻辑。",
  highlights: [
    "储能业务毛利率环比提升 1.8 个百分点。",
    "海外订单改善，经营现金流转正。",
    "研发投入维持高位，龙头竞争优势继续巩固。"
  ],
  keyData: [
    "营业收入同比增长 18.9%。",
    "归母净利润同比增长 21.3%。",
    "储能业务毛利率环比提升 1.8 个百分点。"
  ],
  risks: [
    "碳酸锂价格反复可能影响盈利弹性。",
    "海外需求节奏仍需持续验证。",
    "若行业价格战重启，估值修复空间会被压缩。"
  ],
  institutionSummary: "机构观点更偏向把亮点与风险放在同一张表里审视，重点关注后续兑现是否能够跟上当前预期。",
  conclusion: "结论偏中性偏多。趋势尚未走坏，但更适合等待财报兑现后的二次确认。"
};

export function getMockStockBySymbol(symbol) {
  return mockStocks.find((item) => item.symbol === symbol);
}

export function getMockStockUniverse() {
  return mockStocks.map((item) => ({
    symbol: item.symbol,
    name: item.name,
    market: item.market,
    sector: item.sector,
    price: item.price,
    changePercent: item.changePercent,
    summary: item.summary
  }));
}
