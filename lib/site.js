export const siteConfig = {
  name: "InvestPilot",
  shortName: "IP",
  title: "中文投资研究与决策辅助平台",
  description:
    "面向中文用户的开放式投资研究平台，覆盖市场观察、个股研究、公告与研报检索、文档提炼和风险辅助判断，帮助用户更高效地理解市场与组织研究结论。",
  email: "hello@investpilot.app"
};

export const primaryNavigation = [
  { href: "/", label: "首页" },
  { href: "/market", label: "市场" },
  { href: "/risk", label: "风险评估" },
  { href: "/search", label: "研究工作台" },
  { href: "/documents", label: "文档提炼" },
  { href: "/calendar", label: "财经日历" },
  { href: "/watchlist", label: "自选股" }
];

export const productNavigation = [
  { href: "/about", label: "关于产品" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "联系我们" }
];

export const legalNavigation = [
  { href: "/privacy", label: "隐私政策" },
  { href: "/terms", label: "服务条款" },
  { href: "/risk-disclaimer", label: "风险免责声明" }
];

export const homepagePrimaryActions = [
  { href: "/search", label: "进入研究工作台" },
  { href: "/market", label: "查看今日市场" },
  { href: "/documents", label: "开始文档提炼" }
];

export const homepageCapabilities = [
  {
    title: "市场检测",
    description: "先判断环境强弱，再决定是否出手，避免把个股判断放在错误的市场背景里。",
    href: "/market"
  },
  {
    title: "个股研究页",
    description: "整合行情、风险、财报、公告、研报与行业信息，形成更完整的研究入口。",
    href: "/stock/300750"
  },
  {
    title: "研究工作台",
    description: "支持搜股票、搜公告、搜研报、搜新闻，并可一键进入摘要提炼流程。",
    href: "/search"
  },
  {
    title: "文档提炼",
    description: "面向年报、公告、研报与纪要，压缩成长文摘要、关键数据、风险与结论。",
    href: "/documents"
  },
  {
    title: "财经日历",
    description: "把财报、宏观数据与重要事件放进统一日历里，减少节奏误判。",
    href: "/calendar"
  },
  {
    title: "游客自选股",
    description: "不登录也能保存自选股、最近浏览与搜索记录，降低首次使用门槛。",
    href: "/watchlist"
  }
];

export const homepageScenarios = [
  "想先判断今天市场是否适合积极参与。",
  "看到一只股票后，想快速补齐公告、财报和研报背景。",
  "拿到一份公告或年报，希望先生成正式中文摘要再继续研究。",
  "不想注册登录，也希望能持续维护自己的关注清单与最近研究记录。"
];

export const faqEntries = [
  {
    question: "InvestPilot 是否提供买卖建议或收益承诺？",
    answer:
      "不会。平台定位是研究与决策辅助工具，用于帮助用户理解市场、识别风险、组织研究资料，不构成任何买卖建议、收益承诺或个股推荐。"
  },
  {
    question: "必须登录后才能使用核心功能吗？",
    answer:
      "不需要。市场总览、个股研究、情报搜索、财经日历和文档提炼等核心功能默认对游客开放。后续登录能力只用于同步数据和个性化设置。"
  },
  {
    question: "平台上的数据是否全部为实时官方数据？",
    answer:
      "当前平台会优先使用正式数据链路，并在页面中标注数据来源、回退状态和口径说明。对于暂未接入完整实时链路的部分，会明确提示，而不会伪装成完整实时结论。"
  },
  {
    question: "自选股和最近浏览会保存在哪里？",
    answer:
      "在游客模式下，数据默认保存在你的本地浏览器中，不要求先登录。未来如果开放可选登录，会支持跨设备同步。"
  }
];

export const contactChannels = [
  { label: "产品合作", value: "hello@investpilot.app" },
  { label: "意见反馈", value: "support@investpilot.app" },
  { label: "数据纠错", value: "data@investpilot.app" }
];
