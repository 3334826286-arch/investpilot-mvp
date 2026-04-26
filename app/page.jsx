import Link from "next/link";
import { PlatformShell } from "@/components/platform-shell";
import { SectionHeading } from "@/components/section-heading";
import { SignalBadge } from "@/components/signal-badge";
import { StockSearch } from "@/components/stock-search";
import { DataStatusNote } from "@/components/data-status-note";
import { SectionSourceNote } from "@/components/section-source-note";
import { EChartPanel } from "@/components/charts/echart-panel";
import { buildFlowOption, buildHeatmapOption, buildIndexTrendOption } from "@/lib/chart-options";
import { formatPercent, getChangeTone, getImportanceTone, getRiskTone } from "@/lib/format";
import { getCalendarFeed } from "@/lib/services/calendar-service";
import { getDocumentWorkbenchSeed } from "@/lib/services/documents-service";
import { getMarketOverview } from "@/lib/services/market-service";
import { getScreenerSnapshot } from "@/lib/services/screener-service";
import { getStockUniverse } from "@/lib/services/stocks-service";

export default async function HomePage() {
  const [marketPayload, calendarPayload, screenerPayload, documentPayload, stockUniversePayload] = await Promise.all([
    getMarketOverview(),
    getCalendarFeed(),
    getScreenerSnapshot(),
    getDocumentWorkbenchSeed(),
    getStockUniverse()
  ]);

  const market = marketPayload.data;
  const calendar = calendarPayload.data;
  const screener = screenerPayload.data;
  const documentSeed = documentPayload.data;
  const stockUniverse = stockUniversePayload.data.items;

  return (
    <PlatformShell>
      <div className="grid gap-6">
        <section className="grid gap-6 xl:grid-cols-[1.14fr_0.86fr]">
          <div className="reveal strong-panel rounded-[34px] px-5 py-6 sm:px-6 sm:py-7">
            <div className="flex flex-wrap items-center gap-2">
              <SignalBadge tone="neutral">中文投资终端</SignalBadge>
              <SignalBadge tone={getRiskTone(market.overview.riskLevel)}>{market.overview.riskLevel}</SignalBadge>
              <SignalBadge tone="warning">更新于 {market.overview.updatedAt}</SignalBadge>
            </div>

            <h1 className="mt-5 max-w-4xl font-display text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              {market.heroTitle}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">{market.heroDescription}</p>
            <DataStatusNote meta={marketPayload.meta} className="mt-4" />

            <div className="mt-7 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
              <div className="rounded-[28px] border border-slate-900/8 bg-slate-950 px-5 py-5 text-white">
                <p className="text-sm uppercase tracking-[0.18em] text-slate-400">今日市场结论</p>
                <p className="mt-4 font-display text-3xl font-semibold">{market.overview.regime}</p>
                <p className="mt-3 text-sm leading-7 text-slate-300">{market.overview.summary}</p>
                <p className="mt-4 rounded-[22px] bg-white/8 px-4 py-3 text-sm leading-7 text-slate-200">
                  策略提示：{market.overview.strategyNote}
                </p>
              </div>

              <div className="grid gap-3">
                {market.quickLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-[24px] border border-slate-900/8 bg-white/86 px-5 py-4 transition hover:-translate-y-0.5 hover:border-slate-900/14"
                  >
                    <p className="font-medium text-slate-950">{item.label}</p>
                    <p className="mt-2 text-sm text-slate-500">进入对应模块，查看更完整的结构化分析与辅助建议。</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="reveal delay-1">
            <StockSearch stocks={stockUniverse} />
          </div>
        </section>

        <section className="reveal delay-1 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {market.indices.map((item) => (
            <article key={item.code} className="soft-panel rounded-[28px] p-5">
              <p className="text-sm text-slate-500">{item.name}</p>
              <div className="mt-3 flex items-end justify-between gap-3">
                <p className="font-display text-3xl font-semibold text-slate-950">{item.value}</p>
                <span
                  className={`text-sm font-medium ${
                    getChangeTone(item.changePercent) === "positive" ? "value-positive" : "value-negative"
                  }`}
                >
                  {formatPercent(item.changePercent)}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-500">{item.note}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
          <div className="reveal delay-2 space-y-6">
            <SectionHeading
              kicker="市场检测"
              title="先看环境强弱，再决定是否出手"
              description="首页先回答市场状态，再拆分指数趋势、情绪宽度、资金方向和板块轮动。"
            />
            <EChartPanel option={buildIndexTrendOption(market.charts.trendSeries)} height={360} />
          </div>

          <div className="reveal delay-2 soft-panel rounded-[30px] p-5 sm:p-6">
            <SectionHeading
              kicker="今日状态"
              title="市场情绪与风控提示"
              description="把复杂盘面压缩成可执行的中文结论，而不是堆叠指标。"
            />

            <div className="mt-6 grid gap-3">
              {market.breadth.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-[22px] border border-slate-900/8 bg-white/80 px-4 py-3"
                >
                  <span className="text-sm text-slate-500">{item.label}</span>
                  <span
                    className={`text-sm font-medium ${
                      item.tone === "positive"
                        ? "value-positive"
                        : item.tone === "negative"
                          ? "value-negative"
                          : "text-amber-700"
                    }`}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[26px] border border-slate-900/8 bg-slate-50/86 p-4">
              <p className="font-medium text-slate-950">交易教练提示</p>
              <div className="mt-3 space-y-2 text-sm leading-7 text-slate-600">
                {market.coachNotes.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="reveal delay-3 space-y-6">
            <SectionHeading
              kicker="数据可视化"
              title="用清晰图表表达市场结构"
              description="热力图看资金聚焦，趋势图看风格变化，帮助减少信息噪音。"
            />
            <EChartPanel option={buildHeatmapOption(market.charts.sectorHeatmap)} height={380} />
          </div>

          <div className="reveal delay-3 space-y-6">
            <div>
              <EChartPanel option={buildFlowOption(market.charts.capitalFlowSeries)} height={240} />
              <SectionSourceNote item={market.dataLineage?.capitalFlowSeries} className="mt-3" />
            </div>

            <div className="soft-panel rounded-[30px] p-5 sm:p-6">
              <p className="section-kicker">重要日程</p>
              <h3 className="mt-2 font-display text-2xl font-semibold text-slate-950">财经日历重点事件</h3>
              <div className="mt-5 grid gap-3">
                {calendar.items.slice(0, 4).map((item) => (
                  <article key={item.id} className="rounded-[22px] border border-slate-900/8 bg-white/84 px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {item.date} {item.weekday} · {item.time}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">{item.type}</p>
                      </div>
                      <SignalBadge tone={getImportanceTone(item.importance)}>{item.importance}重要</SignalBadge>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-700">{item.title}</p>
                  </article>
                ))}
              </div>
              <Link href="/calendar" className="mt-5 inline-flex text-sm font-medium text-slate-950">
                查看完整财经日历 →
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="soft-panel rounded-[30px] p-5 sm:p-6">
            <SectionHeading
              kicker="全球市场"
              title="外盘观察"
              description="用于判断全球风险偏好如何向 A 股传导。"
            />
            <SectionSourceNote item={market.dataLineage?.globalMarkets} className="mt-4" />
            <div className="mt-5 grid gap-3">
              {market.globalMarkets.slice(0, 4).map((item) => (
                <div key={item.name} className="rounded-[22px] border border-slate-900/8 bg-white/84 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-950">{item.name}</p>
                    <span className={item.changePercent >= 0 ? "value-positive" : "value-negative"}>
                      {formatPercent(item.changePercent)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    {item.value} · {item.note}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="soft-panel rounded-[30px] p-5 sm:p-6">
            <SectionHeading
              kicker="量化选股"
              title="规则驱动的候选池"
              description="第一版先把趋势、估值、成长与风险做成可解释筛选。"
            />
            <div className="mt-5 grid gap-3">
              {screener.items.slice(0, 4).map((item) => (
                <Link
                  key={item.symbol}
                  href={`/stock/${item.symbol}`}
                  className="rounded-[22px] border border-slate-900/8 bg-white/84 px-4 py-4 transition hover:bg-white"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-950">
                      {item.name} <span className="text-slate-400">{item.symbol}</span>
                    </p>
                    <span className="text-sm text-slate-500">综合 {item.score}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{item.reasons.join("；")}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="soft-panel rounded-[30px] p-5 sm:p-6">
            <SectionHeading
              kicker="文档提炼"
              title="把长文档压缩成一页式结论"
              description="适合年报、季报、公告、纪要与研报的快速提炼。"
            />
            <div className="mt-5 rounded-[22px] border border-slate-900/8 bg-white/84 px-4 py-4">
              <p className="font-medium text-slate-950">{documentSeed.title}</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">{documentSeed.summary}</p>
              <p className="mt-3 text-sm font-medium text-slate-900">结论：{documentSeed.conclusion}</p>
            </div>
          </div>
        </section>
      </div>
    </PlatformShell>
  );
}
