import Link from "next/link";
import { ContentPage } from "@/components/content-page";
import { homepageCapabilities, homepageScenarios } from "@/lib/site";

export const metadata = {
  title: "关于产品"
};

export default function AboutPage() {
  return (
    <ContentPage
      kicker="关于 InvestPilot"
      title="一个面向真实用户开放使用的中文投资研究平台"
      description="InvestPilot 的目标不是替代用户做决策，而是帮助用户更快理解市场、组织研究资料、识别风险来源，并把碎片化信息整理成可复用的研究结论。"
      aside={
        <>
          <section className="soft-panel rounded-[30px] p-5 sm:p-6">
            <p className="section-kicker">适用用户</p>
            <div className="mt-4 grid gap-3">
              {homepageScenarios.map((item) => (
                <div key={item} className="rounded-[20px] border border-slate-900/8 bg-white/84 px-4 py-4 text-sm leading-7 text-slate-600">
                  {item}
                </div>
              ))}
            </div>
          </section>
          <section className="soft-panel rounded-[30px] p-5 sm:p-6">
            <p className="section-kicker">核心入口</p>
            <div className="mt-4 grid gap-3">
              {homepageCapabilities.slice(0, 4).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-[20px] border border-slate-900/8 bg-white/84 px-4 py-4 text-sm transition hover:border-slate-900/16"
                >
                  <p className="font-medium text-slate-950">{item.title}</p>
                  <p className="mt-2 leading-7 text-slate-600">{item.description}</p>
                </Link>
              ))}
            </div>
          </section>
        </>
      }
    >
      <div className="rounded-[24px] border border-slate-900/8 bg-white/84 p-5">
        <p className="font-medium text-slate-950">产品定位</p>
        <p className="mt-3">
          我们把 InvestPilot 定位为“中文投资研究与决策辅助平台”，而不是资讯门户、喊单工具或封闭式会员系统。产品优先追求开放使用、低门槛体验和长期可迭代的数据研究能力。
        </p>
      </div>
      <div className="rounded-[24px] border border-slate-900/8 bg-white/84 p-5">
        <p className="font-medium text-slate-950">产品原则</p>
        <ul className="mt-3 space-y-2">
          <li>游客优先：不强制登录，主要功能默认向游客开放。</li>
          <li>研究优先：围绕市场、个股、公告、研报、文档构建完整研究链路。</li>
          <li>透明优先：页面尽量标明数据来源、口径和回退状态。</li>
          <li>风险优先：尽量先解释风险，再讨论机会。</li>
        </ul>
      </div>
      <div className="rounded-[24px] border border-slate-900/8 bg-white/84 p-5">
        <p className="font-medium text-slate-950">当前阶段</p>
        <p className="mt-3">
          当前版本正在从“可用测试版”升级为“正式公测版”。产品已经具备市场总览、个股研究、情报搜索、文档提炼与游客自选等基础能力，接下来会继续补齐更稳定的数据链路、正式页面、产品体验和合规表达。
        </p>
      </div>
    </ContentPage>
  );
}
