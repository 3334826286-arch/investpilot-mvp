import Link from "next/link";
import { notFound } from "next/navigation";
import { PlatformShell } from "@/components/platform-shell";
import { SectionHeading } from "@/components/section-heading";
import { SignalBadge } from "@/components/signal-badge";
import { DataStatusNote } from "@/components/data-status-note";
import { EChartPanel } from "@/components/charts/echart-panel";
import { StockVisitTracker } from "@/components/stock-visit-tracker";
import { WatchlistToggle } from "@/components/watchlist-toggle";
import { buildCandlestickOption, buildRadarOption } from "@/lib/chart-options";
import { formatPercent, getRiskTone } from "@/lib/format";
import { getStockAnalysis, getStockUniverse } from "@/lib/services/stocks-service";

function renderInfoGrid(items = []) {
  return items.map((item) => (
    <div key={item.key} className="rounded-[22px] border border-slate-900/8 bg-white/84 px-4 py-4">
      <p className="text-sm text-slate-500">{item.label}</p>
      <p className="mt-3 font-display text-2xl font-semibold text-slate-950">{item.value}</p>
      {item.note ? <p className="mt-2 text-xs leading-6 text-slate-500">{item.note}</p> : null}
    </div>
  ));
}

function renderResearchCards(items = [], emptyMessage) {
  if (!items.length) {
    return (
      <div className="rounded-[22px] border border-dashed border-slate-900/10 bg-white/72 px-4 py-5 text-sm leading-7 text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return items.map((item) => (
    <a
      key={`${item.title}-${item.publishedAt ?? ""}`}
      href={item.url || "#"}
      target={item.url ? "_blank" : undefined}
      rel={item.url ? "noreferrer" : undefined}
      className="rounded-[22px] border border-slate-900/8 bg-white/84 px-4 py-4 transition hover:border-slate-900/15 hover:bg-white"
    >
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        {item.source ? <span>{item.source}</span> : null}
        {item.publishedAt ? <span>{item.publishedAt}</span> : null}
      </div>
      <p className="mt-3 font-medium leading-7 text-slate-950">{item.title}</p>
      {item.summary ? <p className="mt-2 text-sm leading-7 text-slate-600">{item.summary}</p> : null}
      {item.tags?.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {item.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </a>
  ));
}

function renderDigestList(items = [], tone = "neutral") {
  if (!items.length) {
    return (
      <div className="rounded-[18px] bg-slate-100 px-4 py-3 text-sm leading-7 text-slate-600">
        当前还没有足够线索支撑这一栏，后续会随着公告、研报和资讯接入继续补强。
      </div>
    );
  }

  const toneClass =
    tone === "positive"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "negative"
      ? "bg-rose-50 text-rose-700"
      : "bg-slate-100 text-slate-600";

  return items.map((item) => (
    <div key={item} className={`rounded-[18px] px-4 py-3 text-sm leading-7 ${toneClass}`}>
      {item}
    </div>
  ));
}

function renderSourceMatrix(items = []) {
  return items.map((item) => (
    <div key={item.key} className="rounded-[22px] border border-slate-900/8 bg-white/84 px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium text-slate-950">{item.label}</p>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{item.status}</span>
      </div>
      <p className="mt-3 text-sm text-slate-500">{item.provider}</p>
      <p className="mt-2 text-sm leading-7 text-slate-600">{item.note}</p>
    </div>
  ));
}

export async function generateStaticParams() {
  const payload = await getStockUniverse();
  const items = payload?.data?.items ?? [];

  return items.slice(0, 12).map((item) => ({
    symbol: item.symbol
  }));
}

export async function generateMetadata({ params }) {
  const { symbol } = await params;
  const payload = await getStockAnalysis(symbol, { position: 0.45 });
  const stock = payload?.data?.stock;

  return {
    title: stock ? `${stock.name} ${stock.symbol} | InvestPilot` : "个股研究页 | InvestPilot"
  };
}

export default async function StockDetailPage({ params }) {
  const { symbol } = await params;
  const payload = await getStockAnalysis(symbol, { position: 0.45 });
  const current = payload?.data;

  if (!current?.stock) {
    notFound();
  }

  const { stock, risk } = current;
  const fundamentals = stock.fundamentals ?? [];
  const basicInfo = stock.basicInfo ?? [];
  const valuationHighlights = stock.valuationHighlights ?? [];
  const financialHighlights = stock.financialHighlights ?? [];
  const announcements = stock.announcements ?? [];
  const researchReports = stock.researchReports ?? [];
  const companyProfile = stock.companyProfile ?? {};
  const industryTags = stock.industryTags ?? [];
  const researchDigest = stock.researchDigest ?? {};
  const sourceMatrix = stock.sourceMatrix ?? [];
  const eventTimeline = stock.eventTimeline ?? [];

  return (
    <PlatformShell>
      <StockVisitTracker symbol={stock.symbol} name={stock.name} />
      <div className="grid gap-6">
        <section className="strong-panel rounded-[34px] px-5 py-6 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <SignalBadge tone="neutral">{stock.market}</SignalBadge>
            <SignalBadge tone={stock.changePercent >= 0 ? "positive" : "negative"}>{formatPercent(stock.changePercent)}</SignalBadge>
            <SignalBadge tone={getRiskTone(risk.level)}>{risk.level}</SignalBadge>
            {industryTags.slice(0, 4).map((tag) => (
              <SignalBadge key={tag} tone="neutral">
                {tag}
              </SignalBadge>
            ))}
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

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr_0.9fr]">
            <div className="rounded-[24px] bg-slate-950 px-5 py-5 text-slate-50">
              <p className="text-sm text-slate-300">研究结论</p>
              <p className="mt-3 text-2xl font-semibold">{risk.actionSummary}</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">{risk.managementAdvice}</p>
            </div>
            <div className="rounded-[24px] border border-slate-900/8 bg-white/84 px-5 py-5">
              <p className="text-sm text-slate-500">风险暴露</p>
              <p className="mt-3 font-display text-4xl font-semibold text-slate-950">{risk.exposure}</p>
              <p className="mt-3 text-sm leading-7 text-slate-500">综合仓位与系统性风险后的当前暴露温度。</p>
            </div>
            <div className="rounded-[24px] border border-slate-900/8 bg-white/84 px-5 py-5">
              <p className="text-sm text-slate-500">一页式摘要</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">{researchDigest.summary ?? stock.thesis?.[0] ?? stock.summary}</p>
            </div>
          </div>

          <DataStatusNote meta={payload.meta} className="mt-4" />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.16fr_0.84fr]">
          <EChartPanel option={buildCandlestickOption(stock.priceSeries)} height={430} />

          <div className="grid gap-6">
            <EChartPanel option={buildRadarOption(stock.radarMetrics)} height={208} />

            <div className="soft-panel rounded-[28px] p-5">
              <p className="section-kicker">交易教练建议</p>
              <p className="mt-3 text-xl font-semibold text-slate-950">{risk.coachHint}</p>
              <div className="mt-4 space-y-2 text-sm leading-7 text-slate-600">
                {(stock.coachNotes ?? []).map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">
          <div className="soft-panel rounded-[30px] p-5 sm:p-6">
            <SectionHeading
              kicker="技术面与风险"
              title="量价结构与关键位"
              description="先确认趋势、量能、支撑与压力位，再决定研究结论是否足够支撑交易动作。"
            />

            <div className="mt-5 rounded-[24px] border border-slate-900/8 bg-slate-50/86 p-4">
              <p className="font-medium text-slate-950">技术面摘要</p>
              <div className="mt-3 space-y-2 text-sm leading-7 text-slate-600">
                <p>{stock.technicalView?.trend}</p>
                <p>{stock.technicalView?.volume}</p>
                <p>支撑位：{stock.technicalView?.support}</p>
                <p>压力位：{stock.technicalView?.resistance}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">{renderInfoGrid(fundamentals)}</div>

            <div className="mt-6 rounded-[24px] border border-slate-900/8 bg-white/84 p-4">
              <p className="font-medium text-slate-950">研究逻辑</p>
              <div className="mt-3 space-y-2 text-sm leading-7 text-slate-600">
                {(stock.thesis ?? []).map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="soft-panel rounded-[30px] p-5 sm:p-6">
            <SectionHeading
              kicker="风险评估"
              title="风险来源拆解"
              description="不只给风险等级，也拆开每个风险因子的分值、含义与管理建议。"
            />
            <div className="mt-5 grid gap-4">
              {(risk.factors ?? []).map((item) => (
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

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="soft-panel rounded-[30px] p-5 sm:p-6">
            <SectionHeading
              kicker="公司概览"
              title="基础信息与业务画像"
              description="补齐行业标签、上市板块、主营业务与研究覆盖状态，减少“只看价格”的误判。"
            />

            <div className="mt-5 grid gap-3 sm:grid-cols-2">{renderInfoGrid(basicInfo)}</div>

            <div className="mt-6 rounded-[24px] border border-slate-900/8 bg-white/84 p-4">
              <p className="font-medium text-slate-950">主营业务</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">{companyProfile.mainBusiness || "主营业务待补充"}</p>
              {companyProfile.productTypes?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {companyProfile.productTypes.map((item) => (
                    <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                      {item}
                    </span>
                  ))}
                </div>
              ) : null}
              {companyProfile.businessScope ? <p className="mt-4 text-sm leading-7 text-slate-500">{companyProfile.businessScope}</p> : null}
            </div>
          </div>

          <div className="soft-panel rounded-[30px] p-5 sm:p-6">
            <SectionHeading
              kicker="估值与财报"
              title="估值口径与财务摘要"
              description="围绕市值、PB、EPS、营收、利润和现金流给出可用于研究判断的基础信息。"
            />

            <div className="mt-5 grid gap-3 sm:grid-cols-2">{renderInfoGrid(valuationHighlights)}</div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">{renderInfoGrid(financialHighlights)}</div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="soft-panel rounded-[30px] p-5 sm:p-6">
            <SectionHeading
              kicker="研究摘要"
              title="一页式研究结论"
              description="把公告、研报、资讯与财务口径压缩成更适合研究复盘的中文结论。"
            />

            <div className="mt-5 rounded-[24px] border border-slate-900/8 bg-white/84 p-4">
              <p className="font-medium text-slate-950">当前结论</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">{researchDigest.summary ?? stock.summary}</p>
            </div>

            <div className="mt-5">
              <p className="text-sm font-medium text-slate-950">积极线索</p>
              <div className="mt-3 grid gap-3">{renderDigestList(researchDigest.positives ?? [], "positive")}</div>
            </div>

            <div className="mt-5">
              <p className="text-sm font-medium text-slate-950">风险关注</p>
              <div className="mt-3 grid gap-3">{renderDigestList(researchDigest.watchpoints ?? [], "negative")}</div>
            </div>

            <div className="mt-5">
              <p className="text-sm font-medium text-slate-950">下一步研究</p>
              <div className="mt-3 grid gap-3">{renderDigestList(researchDigest.nextSteps ?? [])}</div>
            </div>
          </div>

          <div className="soft-panel rounded-[30px] p-5 sm:p-6">
            <SectionHeading
              kicker="数据源"
              title="研究数据覆盖状态"
              description="明确当前页面哪些口径已接入、哪些仍在补齐，减少误把模板页当正式结论的风险。"
            />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">{renderSourceMatrix(sourceMatrix)}</div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <div className="soft-panel rounded-[30px] p-5 sm:p-6">
            <SectionHeading
              kicker="公告"
              title="最新公司公告"
              description="优先展示最近公告入口，方便继续核对原文。"
            />
            <div className="mt-5 grid gap-3">
              {renderResearchCards(announcements, "当前尚未获取到稳定公告结果，后续会继续扩充公告源。")}
            </div>
          </div>

          <div className="soft-panel rounded-[30px] p-5 sm:p-6">
            <SectionHeading
              kicker="研报"
              title="机构观点摘要"
              description="提取最近券商或机构观点，便于快速把握评级与核心判断。"
            />
            <div className="mt-5 grid gap-3">
              {renderResearchCards(researchReports, "当前尚未获取到稳定研报结果，后续会继续补强机构研究链路。")}
            </div>
          </div>

          <div className="soft-panel rounded-[30px] p-5 sm:p-6">
            <SectionHeading
              kicker="事件时间线"
              title="公告、研报与资讯联动"
              description="把个股最近的正式公告、机构观点与新闻线索放进同一条研究时间线里。"
            />
            <div className="mt-5 grid gap-3">
              {renderResearchCards(eventTimeline.length ? eventTimeline : stock.news ?? [], "当前还没有可展示的事件时间线，后续会继续补强资讯聚合链路。")}
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
