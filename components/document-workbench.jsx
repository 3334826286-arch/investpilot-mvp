"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { DataStatusNote } from "@/components/data-status-note";

const SAMPLE_TEXT = `某锂电龙头 2026 年一季度实现营业收入 312.4 亿元，同比增长 18.9%，归母净利润 42.1 亿元，同比增长 21.3%。储能业务毛利率环比提升 1.8 个百分点，海外订单恢复明显，经营现金流由负转正。公司表示，二季度仍将维持较高研发投入，并继续推进海外客户拓展。需要关注的风险包括：碳酸锂价格波动可能影响盈利弹性，海外需求节奏仍需进一步验证，若行业价格战重新加剧，估值修复空间可能受到压制。`;

export function DocumentWorkbench({ initialResult, initialMeta, initialDraft = null }) {
  const [text, setText] = useState(initialDraft?.text ?? "");
  const [file, setFile] = useState(null);
  const [sourceName, setSourceName] = useState(initialDraft?.sourceName ?? "");
  const [sourceType, setSourceType] = useState(initialDraft?.sourceType ?? "text");
  const [result, setResult] = useState(initialResult);
  const [meta, setMeta] = useState(initialMeta);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const autoSubmittedRef = useRef(false);

  function requestSummary({ nextText, nextFile = null, nextSourceName = "", nextSourceType = "text" }) {
    setError("");

    const formData = new FormData();
    formData.append("text", nextText);
    formData.append("source_name", nextSourceName);
    formData.append("source_type", nextSourceType);
    if (nextFile) {
      formData.append("file", nextFile);
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/v1/documents/summarize", {
          method: "POST",
          body: formData
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.meta?.errorMessage || "文档提炼请求失败。");
        }

        setResult(payload.data);
        setMeta(payload.meta);
      } catch (nextError) {
        setError(nextError.message);
      }
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    requestSummary({
      nextText: text,
      nextFile: file,
      nextSourceName: sourceName,
      nextSourceType: sourceType
    });
  }

  useEffect(() => {
    if (!initialDraft?.autoSubmit || autoSubmittedRef.current) {
      return;
    }

    if (!initialDraft?.text?.trim()) {
      return;
    }

    autoSubmittedRef.current = true;
    requestSummary({
      nextText: initialDraft.text,
      nextSourceName: initialDraft.sourceName ?? "搜索情报",
      nextSourceType: initialDraft.sourceType ?? "search"
    });
  }, [initialDraft]);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
      <section className="soft-panel rounded-[30px] p-5 sm:p-6">
        <p className="section-kicker">输入方式</p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-slate-950">上传文档、粘贴正文，或承接搜索结果</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          当前支持 `txt`、`md`、`csv`、`json`、`html`、`pdf`、`docx`。如果你从公告、研报或搜索结果跳转过来，也可以直接在这里继续做结构化提炼。
        </p>

        <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
          <input
            value={sourceName}
            onChange={(event) => setSourceName(event.target.value)}
            placeholder="来源名称，例如：宁德时代公告、交银国际研报、搜索情报"
            className="h-12 rounded-[20px] border border-slate-900/10 bg-white px-4 text-sm outline-none transition focus:border-slate-900/30 focus:ring-4 focus:ring-slate-900/5"
          />

          <select
            value={sourceType}
            onChange={(event) => setSourceType(event.target.value)}
            className="h-12 rounded-[20px] border border-slate-900/10 bg-white px-4 text-sm outline-none transition focus:border-slate-900/30 focus:ring-4 focus:ring-slate-900/5"
          >
            <option value="text">粘贴文本</option>
            <option value="announcement">公告</option>
            <option value="research">研报</option>
            <option value="news">新闻</option>
            <option value="search">搜索情报</option>
          </select>

          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={12}
            placeholder="把公告、财报、会议纪要、研报正文粘贴到这里"
            className="rounded-[24px] border border-slate-900/10 bg-white px-4 py-4 text-sm leading-7 outline-none transition focus:border-slate-900/30 focus:ring-4 focus:ring-slate-900/5"
          />

          <label className="rounded-[24px] border border-dashed border-slate-300 bg-white/72 px-4 py-4 text-sm text-slate-500">
            <span className="block font-medium text-slate-900">上传文档</span>
            <span className="mt-1 block">系统会优先提取正文，再输出结构化的投资研究摘要。</span>
            <input
              type="file"
              accept=".txt,.md,.csv,.json,.html,.htm,.pdf,.docx"
              className="mt-4 block w-full text-sm"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white shadow-[0_12px_28px_rgba(15,23,42,0.16)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "正在提炼..." : "生成摘要"}
            </button>
            <button
              type="button"
              className="rounded-full border border-slate-900/10 bg-white px-5 py-3 text-sm text-slate-700"
              onClick={() => {
                setText(SAMPLE_TEXT);
                setSourceName("示例财务材料");
                setSourceType("research");
                setFile(null);
              }}
            >
              填充示例文本
            </button>
          </div>
        </form>

        {file ? <p className="mt-4 text-sm text-slate-500">当前文件：{file.name}</p> : null}
        {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
      </section>

      <section className="soft-panel rounded-[30px] p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="section-kicker">提炼结果</p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-slate-950">{result.title}</h2>
            <p className="mt-2 text-sm text-slate-500">
              来源：{result.sourceName} · 字数 {result.characterCount}
            </p>
          </div>
          <DataStatusNote meta={meta} />
        </div>

        <div className="mt-5 rounded-[24px] border border-slate-900/8 bg-white/84 p-4">
          <p className="font-medium text-slate-950">核心结论</p>
          <p className="mt-3 text-sm leading-7 text-slate-600">{result.summary}</p>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div className="rounded-[24px] border border-slate-900/8 bg-white/84 p-4">
            <p className="font-medium text-slate-950">核心亮点</p>
            <div className="mt-3 space-y-2 text-sm leading-7 text-slate-600">
              {(result.highlights ?? []).map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-900/8 bg-white/84 p-4">
            <p className="font-medium text-slate-950">风险提示</p>
            <div className="mt-3 space-y-2 text-sm leading-7 text-slate-600">
              {(result.risks ?? []).map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-[24px] border border-slate-900/8 bg-slate-50/86 p-4">
          <p className="font-medium text-slate-950">关键数据</p>
          <div className="mt-3 space-y-2 text-sm leading-7 text-slate-600">
            {result.keyData?.length ? (
              result.keyData.map((item) => <p key={item}>{item}</p>)
            ) : (
              <p>当前文本未提取到明确数值，建议继续补充财务、经营与订单细节。</p>
            )}
          </div>
        </div>

        <div className="mt-5 rounded-[24px] border border-slate-900/8 bg-white/84 p-4">
          <p className="font-medium text-slate-950">机构观点摘要</p>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {result.institutionSummary || "当前先给出结构化中文提炼，后续可继续接入券商观点与机构研报聚合。"}
          </p>
        </div>

        <div className="mt-5 rounded-[24px] border border-slate-900/8 bg-slate-950 px-4 py-4 text-sm leading-7 text-slate-100">
          一页式结论：{result.conclusion}
        </div>
      </section>
    </div>
  );
}
