import { PlatformShell } from "@/components/platform-shell";

export function ContentPage({ kicker, title, description, children, aside }) {
  return (
    <PlatformShell>
      <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <section className="strong-panel rounded-[34px] px-5 py-6 sm:px-6">
          <p className="section-kicker">{kicker}</p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-slate-950">{title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">{description}</p>

          <div className="prose-panel mt-8 grid gap-4 text-sm leading-7 text-slate-600">{children}</div>
        </section>

        <aside className="grid gap-6">{aside}</aside>
      </div>
    </PlatformShell>
  );
}
