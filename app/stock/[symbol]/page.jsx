import Link from "next/link";
import { notFound } from "next/navigation";
import { PlatformShell } from "@/components/platform-shell";
import { SectionHeading } from "@/components/section-heading";
import { SignalBadge } from "@/components/signal-badge";
import { DataStatusNote } from "@/components/data-status-note";
import { EChartPanel } from "@/components/charts/echart-panel";
import { WatchlistToggle } from "@/components/watchlist-toggle";
import { buildCandlestickOption, buildRadarOption } from "@/lib/chart-options";
import { formatPercent, getRiskTone } from "@/lib/format";
import { getStockAnalysis, getStockUniverse } from "@/lib/services/stocks-service";

export async function generateStaticParams() {
  const payload = await getStockUniverse();
  const items = payload?.data?.items ?? [];

  return items.slice(0, 12).map((item) => ({
    symbol: item.symbol
  }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }) {
  const { symbol } = await params;
  const payload = await getStockAnalysis(symbol, { position: 0.45 });
  const stock = payload?.data?.stock;

  return {
    title: stock ? `${stock.name} ${stock.symbol}` : "个股详情"
  };
}

export default async function StockDetailPage({ params }) {
  const { symbol } = await params;
  const payload = await getStockAnalysis(symbol, { position: 0.45 });
  const current = payload.data;

  if (!current?.stock) {
    notFound();
  }

  const { stock, risk } = current;

  return (
    <PlatformShell>
      <div className="grid gap-6">
        <section className="strong-panel rounded-[34px] px-5 py-6 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <SignalBadge tone="neutral">{stock.market}</SignalBadge>
            <SignalBadge tone={stock.changePercent >= 0 ? "positive" : "negative"}>{formatPercent(stock.changePercent)}</SignalBadge>
            <SignalBadge tone={getRiskTone(risk.level)}>{risk.level}</SignalBadge>
          </div>

          <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <h1 className="font-display text-4xl font-semibold text-slate-950">
                {stock.name} <span className="text-slate-400">{stock.symbol}</span>
              </h1>
              <p className="mt-3 text-base leading-8 text-slate-600">{stock.summary}</p>
            </div>

            <div className="grid gap-3 text-left lg:text-right">
              <p className="font-display text-4xl font-semibold text-slate-950">{stock.price}</p>
              <p className={stock.changePercent >= 0 ? "value-positive" : "value-negative"}>{formatPercent(stock.changePercent)}</p>
              <p className="text-sm text-slate-500">
                振幅 {stock.amplitude} · 成交额 {stock.turnover}
              </p>
              <div className="lg:ml-auto">
                <WatchlistToggle symbol={stock.symbol} />
              </div>
            </div>
          </div>

          <DataStatusNote meta={payload.meta} className="mt-4" />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.16fr_0.84fr]">
          <EChartPanel option={buildCandlestickOption(stock.priceSeries)} height={430} />

          <div className="grid gap-6">
            <EChartPanel option={buildRadarOption(stock.radarMetrics)} height={208} />

            <div className="soft-panel rounded-[28px] p-5">
              <p className="section-kicker">顶部结论卡</p>
              <p className="mt-3 text-xl font-semibold text-slate-950">{risk.actionSummary}</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">{risk.managementAdvice}</p>
              <p className="mt-3 rounded-[22px] bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-600">
                AI 中文总结：{stock.summary}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">
          <div className="soft-panel rounded-[30px] p-5 sm:p-6">
            <SectionHeading
              kicker="技术面与基本面"
              title="关键观察项"
              description="第一版聚焦最影响决策的核心指标、趋势判断与支撑压力位。"
            />

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {stock.fundamentals.map((item) => (
                <div key={item.key} className="rounded-[22px] border border-slate-900/8 bg-white/84 px-4 py-4">
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="mt-3 font-display text-2xl font-semibold text-slate-950">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[24px] border border-slate-900/8 bg-slate-50/86 p-4">
              <p className="font-medium text-slate-950">技术面摘要</p>
              <div className="mt-3 space-y-2 text-sm leading-7 text-slate-600">
                <p>{stock.technicalView.trend}</p>
                <p>{stock.technicalView.volume}</p>
                <p>支撑位：{stock.technicalView.support}</p>
                <p>压力位：{stock.technicalView.resistance}</p>
              </div>
            </div>

            <div className="mt-6 rounded-[24px] border border-slate-900/8 bg-white/84 p-4">
              <p className="font-medium text-slate-950">核心逻辑</p>
              <div className="mt-3 space-y-2 text-sm leading-7 text-slate-600">
                {stock.thesis.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="soft-panel rounded-[30px] p-5 sm:p-6">
            <SectionHeading
              kicker="风险评估"
              title="风险来源说明"
              description="不只给结果，也把每个风险因子的来源、等级与管理建议拆开说明。"
            />
            <div className="mt-5 grid gap-4">
              {risk.factors.map((item) => (
                <article key={item.key} className="rounded-[22px] border border-slate-900/8 bg-white/84 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-950">{item.label}</p>
                    <span className="text-sm text-slate-500">{item.score}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${
                        item.score >= 68 ? "bg-rose-500" : item.score >= 43 ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-500">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="soft-panel rounded-[30px] p-5 sm:p-6">
            <SectionHeading
              kicker="催化因素"
              title="当前值得跟踪"
              description="决定趋势能否延续的关键变量。"
            />
            <div className="mt-5 grid gap-3">
              {stock.catalysts.map((item) => (
                <div key={item} className="rounded-[22px] border border-slate-900/8 bg-white/84 px-4 py-4 text-sm leading-6 text-slate-600">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="soft-panel rounded-[30px] p-5 sm:p-6">
            <SectionHeading
              kicker="新闻与公告"
              title="重点信息摘要"
              description="后续可以继续接入公告搜索、新闻聚合与机构观点。"
            />
            <div className="mt-5 grid gap-3">
              {stock.news.map((item) => (
                <div key={item.title} className="rounded-[22px] border border-slate-900/8 bg-white/84 px-4 py-4">
                  <p className="font-medium text-slate-950">{item.title}</p>
                  <p className="mt-2 text-sm text-slate-500">{item.source}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="soft-panel rounded-[30px] p-5 sm:p-6">
            <SectionHeading
              kicker="交易教练"
              title="辅助建议"
              description="不是代替用户下判断，而是帮助提升纪律与决策质量。"
            />
            <div className="mt-5 grid gap-3">
              {stock.coachNotes.map((item) => (
                <div key={item} className="rounded-[22px] border border-slate-900/8 bg-white/84 px-4 py-4 text-sm leading-7 text-slate-600">
                  {item}
                </div>
              ))}
            </div>
            <Link href="/risk" className="mt-5 inline-flex text-sm font-medium text-slate-950">
              返回风险工作台 →
            </Link>
          </div>
        </section>
      </div>
    </PlatformShell>
  );
}
