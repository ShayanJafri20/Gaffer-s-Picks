import { useEffect, useState } from "react";
import { api, ApiError, type StandingsRow } from "../lib/api";
import Layout from "../components/Layout";

export default function Standings() {
  const [rows, setRows] = useState<StandingsRow[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .standings()
      .then(setRows)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load table"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-white mb-6">Premier League Table</h1>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : (
        <div className="bg-slate-800 rounded-lg overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-900 text-slate-400 text-sm">
              <tr>
                <th className="px-3 py-3">#</th>
                <th className="px-3 py-3">Team</th>
                <th className="px-3 py-3 text-center">P</th>
                <th className="px-3 py-3 text-center">W</th>
                <th className="px-3 py-3 text-center">D</th>
                <th className="px-3 py-3 text-center">L</th>
                <th className="px-3 py-3 text-center">GF</th>
                <th className="px-3 py-3 text-center">GA</th>
                <th className="px-3 py-3 text-center">GD</th>
                <th className="px-3 py-3 text-center font-semibold">Pts</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.position} className="border-t border-slate-700">
                  <td className="px-3 py-2 text-slate-400">{row.position}</td>
                  <td className="px-3 py-2 text-white">
                    <div className="flex items-center gap-2">
                      {row.team_crest && (
                        <img src={row.team_crest} alt="" className="w-5 h-5 object-contain" />
                      )}
                      <span>{row.team_name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center text-slate-300">{row.played}</td>
                  <td className="px-3 py-2 text-center text-slate-300">{row.won}</td>
                  <td className="px-3 py-2 text-center text-slate-300">{row.draw}</td>
                  <td className="px-3 py-2 text-center text-slate-300">{row.lost}</td>
                  <td className="px-3 py-2 text-center text-slate-300">{row.goals_for}</td>
                  <td className="px-3 py-2 text-center text-slate-300">{row.goals_against}</td>
                  <td className="px-3 py-2 text-center text-slate-300">
                    {row.goal_difference}
                  </td>
                  <td className="px-3 py-2 text-center text-white font-semibold">
                    {row.points}
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
