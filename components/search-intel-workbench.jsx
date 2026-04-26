"use client";

import Link from "next/link";
import { startTransition, useMemo, useState } from "react";
import { DataStatusNote } from "@/components/data-status-note";

function buildSearchUrl(query, limit = 6) {
  const search = new URLSearchParams();
  if (query) {
    search.set("q", query);
  }
  search.set("limit", String(limit));
  return `/api/v1/search/intel?${search.toString()}`;
}

function buildDocumentHref(item) {
  const search = new URLSearchParams({
    text: item.extractText || `${item.title}\n${item.summary}`,
    sourceName: item.source || "搜索情报",
    sourceType: item.type || "search",
    autoSubmit: "1"
  });
  return `/documents?${search.toString()}`;
}

function signalTone(signal) {
  if (signal === "利好") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (signal === "利空") {
    return "bg-rose-50 text-rose-700 border-rose-200";
  }
  return "bg-slate-50 text-slate-600 border-slate-200";
}

function sortItems(items, sortMode) {
  if (sortMode !== "time_desc") {
    return items;
  }

  return [...items].sort((left, right) => {
    const leftTime = left.publishedAt ? Date.parse(left.publishedAt.replace(" ", "T")) || 0 : 0;
    const rightTime = right.publishedAt ? Date.parse(right.publishedAt.replace(" ", "T")) || 0 : 0;
    return rightTime - leftTime;
  });
}

function visibleSections(data, activeTab, sortMode) {
  const entries = Object.entries(data.sections).map(([key, section]) => [
    key,
    {
      ...section,
      items: sortItems(section.items, sortMode)
    }
  ]);

  if (activeTab !== "all") {
    return entries.filter(([key]) => key === activeTab);
  }

  if (!data.query.hasQuery) {
    return entries.filter(([key, section]) => key === "digest" && section.count);
  }

  const primaryEntries = entries.filter(([key]) => key !== "digest");
  const nonEmptyPrimaryEntries = primaryEntries.filter(([, section]) => section.count);

  if (nonEmptyPrimaryEntries.length) {
    return nonEmptyPrimaryEntries;
  }

  return entries.filter(([, section]) => section.count);
}

function sectionDescription(sectionKey) {
  if (sectionKey === "news") {
    return "优先看事件驱动、市场解读与主流媒体增量信息。";
  }
  if (sectionKey === "announcements") {
    return "公告更适合核对正式披露口径，判断是否涉及业绩、融资、股权或风险提示。";
  }
  if (sectionKey === "research") {
    return "研报更适合快速把握机构结论、评级变化与行业视角。";
  }
  return "没有输入个股关键词时，会优先展示市场级情报、宏观事件与重点财报日历。";
}

export function SearchIntelWorkbench({ initialPayload }) {
  const [draftQuery, setDraftQuery] = useState(initialPayload?.data?.query?.keyword ?? "");
  const [activeTab, setActiveTab] = useState("all");
  const [sortMode, setSortMode] = useState("time_desc");
  const [payload, setPayload] = useState(initialPayload);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const data = payload?.data;

  async function loadQuery(nextQuery) {
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(buildSearchUrl(nextQuery), {
        cache: "no-store"
      });
      const nextPayload = await response.json();

      if (!response.ok) {
        throw new Error(nextPayload?.meta?.errorMessage || "情报搜索接口返回异常。");
      }

      startTransition(() => {
        setPayload(nextPayload);
        setActiveTab("all");
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      await loadQuery(draftQuery.trim());
    } catch (nextError) {
      setError(nextError.message);
    }
  }

  async function handleExampleClick(example) {
    setDraftQuery(example);

    try {
      await loadQuery(example);
    } catch (nextError) {
      setError(nextError.message);
    }
  }

  async function handleCandidateClick(symbol) {
    setDraftQuery(symbol);

    try {
      await loadQuery(symbol);
    } catch (nextError) {
      setError(nextError.message);
    }
  }

  const sections = useMemo(() => (data ? visibleSections(data, activeTab, sortMode) : []), [data, activeTab, sortMode]);

  if (!data) {
    return null;
  }

  return (
    <div className="grid gap-6">
      <section className="strong-panel rounded-[34px] px-5 py-6 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="section-kicker">情报搜索</p>
            <h1 className="mt-2 font-display text-4xl font-semibold text-slate-950">{data.summary.title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{data.summary.description}</p>
          </div>
          <div className="text-sm text-slate-500">更新于 {data.updatedAt}</div>
        </div>

        <form className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
          <input
            value={draftQuery}
            onChange={(event) => setDraftQuery(event.target.value)}
            placeholder="输入股票代码、公司简称或拼音缩写，例如：300750、宁德时代、ndsd、zsyh"
            className="h-12 flex-1 rounded-full border border-slate-900/10 bg-white px-4 text-sm outline-none transition focus:border-slate-900/30 focus:ring-4 focus:ring-slate-900/5"
          />
          <button
            type="submit"
            className="h-12 rounded-full bg-slate-950 px-5 text-sm font-medium text-white shadow-[0_12px_28px_rgba(15,23,42,0.16)] transition hover:-translate-y-0.5"
          >
            {isLoading ? "搜索中..." : "搜索情报"}
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {data.guide.exampleQueries.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleExampleClick(item)}
              className="rounded-full border border-slate-900/10 bg-white px-3 py-2 text-sm text-slate-600 transition hover:border-slate-900/20 hover:text-slate-950"
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
            利好 {data.summary.signalBreakdown.positive}
          </span>
          <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-rose-700">
            利空 {data.summary.signalBreakdown.negative}
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600">
            中性 {data.summary.signalBreakdown.neutral}
          </span>
        </div>

        {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
        <DataStatusNote meta={payload.meta} className="mt-4" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.96fr_1.04fr]">
        <div className="soft-panel rounded-[30px] p-5 sm:p-6">
          <p className="section-kicker">搜索说明</p>
          <div className="mt-4 grid gap-3">
            {data.guide.tips.map((item) => (
              <div key={item} className="rounded-[22px] border border-slate-900/8 bg-white/86 px-4 py-4 text-sm leading-7 text-slate-600">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="soft-panel rounded-[30px] p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="section-kicker">匹配结果</p>
            <label className="flex items-center gap-2 text-sm text-slate-500">
              <span>排序</span>
              <select
                value={sortMode}
                onChange={(event) => setSortMode(event.target.value)}
                className="h-10 rounded-full border border-slate-900/10 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-slate-900/30 focus:ring-4 focus:ring-slate-900/5"
              >
                <option value="time_desc">时间优先</option>
                <option value="relevance">相关度优先</option>
              </select>
            </label>
          </div>

          {data.resolved ? (
            <div className="mt-4 rounded-[24px] border border-slate-900/8 bg-white/86 px-4 py-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xl font-semibold text-slate-950">
                    {data.resolved.name} <span className="text-sm text-slate-400">{data.resolved.symbol}</span>
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    {data.resolved.market} · 命中方式 {data.resolved.matchType === "pinyin" ? "拼音 / 缩写" : data.resolved.matchType === "symbol" ? "代码" : "简称"}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    当前已聚合 {data.summary.totalHits} 条个股相关情报，可继续进入个股详情页查看更完整的风险、走势与中文分析结论。
                  </p>
                </div>
                <Link
                  href={`/stock/${data.resolved.symbol}`}
                  className="rounded-full border border-slate-900/10 bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5"
                >
                  查看个股详情
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-[24px] border border-dashed border-slate-900/12 bg-white/72 px-4 py-4 text-sm leading-7 text-slate-600">
              当前还没有锁定明确个股。你可以输入股票代码、完整简称或拼音缩写，系统会优先返回更稳定的结果。
            </div>
          )}

          {data.candidates.length > 1 ? (
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-950">可切换的候选股票</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {data.candidates.map((item) => (
                  <button
                    key={item.symbol}
                    type="button"
                    onClick={() => handleCandidateClick(item.symbol)}
                    className="rounded-full border border-slate-900/10 bg-white px-3 py-2 text-sm text-slate-600 transition hover:border-slate-900/20 hover:text-slate-950"
                  >
                    {item.name} {item.symbol}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="soft-panel rounded-[30px] p-5 sm:p-6">
        <div className="flex flex-wrap gap-2">
          {data.tabs.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveTab(item.key)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                activeTab === item.key
                  ? "bg-slate-950 text-white shadow-[0_12px_28px_rgba(15,23,42,0.16)]"
                  : "border border-slate-900/10 bg-white text-slate-600 hover:border-slate-900/20 hover:text-slate-950"
              }`}
            >
              {item.label} {item.count ? `· ${item.count}` : ""}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-4">
        {sections.length ? (
          sections.map(([sectionKey, section]) => (
            <article key={sectionKey} className="soft-panel rounded-[28px] p-5 sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="section-kicker">{section.label}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">{section.count} 条结果</h2>
                  <p className="mt-2 text-sm text-slate-500">{sectionDescription(sectionKey)}</p>
                </div>
              </div>

              {section.items.length ? (
                <div className="mt-5 grid gap-3">
                  {section.items.map((item) => (
                    <div key={item.id} className="rounded-[24px] border border-slate-900/8 bg-white/86 px-4 py-4">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-base font-medium text-slate-950">{item.title}</p>
                            <span className={`rounded-full border px-3 py-1 text-xs ${signalTone(item.signal)}`}>{item.signal}</span>
                          </div>
                          <p className="mt-2 text-sm leading-7 text-slate-600">{item.summary}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {(item.tags ?? []).map((tag) => (
                              <span
                                key={`${item.id}-${tag}`}
                                className="rounded-full border border-slate-900/8 bg-slate-50 px-3 py-1 text-xs text-slate-500"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col items-start gap-2 text-sm text-slate-500 lg:items-end">
                          <span>{item.source}</span>
                          {item.publishedAt ? <span>{item.publishedAt}</span> : null}
                          <div className="flex flex-wrap gap-2 lg:justify-end">
                            {item.url ? (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-full border border-slate-900/10 px-3 py-1 text-slate-700 transition hover:border-slate-900/20 hover:text-slate-950"
                              >
                                查看原文
                              </a>
                            ) : null}
                            <Link
                              href={buildDocumentHref(item)}
                              className="rounded-full border border-slate-900/10 bg-slate-950 px-3 py-1 text-white transition hover:-translate-y-0.5"
                            >
                              送去提炼
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-[24px] border border-dashed border-slate-900/12 bg-white/72 px-4 py-4 text-sm leading-7 text-slate-600">
                  {section.emptyMessage}
                </div>
              )}
            </article>
          ))
        ) : (
          <div className="soft-panel rounded-[28px] p-5 text-sm leading-7 text-slate-600">
            当前分类下还没有可展示的结果。你可以切换分类，或换一个更具体的股票代码 / 公司简称继续搜索。
          </div>
        )}
      </section>
    </div>
  );
}
