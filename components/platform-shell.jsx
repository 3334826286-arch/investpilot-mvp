import Link from "next/link";
import { TopNav } from "@/components/top-nav";
import { legalNavigation, productNavigation, siteConfig } from "@/lib/site";

export function PlatformShell({ children }) {
  return (
    <div className="relative min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        <header className="reveal strong-panel rounded-[30px] px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <Link href="/" className="inline-flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
                  {siteConfig.shortName}
                </span>
                <div>
                  <p className="font-display text-2xl font-semibold text-slate-950">{siteConfig.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{siteConfig.title}</p>
                </div>
              </Link>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">{siteConfig.description}</p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="signal-pill signal-positive">游客可直接使用</span>
              <span className="signal-pill signal-neutral">不强制登录</span>
              <span className="signal-pill signal-warning">研究辅助工具</span>
            </div>
          </div>
        </header>

        <TopNav />

        <main className="flex-1 py-6">{children}</main>

        <footer className="mt-4 soft-panel rounded-[28px] px-5 py-5 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr_0.9fr]">
            <div>
              <p className="font-display text-xl font-semibold text-slate-950">{siteConfig.name}</p>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                面向中文用户的开放式投资研究平台。产品重点在于帮助用户理解市场、整理研究信息、识别风险与提升研究效率，而不是替代用户做投资决策。
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-950">产品与帮助</p>
              <div className="mt-3 grid gap-2 text-sm text-slate-600">
                {productNavigation.map((item) => (
                  <Link key={item.href} href={item.href} className="hover:text-slate-950">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-950">合规与说明</p>
              <div className="mt-3 grid gap-2 text-sm text-slate-600">
                {legalNavigation.map((item) => (
                  <Link key={item.href} href={item.href} className="hover:text-slate-950">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[22px] border border-slate-900/8 bg-white/78 px-4 py-4 text-sm leading-7 text-slate-500">
            风险提示：本平台用于投资研究辅助、公开信息整理和风险分析参考，不构成任何证券、基金、期货或其他金融产品的投资建议、收益承诺或买卖指令。使用前请结合公告、财报、市场环境和个人风险承受能力独立判断。
          </div>
        </footer>
      </div>
    </div>
  );
}
