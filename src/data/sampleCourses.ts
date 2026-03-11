import type { Course } from "@/types/course";

export const sampleCourses: Course[] = [
  {
    id: "LE202-01",
    term: "2026-spring",
    code: "LE202",
    classNumber: "01",
    titleEn: "Science, Technology and Society",
    titleJa: "",
    credits: 2,
    area: "Introductory Courses",
    subArea: "Life, Environment, Matter and Information",
    levelLabel: "Introductory",
    language: "EN",
    isIntensive: false,
    isApm: false,
    instructors: [
      {
        id: "SIDOLI-NATHAN",
        nameEn: "SIDOLI, Nathan Camillo",
        nameJa: "シドリ ネイサン カミッロ",
      },
    ],
    meetings: [
      {
        dayOfWeek: "TUE",
        period: 3,
        slotLabel: "Tues. ３時限",
        modality: "ON_CAMPUS",
      },
    ],
    tags: ["Introductory", "Science"],
  },
  {
    id: "EB205-01",
    term: "2026-spring",
    code: "EB205",
    classNumber: "01",
    titleEn: "Introduction to Microeconomics",
    titleJa: "",
    credits: 2,
    area: "Introductory Courses",
    subArea: "Economy and Business",
    levelLabel: "Introductory",
    language: "EN",
    instructors: [
      {
        id: "SHINO-JUNNOSUKE",
        nameEn: "SHINO, Junnosuke",
        nameJa: "篠 潤之介",
      },
    ],
    meetings: [
      {
        dayOfWeek: "SAT",
        period: 2,
        slotLabel: "Sat. ２時限",
        modality: "ON_CAMPUS",
      },
    ],
    tags: ["Economics"],
  },
];

