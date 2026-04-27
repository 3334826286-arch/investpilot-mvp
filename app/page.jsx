import Link from "next/link";
import { PlatformShell } from "@/components/platform-shell";
import { SectionHeading } from "@/components/section-heading";
import { SignalBadge } from "@/components/signal-badge";
import { StockSearch } from "@/components/stock-search";
import { GuestActivityPanel } from "@/components/guest-activity-panel";
import { DataStatusNote } from "@/components/data-status-note";
import { EChartPanel } from "@/components/charts/echart-panel";
import { buildHeatmapOption, buildIndexTrendOption } from "@/lib/chart-options";
import { formatPercent, getRiskTone } from "@/lib/format";
import { faqEntries, homepageCapabilities, homepagePrimaryActions, homepageScenarios } from "@/lib/site";
import { getMarketOverview } from "@/lib/services/market-service";
import { getStockUniverse } from "@/lib/services/stocks-service";

export default async function HomePage() {
  const [marketPayload, stockUniversePayload] = await Promise.all([getMarketOverview(), getStockUniverse({ limit: 8 })]);
  const market = marketPayload.data;
  const stockUniverse = stockUniversePayload.data.items;

  return (
    <PlatformShell>
      <div className="grid gap-6">
        <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="reveal strong-panel rounded-[34px] px-5 py-6 sm:px-6 sm:py-7">
            <div className="flex flex-wrap items-center gap-2">
              <SignalBadge tone="neutral">正式公测版</SignalBadge>
              <SignalBadge tone={getRiskTone(market.overview.riskLevel)}>{market.overview.riskLevel}</SignalBadge>
              <SignalBadge tone="warning">游客可直接体验核心功能</SignalBadge>
            </div>

            <h1 className="mt-5 max-w-4xl font-display text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              把市场、个股、公告、研报与长文档整理成真正可用的中文研究工作流。
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
              InvestPilot 面向真实用户开放使用，优先解决“信息太碎、研究太慢、结论不成体系”的问题。你可以不登录，直接从市场总览、股票搜索、研究工作台或文档提炼开始。
            </p>
            <DataStatusNote meta={marketPayload.meta} className="mt-4" />

            <div className="mt-7 flex flex-wrap gap-3">
              {homepagePrimaryActions.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-5 py-3 text-sm font-medium transition ${
                    index === 0
                      ? "bg-slate-950 text-white shadow-[0_16px_36px_rgba(15,23,42,0.18)] hover:-translate-y-0.5"
                      : "border border-slate-900/10 bg-white text-slate-700 hover:border-slate-900/20 hover:text-slate-950"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[24px] border border-slate-900/8 bg-slate-950 px-4 py-4 text-white">
                <p className="text-sm text-slate-300">今日市场结论</p>
                <p className="mt-3 font-display text-3xl font-semibold">{market.overview.regime}</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">{market.overview.summary}</p>
              </div>
              <div className="rounded-[24px] border border-slate-900/8 bg-white/86 px-4 py-4">
                <p className="text-sm text-slate-500">系统性风险温度</p>
                <p className="mt-3 font-display text-3xl font-semibold text-slate-950">{market.systemicRiskScore}</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">先判断环境是否支持积极参与，再决定仓位与节奏。</p>
              </div>
              <div className="rounded-[24px] border border-slate-900/8 bg-white/86 px-4 py-4">
                <p className="text-sm text-slate-500">北向与情绪</p>
                <p className="mt-3 font-display text-3xl font-semibold text-slate-950">{market.breadth[2]?.value ?? "--"}</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">把指数、情绪与资金线索放在同一页里理解。</p>
              </div>
            </div>
          </div>

          <div className="reveal delay-1 grid gap-6">
            <StockSearch stocks={stockUniverse} />
          </div>
        </section>

        <GuestActivityPanel />

        <section className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
          <div className="reveal delay-1 space-y-6">
            <SectionHeading
              kicker="产品能力"
              title="不是资讯堆砌，而是围绕研究决策组织功能"
              description="正式产品版会优先保证游客可直接进入核心功能，并把市场、个股、搜索和文档研究串成一条能长期复用的研究链路。"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {homepageCapabilities.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="soft-panel rounded-[26px] p-5 transition hover:-translate-y-0.5 hover:border-slate-900/14"
                >
                  <p className="font-display text-xl font-semibold text-slate-950">{item.title}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="reveal delay-2 soft-panel rounded-[30px] p-5 sm:p-6">
            <SectionHeading
              kicker="适用场景"
              title="用户最常见的使用路径"
              description="首页不再只为展示而存在，而是明确告诉真实用户应该从哪里开始。"
            />
            <div className="mt-5 grid gap-3">
              {homepageScenarios.map((item) => (
                <div key={item} className="rounded-[22px] border border-slate-900/8 bg-white/84 px-4 py-4 text-sm leading-7 text-slate-600">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="reveal delay-2 space-y-6">
            <SectionHeading
              kicker="市场快照"
              title="先看环境，再决定研究方向"
              description="首页先给市场强弱和主要风格变化，帮助用户快速判断今天更适合进攻、观察还是控制风险。"
            />
            <EChartPanel option={buildIndexTrendOption(market.charts.trendSeries)} height={360} />
          </div>

          <div className="reveal delay-2 soft-panel rounded-[30px] p-5 sm:p-6">
            <SectionHeading
              kicker="重点指数"
              title="今日市场关键读数"
              description="减少指标噪音，只保留影响决策的核心市场变量。"
            />
            <div className="mt-5 grid gap-3">
              {market.indices.map((item) => (
                <article key={item.code} className="rounded-[22px] border border-slate-900/8 bg-white/86 px-4 py-4">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-500">{item.name}</p>
                      <p className="mt-3 font-display text-3xl font-semibold text-slate-950">{item.value}</p>
                    </div>
                    <span className={item.changePercent >= 0 ? "value-positive" : "value-negative"}>
                      {formatPercent(item.changePercent)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.note}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.96fr_1.04fr]">
          <div className="reveal delay-3 soft-panel rounded-[30px] p-5 sm:p-6">
            <SectionHeading
              kicker="热点结构"
              title="板块轮动与资金焦点"
              description="比起单只股票涨跌，更重要的是判断当前主线是否足够清晰、是否适合继续扩散。"
            />
            <div className="mt-5 grid gap-3">
              {market.hotSectors.slice(0, 4).map((item) => (
                <div key={item.name} className="rounded-[22px] border border-slate-900/8 bg-white/84 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-950">{item.name}</p>
                    <span className={item.changePercent >= 0 ? "value-positive" : "value-negative"}>
                      {formatPercent(item.changePercent)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.reason}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="reveal delay-3 space-y-6">
            <EChartPanel option={buildHeatmapOption(market.charts.sectorHeatmap)} height={420} />
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
          <div className="soft-panel rounded-[30px] p-5 sm:p-6">
            <SectionHeading
              kicker="常见问题"
              title="第一次使用前最值得先看清楚的几件事"
              description="正式产品会尽量把边界、定位和数据口径说清楚，而不是让用户自己猜。"
            />
            <div className="mt-5 grid gap-3">
              {faqEntries.slice(0, 3).map((item) => (
                <div key={item.question} className="rounded-[22px] border border-slate-900/8 bg-white/86 px-4 py-4">
                  <p className="font-medium text-slate-950">{item.question}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.answer}</p>
                </div>
              ))}
            </div>
            <Link href="/faq" className="mt-5 inline-flex text-sm font-medium text-slate-950">
              查看完整 FAQ →
            </Link>
          </div>

          <div className="soft-panel rounded-[30px] p-5 sm:p-6">
            <SectionHeading
              kicker="公开使用说明"
              title="开放使用，不以登录作为门槛"
              description="产品优先保证游客也能顺畅体验主要功能；登录能力只会用于同步和个性化，而不是阻断核心使用流程。"
            />
            <div className="mt-5 rounded-[24px] border border-slate-900/8 bg-slate-950 px-5 py-5 text-white">
              <p className="text-sm text-slate-300">当前开放策略</p>
              <div className="mt-4 grid gap-3 text-sm leading-7 text-slate-200">
                <p>市场总览、个股研究、研究工作台、文档提炼和财经日历默认开放给游客使用。</p>
                <p>自选股、最近浏览和搜索历史优先存储在本地浏览器中，不要求先注册或登录。</p>
                <p>后续如开放可选登录，只用于跨设备同步、个性化偏好和研究记录归档。</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/risk-disclaimer" className="rounded-full border border-slate-900/10 bg-white px-4 py-2 text-sm text-slate-700">
                查看风险免责声明
              </Link>
              <Link href="/contact" className="rounded-full border border-slate-900/10 bg-white px-4 py-2 text-sm text-slate-700">
                联系我们
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PlatformShell>
  );
}
