import { ContentPage } from "@/components/content-page";

export const metadata = {
  title: "服务条款"
};

export default function TermsPage() {
  return (
    <ContentPage
      kicker="服务条款"
      title="公开使用前的基础服务约定"
      description="为了让游客也能顺畅使用主要功能，我们尽量降低使用门槛；同时也需要清楚说明平台边界、使用规范与责任范围。"
      aside={
        <section className="soft-panel rounded-[30px] p-5 sm:p-6">
          <p className="section-kicker">适用范围</p>
          <div className="mt-4 grid gap-3 text-sm leading-7 text-slate-600">
            <div className="rounded-[20px] border border-slate-900/8 bg-white/84 px-4 py-4">市场总览、个股研究、研究工作台、文档提炼和游客自选股。</div>
            <div className="rounded-[20px] border border-slate-900/8 bg-white/84 px-4 py-4">产品仍会持续迭代，部分数据源、字段和显示结构可能调整。</div>
          </div>
        </section>
      }
    >
      <div className="rounded-[24px] border border-slate-900/8 bg-white/84 p-5">
        <p className="font-medium text-slate-950">1. 服务性质</p>
        <p className="mt-3">
          InvestPilot 是一个投资研究与决策辅助平台，提供市场信息组织、研究资料检索、文档提炼和风险辅助判断。平台不提供证券经纪、投资顾问、资产管理或代客交易服务。
        </p>
      </div>
      <div className="rounded-[24px] border border-slate-900/8 bg-white/84 p-5">
        <p className="font-medium text-slate-950">2. 使用规则</p>
        <p className="mt-3">
          用户应合法、合规、善意地使用平台功能，不得将平台用于爬取破坏、恶意刷量、非法荐股、误导传播或任何违反适用法律法规的行为。
        </p>
      </div>
      <div className="rounded-[24px] border border-slate-900/8 bg-white/84 p-5">
        <p className="font-medium text-slate-950">3. 数据与内容说明</p>
        <p className="mt-3">
          平台会尽量标注数据来源、回退状态和研究口径。对于尚未接入完整正式数据链路的部分，我们会通过页面提示说明，而不是默认为完整实时结论。
        </p>
      </div>
      <div className="rounded-[24px] border border-slate-900/8 bg-white/84 p-5">
        <p className="font-medium text-slate-950">4. 责任边界</p>
        <p className="mt-3">
          用户应基于自身判断使用平台内容。因市场波动、数据延迟、第三方数据源异常、网络问题或用户误用而产生的损失，平台不承担投资结果责任。
        </p>
      </div>
    </ContentPage>
  );
}
