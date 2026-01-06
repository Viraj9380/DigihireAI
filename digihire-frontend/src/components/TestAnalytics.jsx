import { useState } from "react";
import AnalyticsAnalysis from "./AnalyticsAnalysis";
import AnalyticsInsights from "./AnalyticsInsights";

export default function TestAnalytics({ testId }) {
  const [tab, setTab] = useState("analysis");

  return (
    <div>
      <div className="flex gap-6 border-b mb-4">
        {["analysis", "insights"].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 capitalize ${
              tab === t
                ? "border-b-2 border-blue-600 font-semibold"
                : "text-gray-500"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "analysis" && <AnalyticsAnalysis testId={testId} />}
      {tab === "insights" && <AnalyticsInsights testId={testId} />}
    </div>
  );
}
