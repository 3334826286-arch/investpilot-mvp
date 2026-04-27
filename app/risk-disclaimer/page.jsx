import { ContentPage } from "@/components/content-page";

export const metadata = {
  title: "风险免责声明"
};

export default function RiskDisclaimerPage() {
  return (
    <ContentPage
      kicker="风险免责声明"
      title="研究辅助工具不等于投资建议"
      description="这一页用于明确平台边界：InvestPilot 可以帮助你组织研究和识别风险，但不能替代用户做最终投资决策。"
      aside={
        <section className="soft-panel rounded-[30px] p-5 sm:p-6">
          <p className="section-kicker">你最需要先知道</p>
          <div className="mt-4 grid gap-3 text-sm leading-7 text-slate-600">
            <div className="rounded-[20px] border border-slate-900/8 bg-white/84 px-4 py-4">平台不是喊单工具，也不会给出收益承诺。</div>
            <div className="rounded-[20px] border border-slate-900/8 bg-white/84 px-4 py-4">页面中的风险评分和研究结论仅用于辅助判断，不应被直接视为买卖指令。</div>
            <div className="rounded-[20px] border border-slate-900/8 bg-white/84 px-4 py-4">实际决策前，仍应结合公告、财报、流动性和个人风险承受能力独立判断。</div>
          </div>
        </section>
      }
    >
      <div className="rounded-[24px] border border-slate-900/8 bg-white/84 p-5">
        <p className="font-medium text-slate-950">1. 市场风险</p>
        <p className="mt-3">
          证券、基金、期货、期权、数字资产及其他金融产品均存在价格波动风险。市场环境、宏观变量、政策变化、流动性收缩和情绪波动都可能导致损失。
        </p>
      </div>
      <div className="rounded-[24px] border border-slate-900/8 bg-white/84 p-5">
        <p className="font-medium text-slate-950">2. 数据风险</p>
        <p className="mt-3">
          平台依赖第三方公开数据源、公告源、新闻源和研报源。任何数据延迟、缺失、错误、回退或字段调整，都可能影响页面展示与研究结论。
        </p>
      </div>
      <div className="rounded-[24px] border border-slate-900/8 bg-white/84 p-5">
        <p className="font-medium text-slate-950">3. 结论风险</p>
        <p className="mt-3">
          平台中的分析、摘要、评分、标签、结论和建议语句仅用于帮助用户提高研究效率，不能保证正确性、完整性或适用于你的账户、期限、仓位和风险承受能力。
        </p>
      </div>
      <div className="rounded-[24px] border border-slate-900/8 bg-white/84 p-5">
        <p className="font-medium text-slate-950">4. 决策责任</p>
        <p className="mt-3">
          所有投资决策均应由用户独立作出并自行承担结果。若需要正式投资建议，请寻求合规持牌机构或专业顾问服务。
        </p>
      </div>
    </ContentPage>
  );
}
