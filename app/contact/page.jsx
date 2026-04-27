import { ContentPage } from "@/components/content-page";
import { contactChannels } from "@/lib/site";

export const metadata = {
  title: "联系我们"
};

export default function ContactPage() {
  return (
    <ContentPage
      kicker="联系我们"
      title="欢迎反馈问题、纠错与合作需求"
      description="如果你在使用过程中发现数据错误、页面问题、搜索异常，或者希望沟通产品合作与数据合作，可以通过以下方式联系。"
      aside={
        <section className="soft-panel rounded-[30px] p-5 sm:p-6">
          <p className="section-kicker">反馈建议</p>
          <div className="mt-4 grid gap-3 text-sm leading-7 text-slate-600">
            <div className="rounded-[20px] border border-slate-900/8 bg-white/84 px-4 py-4">如果是具体页面或具体股票问题，建议附上股票代码、页面链接和异常描述。</div>
            <div className="rounded-[20px] border border-slate-900/8 bg-white/84 px-4 py-4">如果是数据口径问题，建议说明你认为异常的字段、时间点和参考来源。</div>
          </div>
        </section>
      }
    >
      {contactChannels.map((item) => (
        <div key={item.label} className="rounded-[24px] border border-slate-900/8 bg-white/84 p-5">
          <p className="font-medium text-slate-950">{item.label}</p>
          <p className="mt-3 text-base text-slate-600">{item.value}</p>
        </div>
      ))}
    </ContentPage>
  );
}
