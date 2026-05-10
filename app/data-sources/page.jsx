import { ContentPage } from "@/components/content-page";

export const metadata = {
  title: "数据来源说明"
};

export default function DataSourcesPage() {
  return (
    <ContentPage
      kicker="数据来源说明"
      title="把数据链路、口径和回退规则讲清楚"
      description="正式产品版不会只展示结论，也会尽量说明这些结论来自什么数据、当前处于什么状态，以及在链路波动时如何回退。"
      aside={
        <>
          <section className="soft-panel rounded-[30px] p-5 sm:p-6">
            <p className="section-kicker">当前原则</p>
            <div className="mt-4 grid gap-3 text-sm leading-7 text-slate-600">
              <div className="rounded-[20px] border border-slate-900/8 bg-white/84 px-4 py-4">
                优先使用真实后端链路，再在必要时回退到稳定兜底口径。
              </div>
              <div className="rounded-[20px] border border-slate-900/8 bg-white/84 px-4 py-4">
                页面会显示当前来源、版本、通道和回退原因，而不是把降级结果伪装成实时数据。
              </div>
              <div className="rounded-[20px] border border-slate-900/8 bg-white/84 px-4 py-4">
                所有数据都用于研究辅助，不构成投资建议或收益承诺。
              </div>
            </div>
          </section>
        </>
      }
    >
      <div className="rounded-[24px] border border-slate-900/8 bg-white/84 p-5">
        <p className="font-medium text-slate-950">市场与个股基础数据</p>
        <p className="mt-3">
          当前市场总览、个股研究、公告、研报和部分宏观口径优先通过 FastAPI 后端聚合公开数据源，并结合本地结构化目录做稳定兜底。
        </p>
      </div>

      <div className="rounded-[24px] border border-slate-900/8 bg-white/84 p-5">
        <p className="font-medium text-slate-950">主要公开数据链路</p>
        <ul className="mt-3 space-y-2">
          <li>行情、财务、公告、研报等基础链路当前以 AKShare / 东方财富公开数据口径为主。</li>
          <li>高级基础面数据预留了 Daloopa 扩展位，用于后续提升财报和估值的一致性。</li>
          <li>高级新闻资讯预留了 Dow Jones Factiva 扩展位，用于后续增强正式新闻检索能力。</li>
        </ul>
      </div>

      <div className="rounded-[24px] border border-slate-900/8 bg-white/84 p-5">
        <p className="font-medium text-slate-950">回退与降级规则</p>
        <p className="mt-3">
          当真实链路超时、不可用或字段不完整时，前端会优先保留稳定可读的结果，并通过状态条和数据说明提示“当前已降级”或“当前为兜底口径”。
        </p>
      </div>

      <div className="rounded-[24px] border border-slate-900/8 bg-white/84 p-5">
        <p className="font-medium text-slate-950">如何解读页面状态</p>
        <ul className="mt-3 space-y-2">
          <li>实时链路正常：当前页面已成功连到后端真实接口。</li>
          <li>当前已降级：后端或上游链路异常，页面回退到可读兜底结果。</li>
          <li>前端独立运行：当前站点未连到后端，仅适合结构演示，不适合依赖实时结论。</li>
        </ul>
      </div>
    </ContentPage>
  );
}
