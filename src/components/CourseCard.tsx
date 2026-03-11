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
    <div className="rounded-2xl border border-rose-200/70 bg-gradient-to-br from-rose-50/60 via-white to-amber-50/30 p-3.5 shadow-sm transition hover:border-rose-300/80 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-base font-bold tracking-tight text-slate-900">
            {code}
          </div>
          <h2 className="mt-1.5 text-sm font-semibold leading-snug tracking-tight text-slate-900 md:text-base">
            {titleEn} {classNumber}
          </h2>
          {titleJa && (
            <p className="mt-1 text-xs text-slate-500">{titleJa}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onTogglePick}
          aria-label={picked ? "Pickを解除" : "Pickする"}
          className={`shrink-0 rounded-full border p-2 transition ${
            picked
              ? "border-waseda-primary bg-waseda-primary/10 text-waseda-primary"
              : "border-slate-300 bg-white text-slate-500 hover:border-slate-400"
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill={picked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M12 21s-6.7-4.35-9.2-8.2C.6 9.5 1.4 5.5 4.8 4.3c2.1-.8 4.4.1 5.7 1.9 1.3-1.8 3.6-2.7 5.7-1.9 3.4 1.2 4.2 5.2 2 8.5C18.7 16.65 12 21 12 21z" />
          </svg>
        </button>
      </div>

      <div className="mt-3 inline-flex max-w-full rounded-full border border-rose-200 bg-rose-50/80 px-3 py-1 text-xs font-semibold leading-tight text-rose-800 md:text-sm">
        <span className="truncate">
          {area}
          {subArea ? ` ${subArea}` : ""}
        </span>
      </div>

      <div className="mt-3 border-t border-rose-100 pt-3">
        <div className="grid grid-cols-[84px,1fr] items-start gap-y-2 text-[11px] md:text-xs">
          <div className="font-semibold text-slate-800">教員</div>
          <div className="text-right text-slate-500">{teachers || "-"}</div>

          <div className="font-semibold text-slate-800">曜日・時限</div>
          <div className="text-right text-slate-500">{scheduleText}</div>

          <div className="font-semibold text-slate-800">単位</div>
          <div className="text-right text-lg font-semibold text-slate-700 md:text-xl">{credits}</div>
        </div>
      </div>
    </div>
  );
};
