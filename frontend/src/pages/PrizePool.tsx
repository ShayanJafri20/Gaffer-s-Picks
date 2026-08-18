import { useEffect, useState, type FormEvent } from "react";
import { api, ApiError, type LeaderboardEntry, type PrizePool as PrizePoolData } from "../lib/api";
import Layout from "../components/Layout";

const PRIZE_SPLIT = [
  { place: "1st", pct: 0.6, color: "text-yellow-400" },
  { place: "2nd", pct: 0.2, color: "text-slate-300" },
  { place: "3rd", pct: 0.1, color: "text-orange-400" },
];

export default function PrizePool() {
  const [data, setData] = useState<PrizePoolData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function load() {
    api
      .prizePool()
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load prize pool"));
    api.leaderboard().then(setLeaderboard).catch(() => {});
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
      <h1 className="text-2xl font-bold text-white mb-6">Prize Pool</h1>
      {error && <p className="text-red-400 mb-4">{error}</p>}

      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <p className="text-slate-400 text-sm">Total pool</p>
        <p className="text-4xl font-bold text-white">
          Rs. {data ? Number(data.total).toLocaleString() : "..."}
        </p>
        <p className="text-slate-500 text-xs mt-2">
          Informational only — this app does not process real payments. The prize is
          settled between you and your friends outside the app.
        </p>
      </div>

      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <p className="text-white font-semibold mb-1">Prize Breakdown</p>
        <p className="text-slate-500 text-xs mb-4">
          60% to 1st, 20% to 2nd, 10% to 3rd — based on current leaderboard standing, not
          final until the season ends.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {PRIZE_SPLIT.map(({ place, pct, color }, i) => {
            const total = data ? Number(data.total) : 0;
            const entry = leaderboard[i];
            return (
              <div key={place} className="bg-slate-900 rounded-lg p-3 text-center">
                <p className={`text-xs font-semibold uppercase ${color}`}>{place}</p>
                <p className="text-white font-medium truncate mt-1">
                  {entry ? entry.username : "-"}
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  Rs. {Math.round(total * pct).toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg p-4 flex gap-2 mb-6">
        <input
          type="number"
          min="1"
          step="0.01"
          placeholder="Your contribution amount"
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

      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-slate-400 text-sm">
            <tr>
              <th className="px-4 py-3">Contribution ID</th>
              <th className="px-4 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data?.contributions.map((c) => (
              <tr key={c.id} className="border-t border-slate-700">
                <td className="px-4 py-3 text-slate-300">#{c.id}</td>
                <td className="px-4 py-3 text-right text-white">
                  Rs. {Number(c.amount).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
