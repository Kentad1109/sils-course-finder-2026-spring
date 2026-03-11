// 粗めですが、PDFテキストから courses2026Spring.ts を自動生成するスクリプトです。
// 使い方:
//   node scripts/parseSilsText.js
//
// その後、ブラウザをリロードすれば、全科目がアプリに反映されます。

/* eslint-disable no-console */

const fs = require("fs");
const path = require("path");

const rawPath = path.join(__dirname, "..", "src", "data", "raw_ay2026_sils_spring.txt");
const outPath = path.join(__dirname, "..", "src", "data", "courses2026Spring.ts");

/** @typedef {import("../src/types/course").Course} Course */

/** @type {Record<string, string>} */
const dayMap = {
  "Mon.": "MON",
  "Tues.": "TUE",
  "Tue.": "TUE",
  "Wed.": "WED",
  "Thur.": "THU",
  "Thu.": "THU",
  "Fri.": "FRI",
  "Sat.": "SAT",
};

function parsePeriod(label) {
  const m = label.match(/([１-５1-5])/);
  if (!m) return null;
  const d = m[1];
  const halfWidth = { "１": 1, "２": 2, "３": 3, "４": 4, "５": 5 };
  return halfWidth[d] ?? Number(d);
}

function currentAreaFromContext(line) {
  if (line.includes("Introductory Courses")) return "Introductory Courses";
  if (line.includes("Intermediate Courses")) return "Intermediate Courses";
  if (line.includes("Advanced Courses")) return "Advanced Courses";
  if (line.includes("Advanced Seminars")) return "Advanced Seminars";
  if (line.includes("First Year Seminar A")) return "First Year Seminar A";
  if (line.includes("First Year Seminar B")) return "First Year Seminar B";
  if (line.includes("Intermediate Seminar")) return "Intermediate Seminars";
  if (line.includes("EnglishⅢ")) return "English III";
  if (line.includes("English Support")) return "English Support";
  if (line.includes("English Plus")) return "English Plus";
  if (line.includes("Other Foreign Languages") || line.includes("その他外国語")) {
    return "Other Foreign Languages";
  }
  if (line.includes("インテンシブコース") || line.includes("Intensive Courses")) {
    return "Intensive Courses";
  }
  if (line.includes("プラスコース") || line.includes("Plus Courses")) {
    return "Plus Courses";
  }
  return null;
}

function currentSubAreaFromContext(line) {
  if (line.includes("Life, Environment, Matter and Information")) {
    return "Life, Environment, Matter and Information";
  }
  if (line.startsWith("Philosophy, Religion and History")) {
    return "Philosophy, Religion and History";
  }
  if (line.startsWith("Economy and Business")) return "Economy and Business";
  if (line.startsWith("Governance, Peace")) {
    return "Governance, Peace, Human Rights, and International Relations";
  }
  if (line.startsWith("Expression")) return "Expression";
  if (line.startsWith("Culture, Mind and Body")) {
    return "Culture, Mind and Body, Community";
  }
  return null;
}

function parse() {
  const raw = fs.readFileSync(rawPath, "utf8");
  const lines = raw.split(/\r?\n/);

  /** @type {Course[]} */
  const courses = [];
  let area = "";
  let subArea = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const maybeArea = currentAreaFromContext(trimmed);
    if (maybeArea) {
      area = maybeArea;
      continue;
    }
    const maybeSub = currentSubAreaFromContext(trimmed);
    if (maybeSub) {
      subArea = maybeSub;
      continue;
    }

    // 行頭にコードがあるパターン (例: LE202  01 ... , EB205  01 ...)
    const codeMatch = trimmed.match(/^([A-Z]{2,3}\d{3})\s+(.+)$/);
    if (!codeMatch) continue;

    const code = codeMatch[1];
    const rest = codeMatch[2];
    const cols = rest.split("\t").map((c) => c.trim()).filter(Boolean);
    if (cols.length < 2) continue;

    // だいたい: [class + title, ..., credits, instructorEn, instructorJa, day, period]
    const first = cols[0];
    const classMatch = first.match(/\b(\d{2}(?:-\d{2})?)\b/);
    const classNumber = classMatch ? classMatch[1] : "01";
    const titleEn = first.replace(/\b\d{2}(?:-\d{2})?\b/, "").trim();

    // credits は後ろから数えて最初の数字を使う
    let credits = 2;
    let creditsIndex = -1;
    for (let i = 1; i < cols.length; i += 1) {
      if (/^\d+$/.test(cols[i])) {
        credits = Number.parseInt(cols[i], 10) || 2;
        creditsIndex = i;
        break;
      }
    }

    const tail = creditsIndex >= 0 ? cols.slice(creditsIndex + 1) : cols.slice(2);
    const periodLabel = tail[tail.length - 1] || "";
    const dayLabel = tail[tail.length - 2] || "";
    const instructorJa = tail[tail.length - 3] || "";
    const instructorEnRaw = tail.slice(0, Math.max(0, tail.length - 3)).join(" ").trim();
    const instructorEn = instructorEnRaw || "";

    const dayKey = dayMap[dayLabel] || "OTHER";
    const period = periodLabel ? parsePeriod(periodLabel) : null;

    /** @type {Course} */
    const course = {
      id: `${code}-${classNumber}`,
      term: "2026-spring",
      code,
      classNumber,
      titleEn,
      titleJa: "",
      credits,
      area: area || "Uncategorized",
      subArea: subArea || undefined,
      levelLabel: undefined,
      language: "EN",
      isIntensive: false,
      isApm: titleEn.startsWith("APM-"),
      instructors: instructorEn
        ? [
            {
              id: instructorEn.replace(/[^A-Z]/g, "-") || instructorJa || "UNKNOWN",
              nameEn: instructorEn,
              nameJa: instructorJa || undefined,
            },
          ]
        : [],
      meetings:
        dayKey === "OTHER" && !period
          ? []
          : [
              {
                dayOfWeek: /** @type any */ (dayKey),
                period: period,
                slotLabel: [dayLabel, periodLabel].filter(Boolean).join(" "),
                modality:
                  periodLabel && periodLabel.includes("フルオンデマンド")
                    ? "ON_DEMAND"
                    : "ON_CAMPUS",
              },
            ],
      tags: [],
    };

    courses.push(course);
  }

  const header = `// このファイルは scripts/parseSilsText.js によって自動生成されました。\n` +
    `// 直接編集せず、元データやスクリプトを更新してください。\n\n` +
    `import type { Course } from "@/types/course";\n\n` +
    `export const courses2026Spring: Course[] = `;

  const json = JSON.stringify(courses, null, 2)
    // JSON をほぼそのまま TS に流用
    .replace(/"([A-Za-z0-9_]+)"\s*:/g, "$1:") // キーのダブルクォートを軽く削る（安全でないが簡易）
    .replace(/"2026-spring"/g, `"2026-spring" as const`);

  fs.writeFileSync(outPath, `${header}${json};\n`, "utf8");

  console.log(`Generated ${courses.length} courses into src/data/courses2026Spring.ts`);
}

parse();

