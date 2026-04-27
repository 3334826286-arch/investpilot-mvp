import { ContentPage } from "@/components/content-page";
import { faqEntries } from "@/lib/site";

export const metadata = {
  title: "FAQ"
};

export default function FaqPage() {
  return (
    <ContentPage
      kicker="FAQ"
      title="使用前最常见的问题"
      description="我们优先把定位、边界、数据口径与游客使用方式说清楚，减少误解和试错成本。"
      aside={
        <section className="soft-panel rounded-[30px] p-5 sm:p-6">
          <p className="section-kicker">使用建议</p>
          <div className="mt-4 grid gap-3 text-sm leading-7 text-slate-600">
            <div className="rounded-[20px] border border-slate-900/8 bg-white/84 px-4 py-4">
              先看市场页判断环境，再进入个股页或研究工作台，会比直接看单只股票更稳。
            </div>
            <div className="rounded-[20px] border border-slate-900/8 bg-white/84 px-4 py-4">
              对公告、研报和长文档，优先使用文档提炼或情报搜索，避免只看标题做判断。
            </div>
            <div className="rounded-[20px] border border-slate-900/8 bg-white/84 px-4 py-4">
              不登录也能保存自选股和最近浏览，但这些数据默认只保存在当前浏览器里。
            </div>
          </div>
        </section>
      }
    >
      {faqEntries.map((item) => (
        <div key={item.question} className="rounded-[24px] border border-slate-900/8 bg-white/84 p-5">
          <p className="font-medium text-slate-950">{item.question}</p>
          <p className="mt-3">{item.answer}</p>
        </div>
      ))}
    </ContentPage>
  );
}
