export function SectionHeading({ kicker, title, description, action }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        {kicker ? <p className="section-kicker">{kicker}</p> : null}
        <h2 className="mt-2 font-display text-2xl font-semibold text-slate-950 sm:text-3xl">{title}</h2>
        {description ? <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
