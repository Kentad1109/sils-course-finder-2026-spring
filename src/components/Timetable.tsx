import { useMemo, useState } from "react";
import type { Course, DayOfWeek } from "@/types/course";

const DAYS: Array<{ key: DayOfWeek; label: string }> = [
  { key: "MON", label: "Mon" },
  { key: "TUE", label: "Tues" },
  { key: "WED", label: "Wed" },
  { key: "THU", label: "Thur" },
  { key: "FRI", label: "Fri" },
  { key: "SAT", label: "Sat" },
];

const PERIODS: Array<{ period: number; time: string }> = [
  { period: 1, time: "8:50 - 10:30" },
  { period: 2, time: "10:40 - 12:20" },
  { period: 3, time: "13:10 - 14:50" },
  { period: 4, time: "15:05 - 16:45" },
  { period: 5, time: "17:00 - 18:40" },
  { period: 6, time: "18:55 - 20:35" },
];

function toCellKey(day: DayOfWeek, period: number) {
  return `${day}-${period}`;
}

function shortTitle(title: string) {
  const t = title.trim();
  if (t.length <= 44) return t;
  return `${t.slice(0, 44)}…`;
}

function areaHue(area: string) {
  const a = area.toLowerCase();
  if (a.includes("introductory")) return "bg-sky-50 border-sky-200 text-sky-900";
  if (a.includes("intermediate")) return "bg-emerald-50 border-emerald-200 text-emerald-900";
  if (a.includes("advanced")) return "bg-violet-50 border-violet-200 text-violet-900";
  if (a.includes("english")) return "bg-amber-50 border-amber-200 text-amber-900";
  if (a.includes("foreign")) return "bg-teal-50 border-teal-200 text-teal-900";
  return "bg-slate-50 border-slate-200 text-slate-900";
}

function CoursePill({ course }: { course: Course }) {
  const cls = areaHue(course.area);
  const teacher = course.instructors[0]?.nameEn ?? "";
  return (
    <div className={`rounded-xl border p-2 shadow-sm ${cls}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold text-waseda-primary">
            {course.code}-{course.classNumber}
          </div>
          <div className="mt-0.5 truncate text-[12px] font-semibold">
            {shortTitle(course.titleEn)}
          </div>
          {teacher && (
            <div className="mt-0.5 truncate text-[11px] opacity-80">
              {teacher}
            </div>
          )}
        </div>
        <span className="shrink-0 rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold">
          {course.credits}
        </span>
      </div>
    </div>
  );
}

export function Timetable({ courses }: { courses: Course[] }) {
  const [mobileDay, setMobileDay] = useState<DayOfWeek>("MON");
  const [mobileView, setMobileView] = useState<"DAY" | "ALL">("ALL");
  const [openCell, setOpenCell] = useState<{
    title: string;
    courses: Course[];
  } | null>(null);

  const onDemand = courses.filter((c) =>
    c.meetings.some((m) => m.modality === "ON_DEMAND" || m.period == null)
  );

  const byCell = useMemo(() => {
    const map = new Map<string, Course[]>();
    for (const c of courses) {
      for (const m of c.meetings) {
        if (!m.period) continue;
        if (m.dayOfWeek === "OTHER") continue;
        const key = toCellKey(m.dayOfWeek, m.period);
        const list = map.get(key) ?? [];
        list.push(c);
        map.set(key, list);
      }
    }
    return map;
  }, [courses]);

  const openCellSheet = (label: string, list: Course[]) => {
    if (list.length === 0) return;
    setOpenCell({ title: label, courses: list });
  };

  return (
    <div className="space-y-5">
      {/* Mobile */}
      <section className="md:hidden">
        <div className="mb-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setMobileView("ALL")}
                className={`rounded-full px-3 py-1 text-[12px] font-semibold transition ${
                  mobileView === "ALL"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600"
                }`}
              >
                All（全体）
              </button>
              <button
                type="button"
                onClick={() => setMobileView("DAY")}
                className={`rounded-full px-3 py-1 text-[12px] font-semibold transition ${
                  mobileView === "DAY"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600"
                }`}
              >
                Day（日別）
              </button>
            </div>

            <div className="text-[11px] text-slate-500">
              タップで詳細
            </div>
          </div>

          {mobileView === "DAY" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
              <div className="flex gap-1 overflow-x-auto p-1">
                {DAYS.map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => setMobileDay(d.key)}
                    className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-semibold transition ${
                      mobileDay === d.key
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {mobileView === "DAY" ? (
          <div className="space-y-3">
            {PERIODS.map((p) => {
              const key = toCellKey(mobileDay, p.period);
              const list = byCell.get(key) ?? [];
              return (
                <button
                  key={p.period}
                  type="button"
                  onClick={() =>
                    openCellSheet(`${mobileDay} ${p.period}限`, list)
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {p.period}限
                      </div>
                      <div className="text-xs text-slate-500">{p.time}</div>
                    </div>
                    <div className="text-xs font-semibold text-slate-500">
                      {list.length > 0 ? `${list.length}件` : "空き"}
                    </div>
                  </div>

                  {list.length > 0 && (
                    <div className="relative mt-3 min-h-[70px]">
                      {list.slice(0, 2).map((c, idx) => (
                        <div
                          key={c.id}
                          className="absolute left-0 right-0"
                          style={{ top: idx * 10 }}
                        >
                          <CoursePill course={c} />
                        </div>
                      ))}
                      {list.length > 2 && (
                        <div className="absolute bottom-0 left-0 text-[11px] font-medium text-slate-500">
                          +{list.length - 2} more（タップで表示）
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <div className="min-w-[820px]">
                <div className="grid grid-cols-[86px_repeat(6,minmax(110px,1fr))] border-b border-slate-200 bg-slate-50">
                  <div className="px-2 py-2 text-[11px] font-semibold text-slate-600">
                    時限
                  </div>
                  {DAYS.map((d) => (
                    <div
                      key={d.key}
                      className="px-2 py-2 text-[11px] font-semibold text-slate-700"
                    >
                      {d.label}
                    </div>
                  ))}
                </div>

                {PERIODS.map((p) => (
                  <div
                    key={p.period}
                    className="grid grid-cols-[86px_repeat(6,minmax(110px,1fr))] border-b border-slate-100 last:border-b-0"
                  >
                    <div className="border-r border-slate-100 bg-white px-2 py-2">
                      <div className="text-[12px] font-semibold text-slate-900">
                        {p.period}
                      </div>
                      <div className="text-[10px] text-slate-500">{p.time}</div>
                    </div>

                    {DAYS.map((d) => {
                      const key = toCellKey(d.key, p.period);
                      const list = byCell.get(key) ?? [];
                      const label = `${d.label} ${p.period}限`;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => openCellSheet(label, list)}
                          className="relative min-h-[66px] border-r border-slate-100 p-2 text-left last:border-r-0"
                        >
                          {list.length > 0 && (
                            <div className="absolute right-2 top-2 rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] font-semibold text-white">
                              {list.length}
                            </div>
                          )}

                          <div className="relative h-full">
                            {list.slice(0, 2).map((c, idx) => (
                              <div
                                key={c.id}
                                className="absolute left-0 right-0"
                                style={{ top: idx * 8 }}
                              >
                                <div className={`rounded-lg border px-2 py-1 ${areaHue(c.area)}`}>
                                  <div className="truncate text-[11px] font-semibold">
                                    {c.code}
                                  </div>
                                  <div className="truncate text-[10px] opacity-80">
                                    {shortTitle(c.titleEn)}
                                  </div>
                                </div>
                              </div>
                            ))}
                            {list.length > 2 && (
                              <div className="absolute bottom-1 left-1 text-[10px] font-medium text-slate-500">
                                +{list.length - 2}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Desktop */}
      <section className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        <div className="grid grid-cols-[120px_repeat(6,minmax(160px,1fr))] border-b border-slate-200 bg-slate-50">
          <div className="px-3 py-3 text-xs font-semibold text-slate-600">
            時限 / 時刻
          </div>
          {DAYS.map((d) => (
            <div
              key={d.key}
              className="px-3 py-3 text-xs font-semibold text-slate-700"
            >
              {d.label}
            </div>
          ))}
        </div>

        {PERIODS.map((p) => (
          <div
            key={p.period}
            className="grid grid-cols-[120px_repeat(6,minmax(160px,1fr))] border-b border-slate-100 last:border-b-0"
          >
            <div className="border-r border-slate-100 bg-white px-3 py-3">
              <div className="text-sm font-semibold text-slate-900">
                {p.period}
              </div>
              <div className="text-[11px] text-slate-500">{p.time}</div>
            </div>

            {DAYS.map((d) => {
              const key = toCellKey(d.key, p.period);
              const list = byCell.get(key) ?? [];
              const label = `${d.label} ${p.period}限`;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => openCellSheet(label, list)}
                  className="relative min-h-[92px] border-r border-slate-100 p-2 text-left transition hover:bg-slate-50/60 last:border-r-0"
                >
                  {list.length > 0 && (
                    <div className="absolute right-2 top-2 rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] font-semibold text-white">
                      {list.length}
                    </div>
                  )}

                  <div className="relative h-full">
                    {list.slice(0, 4).map((c, idx) => (
                      <div
                        key={c.id}
                        className="absolute left-0 right-0"
                        style={{
                          top: idx * 10,
                          zIndex: 10 + idx,
                        }}
                      >
                        <CoursePill course={c} />
                      </div>
                    ))}
                    {list.length > 4 && (
                      <div className="absolute bottom-2 left-2 text-[11px] font-medium text-slate-500">
                        +{list.length - 4} more（クリックで表示）
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </section>

      {/* Sheet / Modal */}
      {openCell && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpenCell(null)}
            className="absolute inset-0 bg-slate-900/40"
          />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-2xl rounded-t-3xl border border-slate-200 bg-white p-4 shadow-2xl md:inset-y-0 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:rounded-3xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-waseda-primary">
                  TIMETABLE
                </div>
                <h3 className="mt-1 text-base font-semibold text-slate-900">
                  {openCell.title}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {openCell.courses.length}件（重なりコマ）
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpenCell(null)}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                閉じる
              </button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {openCell.courses.map((c) => (
                <CoursePill key={c.id} course={c} />
              ))}
            </div>
          </div>
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              オンデマンド / 時間未確定
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              フルオンデマンド、または曜日・時限が空欄のPick科目。
            </p>
          </div>
          <div className="text-xs text-slate-500">{onDemand.length} 件</div>
        </div>

        {onDemand.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">該当なし</p>
        ) : (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {onDemand.map((c) => (
              <CoursePill key={c.id} course={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

