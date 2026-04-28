"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] text-slate-900">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-10">
          <div className="w-full rounded-[32px] border border-slate-900/8 bg-white/94 p-8 shadow-[0_24px_64px_rgba(15,23,42,0.10)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">页面恢复</p>
            <h1 className="mt-3 text-3xl font-semibold">页面刚刚加载失败了</h1>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              这通常是部署切换、脚本缓存或临时网络异常导致的页面版本不一致。你可以先尝试重新加载当前页面；如果仍然异常，再回到首页继续使用。
            </p>

            {error?.message ? (
              <div className="mt-5 rounded-[20px] border border-slate-900/8 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                技术信息：{error.message}
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => reset()}
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white"
              >
                重新加载当前页面
              </button>
              <button
                type="button"
                onClick={() => window.location.assign("/")}
                className="rounded-full border border-slate-900/12 bg-white px-5 py-3 text-sm font-medium text-slate-700"
              >
                返回首页
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-full border border-slate-900/12 bg-white px-5 py-3 text-sm font-medium text-slate-700"
              >
                强制刷新
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
