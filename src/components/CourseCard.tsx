import type { Course } from "@/types/course";

interface Props {
  course: Course;
  picked: boolean;
  onTogglePick: () => void;
}

const DAY_LABEL: Record<string, string> = {
  MON: "Mon.",
  TUE: "Tues.",
  WED: "Wed.",
  THU: "Thur.",
  FRI: "Fri.",
  SAT: "Sat.",
  OTHER: "Other",
};

export const CourseCard: React.FC<Props> = ({ course, picked, onTogglePick }) => {
  const { code, classNumber, titleEn, titleJa, credits, area, subArea } = course;
  const displayTitle = (() => {
    const t = titleEn.trim();
    const cls = classNumber.trim();
    if (!cls) return t;
    const escaped = cls.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const endsWithClass = new RegExp(`(?:\\s|　)${escaped}$`).test(t);
    return endsWithClass ? t : `${t} ${cls}`;
  })();

  const teachers =
    course.instructors.length > 0
      ? course.instructors
          .map((i) => i.nameEn || i.nameJa || "")
          .filter(Boolean)
          .join(", ")
      : "";
  const scheduleText =
    course.meetings.length > 0
      ? course.meetings
          .map((m) => {
            const day = DAY_LABEL[m.dayOfWeek] ?? m.dayOfWeek;
            const slot = m.period != null ? `${m.period}時限` : m.slotLabel;
            return `${day} ${slot}`;
          })
          .join(", ")
      : "未定";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-2.5">
        <div className="min-w-0">
          <div className="text-sm font-bold tracking-tight text-slate-900">
            {code}
          </div>
          <h2 className="mt-1 text-[13px] font-semibold leading-snug text-slate-900 md:text-sm">
            {displayTitle}
          </h2>
          {titleJa && (
            <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500">{titleJa}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onTogglePick}
          aria-label={picked ? "Pickを解除" : "Pickする"}
          className={`shrink-0 rounded-full border p-2 transition ${
            picked
              ? "border-waseda-primary bg-waseda-primary text-white"
              : "border-slate-300 bg-white text-slate-500 hover:border-slate-400"
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill={picked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M12 21s-6.7-4.35-9.2-8.2C.6 9.5 1.4 5.5 4.8 4.3c2.1-.8 4.4.1 5.7 1.9 1.3-1.8 3.6-2.7 5.7-1.9 3.4 1.2 4.2 5.2 2 8.5C18.7 16.65 12 21 12 21z" />
          </svg>
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="inline-flex max-w-[75%] rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-800">
          <span className="truncate">
            {area}
            {subArea ? ` ${subArea}` : ""}
          </span>
        </span>
        <span className="shrink-0 rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-semibold text-white">
          {credits}単位
        </span>
      </div>

      <div className="mt-2 border-t border-slate-100 pt-2">
        <div className="grid grid-cols-[58px,1fr] items-start gap-y-1.5 text-[11px]">
          <div className="font-semibold text-slate-700">教員</div>
          <div className="truncate text-right text-slate-500">{teachers || "-"}</div>

          <div className="font-semibold text-slate-700">曜日</div>
          <div className="truncate text-right text-slate-500">{scheduleText}</div>
        </div>
      </div>
    </div>
  );
};
