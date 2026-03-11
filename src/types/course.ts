export type DayOfWeek = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "OTHER";

export type Modality = "ON_CAMPUS" | "ON_DEMAND" | "HYBRID" | "UNKNOWN";

export interface Meeting {
  dayOfWeek: DayOfWeek;
  period: number | null;
  slotLabel: string;
  modality: Modality;
}

export interface Instructor {
  id: string;
  nameEn: string;
  nameJa?: string;
}

export interface Course {
  id: string;
  term: "2026-spring";
  code: string;
  classNumber: string;
  titleEn: string;
  titleJa?: string;
  credits: number;
  area: string;
  subArea?: string;
  levelLabel?: string;
  language: "EN" | "JA" | "BILINGUAL" | "OTHER";
  isIntensive?: boolean;
  isApm?: boolean;
  instructors: Instructor[];
  meetings: Meeting[];
  tags?: string[];
}

