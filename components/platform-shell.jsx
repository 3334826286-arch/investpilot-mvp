import Link from "next/link";
import { TopNav } from "@/components/top-nav";

export function PlatformShell({ children }) {
  return (
    <div className="relative min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        <header className="reveal strong-panel rounded-[28px] px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Link href="/" className="inline-flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
                  IP
                </span>
                <div>
                  <p className="font-display text-2xl font-semibold text-slate-950">InvestPilot</p>
                  <p className="mt-1 text-sm text-slate-500">中文投资分析与决策辅助平台</p>
                </div>
              </Link>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="signal-pill signal-neutral">A 股优先</span>
              <span className="signal-pill signal-positive">前后端联调 MVP</span>
              <span className="signal-pill signal-warning">支持真实接口与本地兜底</span>
            </div>
          </div>
        </header>

        <TopNav />

        <main className="flex-1 py-6">{children}</main>

        <footer className="mt-4 rounded-[24px] border border-slate-900/8 bg-white/62 px-5 py-4 text-sm leading-6 text-slate-500 backdrop-blur-sm">
          免责声明：本平台用于投资研究辅助与信息整理，不构成任何个股推荐、收益承诺或投资建议。实际决策前请结合公告、财报、市场环境与个人风险承受能力综合判断。
        </footer>
      </div>
    </div>
  );
}
