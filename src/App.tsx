import { useMemo, useState } from "react";
import { courses2026Spring } from "@/data/courses2026Spring";
import { useFavorites } from "@/hooks/useFavorites";
import { CourseCard } from "@/components/CourseCard";
import { Timetable } from "@/components/Timetable";

type Tab = "ALL" | "PICKED" | "TIMETABLE";
type DayFilter = "ALL" | "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT";
type PeriodFilter = "ALL" | 1 | 2 | 3 | 4 | 5 | 6;
type AreaFilter = "ALL" | string;
type FilterChipKey = "keyword" | "day" | "period" | "area";

const AREA_LABELS: Record<string, string> = {
  "Advanced Courses": "Advanced Courses 上級科目",
  "Advanced Seminars": "Advanced Seminars 上級演習",
  "English III": "English III 英語III",
  "English Plus": "English Plus (Elective) 英語V",
  "English Support": "English Support 英語IV",
  "First Year Seminar A": "First Year Seminar A 基礎演習A",
  "First Year Seminar B": "First Year Seminar B 基礎演習B",
  "Intensive Courses": "インテンシブコース Intensive Courses",
  "Intermediate Courses": "Intermediate Courses 中級科目",
  "Intermediate Seminar": "Intermediate Seminar 中級演習",
  "Introductory Courses": "Introductory Courses 入門科目",
  "Introductory Data Science": "Introductory Data Science 入門データサイエンス",
  "Introductory Statistics A (English)": "Introductory Statistics A (English) 入門統計学A (英語)",
  "Introductory Statistics A (Japanese)": "Introductory Statistics A (Japanese) 入門統計学A (日本語)",
  "Introductory Statistics B (English)": "Introductory Statistics B (English) 入門統計学B (英語)",
  "Introductory Statistics B (Japanese)": "Introductory Statistics B (Japanese) 入門統計学B (日本語)",
  "Other Foreign Languages": "Other Foreign Languages その他外国語",
  "Plus Courses": "プラスコース Plus Courses",
};

const getAreaLabel = (area: string) => AREA_LABELS[area] ?? area;
const DAY_OPTIONS: Array<{ value: DayFilter; label: string }> = [
  { value: "MON", label: "Mon" },
  { value: "TUE", label: "Tues" },
  { value: "WED", label: "Wed" },
  { value: "THU", label: "Thur" },
  { value: "FRI", label: "Fri" },
  { value: "SAT", label: "Sat" },
];
const DAY_LABELS: Record<Exclude<DayFilter, "ALL">, string> = {
  MON: "Mon",
  TUE: "Tues",
  WED: "Wed",
  THU: "Thur",
  FRI: "Fri",
  SAT: "Sat",
};
const PERIOD_OPTIONS: Array<Exclude<PeriodFilter, "ALL">> = [1, 2, 3, 4, 5, 6];
const AREA_PRIORITY: Record<string, number> = {
  "Advanced Courses": 0,
  "Intermediate Courses": 1,
};

function App() {
  const [keyword, setKeyword] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("ALL");
  const [dayFilter, setDayFilter] = useState<DayFilter>("ALL");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("ALL");
  const [areaFilter, setAreaFilter] = useState<AreaFilter>("ALL");
  const { favoriteIds, toggleFavorite, isFavorite, lastSavedAt, savePulse } = useFavorites();

  const areas = useMemo<AreaFilter[]>(() => {
    const unique = Array.from(new Set(courses2026Spring.map((c) => c.area)));
    return ["ALL", ...unique.reverse()];
  }, []);
  const hasActiveFilters =
    keyword.trim() !== "" || dayFilter !== "ALL" || periodFilter !== "ALL" || areaFilter !== "ALL";

  const clearAllFilters = () => {
    setKeyword("");
    setDayFilter("ALL");
    setPeriodFilter("ALL");
    setAreaFilter("ALL");
  };

  const handleKeywordChange = (value: string) => {
    setKeyword(value);
    if (value.trim() !== "") {
      setDayFilter("ALL");
      setPeriodFilter("ALL");
      setAreaFilter("ALL");
    }
  };

  const activeFilterChips = useMemo<Array<{ key: FilterChipKey; label: string }>>(() => {
    const chips: Array<{ key: FilterChipKey; label: string }> = [];
    const k = keyword.trim();
    if (k) chips.push({ key: "keyword", label: `キーワード: ${k}` });
    if (dayFilter !== "ALL") chips.push({ key: "day", label: `曜日: ${DAY_LABELS[dayFilter]}` });
    if (periodFilter !== "ALL") chips.push({ key: "period", label: `時限: ${periodFilter}限` });
    if (areaFilter !== "ALL") chips.push({ key: "area", label: `カテゴリ: ${getAreaLabel(areaFilter)}` });
    return chips;
  }, [keyword, dayFilter, periodFilter, areaFilter]);

  const clearSingleFilter = (key: FilterChipKey) => {
    if (key === "keyword") setKeyword("");
    if (key === "day") setDayFilter("ALL");
    if (key === "period") setPeriodFilter("ALL");
    if (key === "area") setAreaFilter("ALL");
  };
  const favoriteSavedLabel = useMemo(() => {
    if (!lastSavedAt) return "Pickはこの端末に自動保存されます";
    const formatted = new Intl.DateTimeFormat("ja-JP", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(lastSavedAt);
    return `保存済み ${formatted}`;
  }, [lastSavedAt]);

  const filteredCourses = useMemo(() => {
    const lower = keyword.trim().toLowerCase();
    let list = courses2026Spring;

    if (lower) {
      list = list.filter((c) => {
        const haystack =
          [
            c.code,
            c.classNumber,
            c.titleEn,
            c.titleJa,
            c.area,
            c.subArea,
            ...c.instructors.map((i) => i.nameEn),
            ...c.instructors.map((i) => i.nameJa ?? ""),
          ]
            .join(" ")
            .toLowerCase();
        return haystack.includes(lower);
      });
    }

    if (dayFilter !== "ALL") {
      list = list.filter((c) =>
        c.meetings.some((m) => m.dayOfWeek === dayFilter)
      );
    }

    if (periodFilter !== "ALL") {
      list = list.filter((c) =>
        c.meetings.some((m) => m.period === periodFilter)
      );
    }

    if (areaFilter !== "ALL") {
      list = list.filter((c) => c.area === areaFilter);
    }

    if (activeTab === "PICKED") {
      list = list.filter((c) => favoriteIds.includes(c.id));
    }

    return [...list].sort((a, b) => {
      const pa = AREA_PRIORITY[a.area] ?? 99;
      const pb = AREA_PRIORITY[b.area] ?? 99;
      if (pa !== pb) return pa - pb;
      if (a.area !== b.area) return a.area.localeCompare(b.area);
      if (a.code !== b.code) return a.code.localeCompare(b.code);
      return a.classNumber.localeCompare(b.classNumber);
    });
  }, [keyword, activeTab, favoriteIds, dayFilter, periodFilter, areaFilter]);

  const pickedCourses = useMemo(() => {
    const set = new Set(favoriteIds);
    return courses2026Spring.filter((c) => set.has(c.id));
  }, [favoriteIds]);

  const pickedCredits = useMemo(() => {
    const total = pickedCourses.reduce((sum, c) => sum + (c.credits || 0), 0);
    const byArea = new Map<string, number>();
    for (const c of pickedCourses) {
      byArea.set(c.area, (byArea.get(c.area) ?? 0) + (c.credits || 0));
    }
    const byAreaSorted = Array.from(byArea.entries()).sort((a, b) => b[1] - a[1]);
    return { total, byAreaSorted };
  }, [pickedCourses]);

  const pickedGroupedByArea = useMemo(() => {
    const map = new Map<string, typeof pickedCourses>();
    for (const c of pickedCourses) {
      const list = map.get(c.area) ?? [];
      list.push(c);
      map.set(c.area, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [pickedCourses]);

  return (
    <div className="min-h-screen bg-slate-50">
      <button
        type="button"
        onClick={() => setActiveTab(activeTab === "TIMETABLE" ? "ALL" : "TIMETABLE")}
        className="fixed right-4 top-4 z-40 inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-lg backdrop-blur transition hover:bg-white hover:shadow-xl md:right-6 md:top-5 md:gap-2.5 md:px-5 md:py-3 md:text-sm"
      >
        <span className="text-sm leading-none text-waseda-primary md:text-base">▦</span>
        <span>{activeTab === "TIMETABLE" ? "コース一覧へ" : "時間割を見る"}</span>
      </button>

      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center px-4 py-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-waseda-primary">
              SILS
            </div>
            <h1 className="mt-0.5 text-lg font-semibold tracking-tight text-slate-900 md:text-xl">
              Course Finder 2026 Spring
            </h1>
            <p className="mt-1 text-xs font-medium text-slate-500 md:text-sm">
              早稲田大学 国際教養学部 2026年春学期 | 科目検索・時間割作成
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {activeTab === "TIMETABLE" ? (
          <section>
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Pickした科目の時間割
                </h2>
              </div>
              <div className="text-xs text-slate-500">
                Pick {pickedCourses.length} 件
              </div>
            </div>

            <div className="mb-4 grid gap-3 md:grid-cols-[1.2fr,2fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-waseda-primary">
                  合計単位
                </div>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <div>
                    <div className="text-3xl font-semibold leading-none text-slate-900">
                      {pickedCredits.total}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Pickした科目の合計単位
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-3 py-2 text-right">
                    <div className="text-xs font-semibold text-slate-700">
                      {pickedCourses.length} courses
                    </div>
                    <div className="text-[11px] text-slate-500">
                      時間割に反映
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-waseda-primary">
                      カテゴリ別単位
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {pickedCredits.byAreaSorted.length} categories
                  </div>
                </div>

                {pickedCredits.byAreaSorted.length > 0 && (
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {pickedCredits.byAreaSorted.map(([area, credits]) => (
                      <div
                        key={area}
                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-xs font-semibold text-slate-800">
                            {getAreaLabel(area)}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {credits} 単位
                          </div>
                        </div>
                        <div className="text-lg font-semibold text-slate-900">
                          {credits}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Timetable
              courses={pickedCourses}
              onTogglePick={toggleFavorite}
              isPicked={isFavorite}
            />
          </section>
        ) : (
        <div className="grid gap-6 md:grid-cols-[minmax(0,260px),1fr]">
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-800">
              絞り込み
            </h2>

            <div className="mt-3 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  キーワード
                </label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => handleKeywordChange(e.target.value)}
                  placeholder="科目名、教員名、科目コードで検索..."
                  className="mt-1 w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm outline-none ring-0 transition focus:border-waseda-primary focus:ring-2 focus:ring-waseda-primary/20"
                />
                <button
                  type="button"
                  onClick={clearAllFilters}
                  disabled={!hasActiveFilters}
                  className="mt-2 text-[11px] font-semibold text-slate-500 underline decoration-slate-300 underline-offset-2 transition enabled:hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  すべてのフィルタを外す
                </button>
              </div>

              <div className="hidden space-y-3 md:block">
                <div>
                  <div className="mb-1 text-[11px] font-semibold text-slate-500">曜日</div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setDayFilter("ALL")}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                        dayFilter === "ALL"
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      すべて
                    </button>
                    {DAY_OPTIONS.map((d) => (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => setDayFilter(d.value)}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                          dayFilter === d.value
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-1 text-[11px] font-semibold text-slate-500">時限</div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPeriodFilter("ALL")}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                        periodFilter === "ALL"
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      すべて
                    </button>
                    {PERIOD_OPTIONS.map((period) => (
                      <button
                        key={period}
                        type="button"
                        onClick={() => setPeriodFilter(period)}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                          periodFilter === period
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {period}限
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 md:hidden">
                <select
                  aria-label="曜日フィルター"
                  value={dayFilter}
                  onChange={(e) => setDayFilter(e.target.value as DayFilter)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none transition focus:border-waseda-primary focus:ring-1 focus:ring-waseda-primary/30"
                >
                  <option value="ALL">すべての曜日</option>
                  <option value="MON">Mon</option>
                  <option value="TUE">Tues</option>
                  <option value="WED">Wed</option>
                  <option value="THU">Thur</option>
                  <option value="FRI">Fri</option>
                  <option value="SAT">Sat</option>
                </select>

                <select
                  aria-label="時限フィルター"
                  value={periodFilter}
                  onChange={(e) =>
                    setPeriodFilter(
                      (e.target.value === "ALL"
                        ? "ALL"
                        : Number(e.target.value)) as PeriodFilter
                    )
                  }
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none transition focus:border-waseda-primary focus:ring-1 focus:ring-waseda-primary/30"
                >
                  <option value="ALL">すべての時限</option>
                  <option value="1">1限</option>
                  <option value="2">2限</option>
                  <option value="3">3限</option>
                  <option value="4">4限</option>
                  <option value="5">5限</option>
                  <option value="6">6限</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
                <select
                  aria-label="カテゴリフィルター"
                  value={areaFilter}
                  onChange={(e) => setAreaFilter(e.target.value as AreaFilter)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none transition focus:border-waseda-primary focus:ring-1 focus:ring-waseda-primary/30"
                >
                  {areas.map((a) => (
                    <option key={a} value={a}>
                      {a === "ALL" ? "すべてのカテゴリ" : getAreaLabel(a)}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setActiveTab("PICKED")}
                  className="group relative flex h-11 items-center justify-center gap-2 overflow-hidden rounded-xl border border-waseda-primary/30 bg-gradient-to-r from-waseda-primary/10 to-rose-50 text-sm font-semibold text-slate-800 shadow-sm transition hover:from-waseda-primary/15 hover:to-rose-100 hover:shadow"
                >
                  <span className="text-lg leading-none text-waseda-primary transition group-hover:scale-110">♡</span>
                  <span>Picked</span>
                  {favoriteIds.length > 0 && (
                    <span className="rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-bold text-waseda-primary ring-1 ring-waseda-primary/20">
                      {favoriteIds.length}
                    </span>
                  )}
                </button>
                <div className={`text-[11px] font-medium transition ${savePulse ? "text-emerald-700" : "text-slate-500"}`}>
                  {favoriteSavedLabel}
                </div>
              </div>
            </div>
          </aside>

          <section>
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
              <nav className="flex gap-2 text-xs md:text-sm">
                <button
                  type="button"
                  onClick={() => setActiveTab("ALL")}
                  className={`rounded-full px-3 py-1 ${
                    activeTab === "ALL"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  全コース
                </button>
              </nav>
              {activeFilterChips.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {activeFilterChips.map((chip) => (
                    <button
                      key={chip.key}
                      type="button"
                      onClick={() => clearSingleFilter(chip.key)}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-700 transition hover:bg-slate-50"
                    >
                      <span className="truncate">{chip.label}</span>
                      <span className="text-slate-400">×</span>
                    </button>
                  ))}
                </div>
              )}
              </div>
              <div className="text-[11px] text-slate-500">
                {filteredCourses.length} 件表示
              </div>
            </div>

            {activeTab === "PICKED" ? (
              <section className="space-y-5">
                {pickedGroupedByArea.length === 0 && (
                  <p className="text-sm text-slate-500">
                    まだPickがありません。コース一覧からPickしてみてください。
                  </p>
                )}
                {pickedGroupedByArea.map(([area, list]) => (
                  <div key={area} className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      {getAreaLabel(area)}
                    </h3>
                    <div className="grid gap-3 md:grid-cols-2">
                      {list.map((course) => (
                        <CourseCard
                          key={course.id}
                          course={course}
                          picked={isFavorite(course.id)}
                          onTogglePick={() => toggleFavorite(course.id)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            ) : (
              <section className="grid gap-4 md:grid-cols-2">
                {filteredCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    picked={isFavorite(course.id)}
                    onTogglePick={() => toggleFavorite(course.id)}
                  />
                ))}
                {filteredCourses.length === 0 && (
                  <p className="text-sm text-slate-500">
                    条件に合うコースが見つかりませんでした。
                  </p>
                )}
              </section>
            )}
          </section>
        </div>
        )}
      </main>
    </div>
  );
}

export default App;
