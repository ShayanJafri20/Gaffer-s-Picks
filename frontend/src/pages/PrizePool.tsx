import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  api,
  ApiError,
  type MonthlyResult,
  type PrizePool as PrizePoolData,
} from "../lib/api";
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

export default function PrizePool() {
  const [pool, setPool] = useState<PrizePoolData | null>(null);
  const [current, setCurrent] = useState<MonthlyResult | null>(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function load() {
    api
      .prizePool()
      .then(setPool)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load prize pool"));
    api.currentMonth().then(setCurrent).catch(() => {});
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.addContribution(Number(amount));
      setAmount("");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add contribution");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">
          Prize Pool {pool && <span className="text-slate-400 font-normal">- {formatMonth(pool.period)}</span>}
        </h1>
        <Link to="/prize-history" className="text-purple-400 hover:text-purple-300 text-sm">
          Past months &rarr;
        </Link>
      </div>
      {error && <p className="text-red-400 mb-4">{error}</p>}

      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <p className="text-slate-400 text-sm">This month's pool</p>
        <p className="text-4xl font-bold text-white">
          Rs. {pool ? Number(pool.total).toLocaleString() : "..."}
        </p>
        <p className="text-slate-500 text-xs mt-2">
          Informational only - this app does not process real payments. Split 60/20/10
          between the top 3 scorers this month once it ends; settled between you and
          your friends outside the app.
        </p>
      </div>

      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <p className="text-white font-semibold mb-1">If the month ended today</p>
        <p className="text-slate-500 text-xs mb-4">
          Based on current standings - not final until the month ends.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {RANK_STYLE.map(({ label, color }, i) => {
            const winner = current?.winners[i];
            return (
              <div key={label} className="bg-slate-900 rounded-lg p-3 text-center">
                <p className={`text-xs font-semibold uppercase ${color}`}>{label}</p>
                <p className="text-white font-medium truncate mt-1">
                  {winner ? winner.username : "-"}
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  Rs. {winner ? Number(winner.payout).toLocaleString() : "0"}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {pool && !pool.has_contributed && (
        <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg p-4 flex gap-2 mb-6">
          <input
            type="number"
            min="1"
            step="0.01"
            placeholder="Your contribution amount for this month"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="flex-1 px-3 py-2 rounded bg-slate-700 text-white placeholder-slate-400"
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 text-white font-medium disabled:opacity-50"
          >
            Record
          </button>
        </form>
      )}
      {pool && pool.has_contributed && (
        <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 mb-6 text-sm text-green-300">
          You've contributed for {formatMonth(pool.period)} - predictions unlocked.
        </div>
      )}

      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-slate-400 text-sm">
            <tr>
              <th className="px-4 py-3">Player</th>
              <th className="px-4 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {pool?.contributions.map((c) => (
              <tr key={c.id} className="border-t border-slate-700">
                <td className="px-4 py-3 text-white">{c.username}</td>
                <td className="px-4 py-3 text-right text-slate-200">
                  Rs. {Number(c.amount).toLocaleString()}
                </td>
              </tr>
            ))}
            {pool?.contributions.length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-6 text-center text-slate-500">
                  Nobody's contributed yet this month.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
