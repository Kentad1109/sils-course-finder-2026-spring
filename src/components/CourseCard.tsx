import type { Course } from "@/types/course";
import { DayOfWeekBadge } from "./DayOfWeekBadge";

interface Props {
  course: Course;
  picked: boolean;
  onTogglePick: () => void;
}

export const CourseCard: React.FC<Props> = ({ course, picked, onTogglePick }) => {
  const { code, classNumber, titleEn, titleJa, credits, area, subArea } = course;

  return (
    <div className="flex flex-col gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-sm ring-1 ring-slate-900/0 transition hover:-translate-y-0.5 hover:border-waseda-primary/40 hover:shadow-md hover:ring-1 hover:ring-waseda-primary/10">
      <div className="h-1 w-full bg-gradient-to-r from-waseda-primary/80 via-waseda-primary to-waseda-primary/60" />
      <div className="flex items-start justify-between gap-3 px-4 pt-3">
        <div>
          <div className="inline-flex items-center gap-1 rounded-full bg-waseda-primary/5 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-waseda-primary">
            <span>{code}</span>
            {classNumber && <span className="text-[10px] text-waseda-primary/80">#{classNumber}</span>}
          </div>
          <h2 className="mt-1 text-sm font-semibold leading-snug text-slate-900">
            {titleEn}
          </h2>
          {titleJa && (
            <p className="text-xs text-slate-500">{titleJa}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onTogglePick}
          className={`rounded-full border px-3 py-1 text-[11px] font-medium shadow-sm transition ${
            picked
              ? "border-waseda-primary bg-waseda-primary text-white"
              : "border-slate-300 bg-white text-slate-700 hover:border-waseda-primary/70 hover:text-waseda-primary"
          }`}
        >
          {picked ? "Pick済み" : "Pick"}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-4 text-[11px] text-slate-500">
        <span className="rounded-full bg-slate-100 px-2 py-1 font-medium">
          {credits} credits
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-1">
          {area}
        </span>
        {subArea && (
          <span className="rounded-full bg-slate-50 px-2 py-1">
            {subArea}
          </span>
        )}
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-2 px-4">
        {course.meetings.map((m, idx) => (
          <DayOfWeekBadge key={idx} meeting={m} />
        ))}
      </div>

      {course.instructors.length > 0 && (
        <p className="mt-1 px-4 pb-4 text-xs text-slate-600">
          {course.instructors.map((i) => i.nameEn).join(", ")}
        </p>
      )}
    </div>
  );
};

