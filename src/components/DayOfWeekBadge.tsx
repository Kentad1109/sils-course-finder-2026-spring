import type { Meeting } from "@/types/course";

const DAY_LABEL: Record<string, string> = {
  MON: "Mon",
  TUE: "Tues",
  WED: "Wed",
  THU: "Thur",
  FRI: "Fri",
  SAT: "Sat",
  OTHER: "Other",
};

interface Props {
  meeting: Meeting;
}

export const DayOfWeekBadge: React.FC<Props> = ({ meeting }) => {
  const label = DAY_LABEL[meeting.dayOfWeek] ?? meeting.dayOfWeek;
  const period =
    meeting.period != null ? `${meeting.period}限` : meeting.slotLabel;

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
      <span className="font-medium">{label}</span>
      <span>·</span>
      <span>{period}</span>
    </span>
  );
};

