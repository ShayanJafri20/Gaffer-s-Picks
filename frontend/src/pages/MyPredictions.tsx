import { useEffect, useState } from "react";
import { api, ApiError, type Match, type Prediction } from "../lib/api";
import Layout from "../components/Layout";

function formatKickoff(iso: string) {
  const formatted = new Date(iso).toLocaleString("en-GB", {
    timeZone: "Asia/Karachi",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${formatted} PKT`;
}

export default function MyPredictions() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.myPredictions(), api.matches()])
      .then(([predictionList, matchList]) => {
        setPredictions(predictionList);
        setMatches(matchList);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const matchById = new Map(matches.map((m) => [m.id, m]));

  const byGameweek = new Map<number, { match: Match; prediction: Prediction }[]>();
  for (const prediction of predictions) {
    const match = matchById.get(prediction.match_id);
    if (!match) continue;
    const list = byGameweek.get(match.gameweek) ?? [];
    list.push({ match, prediction });
    byGameweek.set(match.gameweek, list);
  }
  const gameweeks = [...byGameweek.keys()].sort((a, b) => b - a);

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-white mb-6">My Predictions</h1>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : predictions.length === 0 ? (
        <p className="text-slate-400">You haven't made any predictions yet.</p>
      ) : (
        <div className="space-y-6">
          {gameweeks.map((gw) => {
            const entries = byGameweek
              .get(gw)!
              .sort((a, b) => a.match.kickoff_time.localeCompare(b.match.kickoff_time));
            return (
              <div key={gw}>
                <h2 className="text-slate-400 text-sm font-semibold uppercase tracking-wide mb-2">
                  Gameweek {gw}
                </h2>
                <div className="bg-slate-800 rounded-lg overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-900 text-slate-400 text-sm">
                      <tr>
                        <th className="px-4 py-2">Match</th>
                        <th className="px-4 py-2">Kickoff</th>
                        <th className="px-4 py-2">Your pick</th>
                        <th className="px-4 py-2">Result</th>
                        <th className="px-4 py-2">Status</th>
                        <th className="px-4 py-2 text-right">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map(({ match, prediction }) => {
                        const kickedOff = new Date(match.kickoff_time).getTime() <= Date.now();
                        return (
                          <tr key={match.id} className="border-t border-slate-700">
                            <td className="px-4 py-2 text-white">
                              {match.home_team} vs {match.away_team}
                            </td>
                            <td className="px-4 py-2 text-slate-400 text-sm whitespace-nowrap">
                              {formatKickoff(match.kickoff_time)}
                            </td>
                            <td className="px-4 py-2 text-slate-200">
                              {prediction.home_score_prediction}-{prediction.away_score_prediction}
                            </td>
                            <td className="px-4 py-2 text-slate-400">
                              {match.home_score !== null && match.away_score !== null
                                ? `${match.home_score}-${match.away_score}`
                                : "-"}
                            </td>
                            <td className="px-4 py-2">
                              <span
                                className={
                                  kickedOff ? "text-red-400 text-xs" : "text-green-400 text-xs"
                                }
                              >
                                {kickedOff ? "Locked" : "Editable"}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-right text-white font-medium">
                              {match.status === "FINISHED" ? prediction.points : "-"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
