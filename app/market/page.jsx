import { PlatformShell } from "@/components/platform-shell";
import { SectionHeading } from "@/components/section-heading";
import { SignalBadge } from "@/components/signal-badge";
import { DataStatusNote } from "@/components/data-status-note";
import { SectionSourceNote } from "@/components/section-source-note";
import { EChartPanel } from "@/components/charts/echart-panel";
import { buildFlowOption, buildHeatmapOption, buildIndexTrendOption } from "@/lib/chart-options";
import { formatPercent, getChangeTone, getRiskTone } from "@/lib/format";
import { getMarketOverview } from "@/lib/services/market-service";

export const metadata = {
  title: "市场检测"
};

export default async function MarketPage() {
  const marketPayload = await getMarketOverview();
  const market = marketPayload.data;

  return (
    <PlatformShell>
      <div className="grid gap-6">
        <section className="strong-panel rounded-[34px] px-5 py-6 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <SignalBadge tone="neutral">市场总览</SignalBadge>
            <SignalBadge tone={getRiskTone(market.overview.riskLevel)}>{market.overview.riskLevel}</SignalBadge>
          </div>
          <h1 className="mt-4 font-display text-4xl font-semibold text-slate-950">从指数、资金、轮动和情绪理解当前环境</h1>
          <p className="mt-4 max-w-4xl text-base leading-8 text-slate-600">
            {market.overview.summary} 在这里，我们先判断市场是否支持积极出手，再拆分指数趋势、热点轮动、宏观背景与跨市场联动。
          </p>
          <DataStatusNote meta={marketPayload.meta} className="mt-4" />
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
          <div className="space-y-6">
            <SectionHeading
              kicker="指数趋势"
              title="指数与量能"
              description="用趋势图快速判断市场修复强度与风格主导方向。"
            />
            <EChartPanel option={buildIndexTrendOption(market.charts.trendSeries)} height={360} />
          </div>

          <div className="soft-panel rounded-[30px] p-5 sm:p-6">
            <SectionHeading
              kicker="热点轮动"
              title="主线方向与风险信号"
              description="明确当前是谁在带节奏，也明确风险从哪里开始抬头。"
            />

            <div className="mt-5 grid gap-3">
              {market.hotSectors.map((item) => (
                <div key={item.name} className="rounded-[22px] border border-slate-900/8 bg-white/84 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-950">{item.name}</p>
                    <span className="value-positive">{formatPercent(item.changePercent)}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{item.reason}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[24px] border border-slate-900/8 bg-slate-50/86 p-4">
              <p className="font-medium text-slate-950">风险升温点</p>
              <div className="mt-3 space-y-2 text-sm leading-7 text-slate-600">
                {market.riskSignals.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
          <div>
            <EChartPanel option={buildHeatmapOption(market.charts.sectorHeatmap)} height={400} />
            <SectionSourceNote item={market.dataLineage?.indices} className="mt-3" />
          </div>
          <div>
            <EChartPanel option={buildFlowOption(market.charts.capitalFlowSeries)} height={400} />
            <SectionSourceNote item={market.dataLineage?.capitalFlowSeries} className="mt-3" />
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <div className="soft-panel rounded-[30px] p-5 sm:p-6">
            <SectionHeading
              kicker="宏观视角"
              title="宏观偏多 / 偏空 / 中性的判断基础"
              description="用更少的字说明对 A 股风险偏好与行业轮动的潜在影响。"
            />
            <SectionSourceNote item={market.dataLineage?.macroSignals} className="mt-4" />
            <div className="mt-5 grid gap-3">
              {market.macroSignals.map((item) => (
                <div key={item.label} className="rounded-[22px] border border-slate-900/8 bg-white/84 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-950">{item.label}</p>
                    <span className="text-sm text-slate-500">{item.bias}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="soft-panel rounded-[30px] p-5 sm:p-6">
            <SectionHeading
              kicker="全球市场"
              title="跨市场联动"
              description="外盘不是噪音，而是理解 A 股风险偏好的辅助变量。"
            />
            <SectionSourceNote item={market.dataLineage?.globalMarkets} className="mt-4" />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {market.globalMarkets.map((item) => (
                <div key={item.name} className="rounded-[22px] border border-slate-900/8 bg-white/84 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-950">{item.name}</p>
                    <span className={item.changePercent >= 0 ? "value-positive" : "value-negative"}>
                      {formatPercent(item.changePercent)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{item.value}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{item.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PlatformShell>
  );
}
