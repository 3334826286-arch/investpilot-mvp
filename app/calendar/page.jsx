import { PlatformShell } from "@/components/platform-shell";
import { SectionHeading } from "@/components/section-heading";
import { SignalBadge } from "@/components/signal-badge";
import { DataStatusNote } from "@/components/data-status-note";
import { getImportanceTone } from "@/lib/format";
import { getCalendarFeed } from "@/lib/services/calendar-service";

export const metadata = {
  title: "财经日历"
};

function groupByDate(events) {
  return events.reduce((groups, item) => {
    const key = `${item.date} ${item.weekday}`;
    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(item);
    return groups;
  }, {});
}

export default async function CalendarPage() {
  const calendarPayload = await getCalendarFeed();
  const calendar = calendarPayload.data;
  const grouped = groupByDate(calendar.items);

  return (
    <PlatformShell>
      <div className="grid gap-6">
        <section className="strong-panel rounded-[34px] px-5 py-6 sm:px-6">
          <SectionHeading
            kicker="财经日历"
            title="把财报、宏观、解禁和政策时间点放到一个入口里"
            description="日历模块的价值不只是罗列信息，而是帮助你提前知道哪些时间点值得提高警惕、哪些事件可能改变市场节奏。"
          />
          <DataStatusNote meta={calendarPayload.meta} className="mt-4" />
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.3fr_0.7fr]">
          <div className="soft-panel rounded-[28px] p-5">
            <p className="section-kicker">筛选建议</p>
            <div className="mt-5 grid gap-3">
              {calendar.filters.map((item) => (
                <div key={item} className="rounded-full border border-slate-900/8 bg-white/84 px-4 py-3 text-sm text-slate-600">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {Object.entries(grouped).map(([date, items]) => (
              <section key={date} className="soft-panel rounded-[28px] p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-2xl font-semibold text-slate-950">{date}</h2>
                  <span className="text-sm text-slate-500">{items.length} 个事件</span>
                </div>

                <div className="mt-5 grid gap-3">
                  {items.map((item) => (
                    <article key={item.id} className="rounded-[24px] border border-slate-900/8 bg-white/84 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-slate-950">
                            {item.time} · {item.title}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">{item.type}</p>
                        </div>
                        <SignalBadge tone={getImportanceTone(item.importance)}>{item.importance}重要</SignalBadge>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{item.detail}</p>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      </div>
    </PlatformShell>
  );
}
