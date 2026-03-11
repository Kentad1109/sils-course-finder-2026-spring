import { useMemo, useState } from "react";
import { courses2026Spring } from "@/data/courses2026Spring";
import { useFavorites } from "@/hooks/useFavorites";
import { CourseCard } from "@/components/CourseCard";
import { Timetable } from "@/components/Timetable";

type Tab = "ALL" | "PICKED" | "TIMETABLE";
type DayFilter = "ALL" | "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT";
type PeriodFilter = "ALL" | 1 | 2 | 3 | 4 | 5 | 6;
type AreaFilter = "ALL" | string;

function App() {
  const [keyword, setKeyword] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("ALL");
  const [dayFilter, setDayFilter] = useState<DayFilter>("ALL");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("ALL");
  const [areaFilter, setAreaFilter] = useState<AreaFilter>("ALL");
  const { favoriteIds, toggleFavorite, isFavorite } = useFavorites();

  const areas = useMemo<AreaFilter[]>(() => {
    const unique = Array.from(new Set(courses2026Spring.map((c) => c.area)));
    return ["ALL", ...unique];
  }, []);

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

    return list;
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

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-waseda-primary">
              SILS
            </div>
            <h1 className="text-lg font-semibold text-slate-900">
              Course Finder 2026 Spring
            </h1>
            <p className="text-xs text-slate-500">
              早稲田国際教養学部・2026春学期科目をきれいに一覧＆Pick
            </p>
          </div>
          <nav className="hidden gap-2 text-sm md:flex">
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
            <button
              type="button"
              onClick={() => setActiveTab("PICKED")}
              className={`rounded-full px-3 py-1 ${
                activeTab === "PICKED"
                  ? "bg-waseda-primary text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Pickしたコース
              {favoriteIds.length > 0 && (
                <span className="ml-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-white/90 px-1 text-[11px] font-semibold text-waseda-primary">
                  {favoriteIds.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("TIMETABLE")}
              className={`rounded-full px-3 py-1 ${
                activeTab === "TIMETABLE"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              時間割
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {activeTab === "TIMETABLE" ? (
          <section>
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs md:hidden">
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
              <button
                type="button"
                onClick={() => setActiveTab("PICKED")}
                className={`rounded-full px-3 py-1 ${
                  activeTab === "PICKED"
                    ? "bg-waseda-primary text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Pickしたコース
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("TIMETABLE")}
                className={`rounded-full px-3 py-1 ${
                  activeTab === "TIMETABLE"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                時間割
              </button>
            </div>

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
                            {area}
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

            <Timetable courses={pickedCourses} />
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
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="コース名 / 教員名 / コード など"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs shadow-sm outline-none ring-0 transition focus:border-waseda-primary focus:ring-2 focus:ring-waseda-primary/20"
                />
              </div>

              <div>
                <span className="block text-xs font-medium text-slate-600">
                  曜日
                </span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {[
                    { key: "ALL", label: "全て" },
                    { key: "MON", label: "Mon" },
                    { key: "TUE", label: "Tues" },
                    { key: "WED", label: "Wed" },
                    { key: "THU", label: "Thur" },
                    { key: "FRI", label: "Fri" },
                    { key: "SAT", label: "Sat" },
                  ].map((d) => (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => setDayFilter(d.key as DayFilter)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                        dayFilter === d.key
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
                <span className="block text-xs font-medium text-slate-600">
                  時限
                </span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {["ALL", 1, 2, 3, 4, 5, 6].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPeriodFilter(p as PeriodFilter)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                        periodFilter === p
                          ? "bg-waseda-primary text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {p === "ALL" ? "全て" : `${p}限`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600">
                  カテゴリ
                </label>
                <div className="mt-1 mb-2 flex flex-wrap gap-1">
                  {["Advanced Courses", "Intermediate Courses"].map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() =>
                        setAreaFilter(
                          areaFilter === label ? ("ALL" as AreaFilter) : (label as AreaFilter)
                        )
                      }
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                        areaFilter === label
                          ? "bg-waseda-primary text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <select
                  value={areaFilter}
                  onChange={(e) => setAreaFilter(e.target.value as AreaFilter)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs shadow-sm outline-none ring-0 transition focus:border-waseda-primary focus:ring-2 focus:ring-waseda-primary/20"
                >
                  {areas.map((a) => (
                    <option key={a} value={a}>
                      {a === "ALL" ? "全て" : a}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  setKeyword("");
                  setDayFilter("ALL");
                  setPeriodFilter("ALL");
                  setAreaFilter("ALL");
                }}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
              >
                フィルタをクリア
              </button>
            </div>
          </aside>

          <section>
            <div className="mb-3 flex items-center justify-between gap-2">
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
                <button
                  type="button"
                  onClick={() => setActiveTab("PICKED")}
                  className={`rounded-full px-3 py-1 ${
                    activeTab === "PICKED"
                      ? "bg-waseda-primary text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Pickしたコース
                  {favoriteIds.length > 0 && (
                    <span className="ml-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-white/90 px-1 text-[11px] font-semibold text-waseda-primary">
                      {favoriteIds.length}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("TIMETABLE")}
                  className={`rounded-full px-3 py-1 ${
                    activeTab === "TIMETABLE"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  時間割
                </button>
              </nav>
              <div className="text-[11px] text-slate-500">
                {filteredCourses.length} 件表示
              </div>
            </div>

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
          </section>
        </div>
        )}
      </main>
    </div>
  );
}

export default App;

