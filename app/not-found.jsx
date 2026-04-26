import Link from "next/link";
import { PlatformShell } from "@/components/platform-shell";

export default function NotFound() {
  return (
    <PlatformShell>
      <div className="strong-panel rounded-[34px] px-5 py-10 text-center sm:px-6">
        <p className="section-kicker">未找到内容</p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-slate-950">这个页面还没有对应的数据</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          你可以先回到首页、市场检测或风险评估模块继续查看其他内容。
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white">
            返回首页
          </Link>
          <Link href="/risk" className="rounded-full border border-slate-900/10 bg-white px-5 py-3 text-sm text-slate-700">
            进入风险评估
          </Link>
        </div>
      </div>
    </PlatformShell>
  );
}
