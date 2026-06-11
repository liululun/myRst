import { useMemo, useState } from "react";
import "./App.css";
import Header from "./components/Header";
import YearFilter from "./components/YearFilter";
import SummaryCards from "./components/SummaryCards";
import Analysis from "./components/Analysis";
import ZoneDoughnut from "./components/ZoneDoughnut";
import PaceLineChart from "./components/PaceLineChart";
import ConsumptionLineChart from "./components/ConsumptionLineChart";
import ZoneStackChart from "./components/ZoneStackChart";
import DataTable from "./components/DataTable";
import Footer from "./components/Footer";
import { computeSummary } from "./utils";
import runsData from "./data/runs.json";
import type { RunRecord } from "./types";

const RUNS = runsData as RunRecord[];
const GENERATED_AT = "2026-06-08 11:30:23";

function App() {
  const years = useMemo(() => [...new Set(RUNS.map((r) => r.date.slice(0, 4)))].sort(), []);
  const [year, setYear] = useState("all");

  const currentYearRows = useMemo(
    () => (year === "all" ? RUNS : RUNS.filter((r) => r.date.slice(0, 4) === year)),
    [year],
  );

  const summary = useMemo(() => computeSummary(currentYearRows), [currentYearRows]);
  const yearLabel = year === "all" ? "全部年份" : `${year} 年`;

  return (
    <>
      <Header generatedAt={GENERATED_AT} />
      <div className="container">
        <YearFilter years={years} value={year} onChange={setYear} />

        {summary && (
          <>
            <SummaryCards summary={summary} />

            <div className="charts">
              <ZoneDoughnut summary={summary} />
              <PaceLineChart rows={currentYearRows} />
              <ConsumptionLineChart rows={currentYearRows} />
              <ZoneStackChart rows={currentYearRows} />
            </div>

            <Analysis summary={summary} yearLabel={yearLabel} />
          </>
        )}

        <DataTable rows={currentYearRows} />
      </div>
      <Footer />
    </>
  );
}

export default App;
