import { useEffect, useState } from "react";
import { api, ApiError, type MonthlyResult } from "../lib/api";
import Layout from "../components/Layout";

const RANK_STYLE = [
  { label: "1st", color: "text-yellow-400" },
  { label: "2nd", color: "text-slate-300" },
  { label: "3rd", color: "text-orange-400" },
];

function formatMonth(period: string) {
  const [year, month] = period.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export default function MonthlyHistory() {
  const [months, setMonths] = useState<MonthlyResult[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .monthlyHistory()
      .then(setMonths)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load history"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-white mb-6">Monthly Champions</h1>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : months.length === 0 ? (
        <p className="text-slate-400">
          No completed months yet - check back once this month wraps up.
        </p>
      ) : (
        <div className="space-y-4">
          {months.map((month) => (
            <div key={month.period} className="bg-slate-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold text-lg">{formatMonth(month.period)}</h2>
                <span className="text-slate-400 text-sm">
                  Pool: Rs. {Number(month.total_pool).toLocaleString()}
                </span>
              </div>
              {month.winners.length === 0 ? (
                <p className="text-slate-500 text-sm">Nobody predicted this month.</p>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {RANK_STYLE.map(({ label, color }, i) => {
                    const winner = month.winners[i];
                    return (
                      <div key={label} className="bg-slate-900 rounded-lg p-3 text-center">
                        <p className={`text-xs font-semibold uppercase ${color}`}>{label}</p>
                        <p className="text-white font-medium truncate mt-1">
                          {winner ? winner.username : "-"}
                        </p>
                        <p className="text-slate-500 text-xs">
                          {winner ? `${winner.points} pts` : ""}
                        </p>
                        <p className="text-slate-400 text-sm mt-1">
                          Rs. {winner ? Number(winner.payout).toLocaleString() : "0"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
