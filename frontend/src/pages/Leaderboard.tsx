import { useEffect, useState } from "react";
import { api, ApiError, type LeaderboardEntry } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import Layout from "../components/Layout";

export default function Leaderboard() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .leaderboard()
      .then(setEntries)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load leaderboard"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-white mb-6">Leaderboard</h1>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : (
        <div className="bg-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-slate-400 text-sm">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Player</th>
                <th className="px-4 py-3 text-center">Total</th>
                <th className="px-4 py-3 text-center">Correct</th>
                <th className="px-4 py-3 text-center">Wrong</th>
                <th className="px-4 py-3 text-right">Points</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr
                  key={entry.user_id}
                  className={`border-t border-slate-700 ${
                    entry.user_id === user?.id ? "bg-purple-900/30" : ""
                  }`}
                >
                  <td className="px-4 py-3 text-slate-300">{entry.rank}</td>
                  <td className="px-4 py-3 text-white font-medium">{entry.username}</td>
                  <td className="px-4 py-3 text-slate-400 text-center">
                    {entry.total_predictions}
                  </td>
                  <td className="px-4 py-3 text-green-400 text-center">
                    {entry.correct_predictions}
                  </td>
                  <td className="px-4 py-3 text-red-400 text-center">
                    {entry.wrong_predictions}
                  </td>
                  <td className="px-4 py-3 text-right text-white font-semibold">
                    {entry.total_points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
