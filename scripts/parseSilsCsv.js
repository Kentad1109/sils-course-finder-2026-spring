// CSV (rawdata_春学期授業.csv) から courses2026Spring.ts を自動生成します。
// 使い方:
//   npm run generate:data
//
/* eslint-disable no-console */

const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

const csvPath = path.join(__dirname, "..", "rawdata_春学期授業 (1).csv");
const outPath = path.join(__dirname, "..", "src", "data", "courses2026Spring.ts");

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
  if (!label) return null;
  const m = String(label).match(/([１-５1-5])/);
  if (!m) return null;
  const d = m[1];
  const halfWidth = { "１": 1, "２": 2, "３": 3, "４": 4, "５": 5 };
  return halfWidth[d] ?? Number(d);
}

function splitInstructor(instructor) {
  const s = (instructor ?? "").trim();
  if (!s) return { en: "", ja: "" };

  // 例: 'DIMMER, Christian ディマ クリスティアン'
  // 英字/記号が続いて、その後に日本語、という前提で分割
  const m = s.match(/^([A-Za-z0-9.,'’() -]+?)\s+([^\x00-\x7F].*)$/);
  if (m) return { en: m[1].trim(), ja: m[2].trim() };

  // 日本語だけ / 英語だけのケース
  const hasNonAscii = /[^\x00-\x7F]/.test(s);
  return hasNonAscii ? { en: "", ja: s } : { en: s, ja: "" };
}

function splitInstructorsField(field) {
  const s = (field ?? "").trim();
  if (!s) return [];

  // 教員の区切り（例: 'GIUNTA, Lena ... , BERTHET, Didier ...'）
  // 英語の姓が大文字で 'SURNAME,' になっているパターンで分割する
  const parts = s.split(/,\s+(?=[A-Z][A-Z .'-]+,\s)/g).map((x) => x.trim()).filter(Boolean);
  return parts.length ? parts : [s];
}

function normalizeCategory(category) {
  const c = (category ?? "").trim();
  if (!c) return { area: "Uncategorized", levelLabel: undefined };

  if (c.startsWith("Other Foreign Languages")) {
    // 例: Other Foreign Languages - Level 1
    const parts = c.split(" - ").map((x) => x.trim());
    return {
      area: "Other Foreign Languages",
      levelLabel: parts[1] || undefined,
    };
  }

  return { area: c, levelLabel: undefined };
}

function inferLanguageFromCategory(category) {
  const c = (category ?? "").toLowerCase();
  if (c.includes("（japanese") || c.includes("(japanese")) return "JA";
  if (c.includes("（english") || c.includes("(english")) return "EN";
  if (c.includes("english")) return "EN";
  return "EN";
}

function main() {
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV not found: ${csvPath}`);
    process.exit(1);
  }

  const csv = fs.readFileSync(csvPath, "utf8");
  const records = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    trim: true,
  });

  const courses = [];
  for (const r of records) {
    const code = String(r.code ?? "").trim();
    const classNumber = String(r.class ?? "").trim();
    const titleEn = String(r["course title"] ?? "").trim();
    const category = String(r.category ?? "").trim();
    const creditsRaw = r.credits ?? r.crecits; // header typo safety
    const credits = Number.parseInt(String(creditsRaw ?? "").trim() || "0", 10) || 0;
    const instructorRaw = String(r.instructor ?? "").trim();
  const dayLabel = String(r.day ?? "").trim();
  const periodLabel = String(r.period ?? "").trim();

    const { area, levelLabel } = normalizeCategory(category);
    const language = inferLanguageFromCategory(category);

    const instructors = splitInstructorsField(instructorRaw).map((chunk) => {
      const { en: instructorEn, ja: instructorJa } = splitInstructor(chunk);
      const instructorIdBase = (instructorEn || instructorJa || "UNKNOWN").toUpperCase();
      const instructorId = instructorIdBase
        .replace(/[^A-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      return {
        id: instructorId,
        nameEn: instructorEn,
        nameJa: instructorJa || undefined,
      };
    });

    // 複数曜日・複数時限（例: 'Mon., Wed.' / '２時限, ３時限' や
    // 'Mon., Tues., Wed., Fri.' / '２時限' など）を Meeting[] に展開する
    /** @type {Array<{ dayOfWeek: string; period: number|null; slotLabel: string; modality: string }>} */
    const meetings = [];
    if (dayLabel || periodLabel) {
      const dayTokens = dayLabel
        ? dayLabel.split(",").map((d) => d.trim()).filter(Boolean)
        : [];
      const periodTokens = periodLabel
        ? periodLabel.split(",").map((p) => p.trim()).filter(Boolean)
        : [];

      const maxLen = Math.max(dayTokens.length || 1, periodTokens.length || 1);

      for (let i = 0; i < maxLen; i += 1) {
        const rawDay = dayTokens[i] || dayTokens[0] || "";
        const rawPeriod = periodTokens[i] || periodTokens[0] || "";

        const dayKey = dayMap[rawDay] || "OTHER";
        const period = parsePeriod(rawPeriod);
        const isOnDemand = rawPeriod.includes("フルオンデマンド");

        if (!rawDay && !rawPeriod) {
          // 何も情報がなければスキップ
          // eslint-disable-next-line no-continue
          continue;
        }

        meetings.push({
          dayOfWeek: dayKey,
          period,
          slotLabel: `${rawDay} ${rawPeriod}`.trim(),
          modality: isOnDemand ? "ON_DEMAND" : "ON_CAMPUS",
        });
      }
    }

    const isApm = titleEn.startsWith("APM-") || titleEn.includes("APM-");
    const isIntensive =
      area.toLowerCase().includes("intensive") || titleEn.toLowerCase().includes("intensive");

    courses.push({
      id: `${code}-${classNumber || "01"}`,
      term: "2026-spring",
      code,
      classNumber,
      titleEn,
      titleJa: "",
      credits,
      area,
      subArea: undefined,
      levelLabel,
      language,
      isIntensive,
      isApm,
      instructors,
      meetings,
      tags: [],
    });
  }

  const header =
    `// このファイルは scripts/parseSilsCsv.js によって自動生成されました。\n` +
    `// 元データ: rawdata_春学期授業.csv\n` +
    `// 直接編集せず、CSVまたはスクリプトを更新してください。\n\n` +
    `import type { Course } from "@/types/course";\n\n` +
    `export const courses2026Spring: Course[] = `;

  fs.writeFileSync(outPath, `${header}${JSON.stringify(courses, null, 2)};\n`, "utf8");
  console.log(`Generated ${courses.length} courses into src/data/courses2026Spring.ts`);
}

main();

