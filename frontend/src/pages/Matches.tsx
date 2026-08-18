import { useEffect, useState } from "react";
import { api, ApiError, type Match, type Prediction, type PredictionChoice } from "../lib/api";
import Layout from "../components/Layout";

function formatKickoff(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MatchCard({
  match,
  prediction,
  onPredict,
}: {
  match: Match;
  prediction: Prediction | undefined;
  onPredict: (matchId: number, choice: PredictionChoice) => void;
}) {
  const kickedOff = new Date(match.kickoff_time).getTime() <= Date.now();
  const isFinished = match.status === "FINISHED";

  return (
    <div className="bg-slate-800 rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-center text-sm text-slate-400">
        <span>Gameweek {match.gameweek}</span>
        <span>
          {isFinished ? "FINAL" : match.status === "LIVE" ? "LIVE" : formatKickoff(match.kickoff_time)}
        </span>
      </div>

      <div className="flex items-center justify-between text-white text-lg font-semibold">
        <span>{match.home_team}</span>
        {match.home_score !== null && match.away_score !== null ? (
          <span className="text-2xl">
            {match.home_score} - {match.away_score}
          </span>
        ) : (
          <span className="text-slate-500 text-sm">vs</span>
        )}
        <span>{match.away_team}</span>
      </div>

      {!kickedOff ? (
        <div className="grid grid-cols-3 gap-2 pt-2">
          {(["HOME", "DRAW", "AWAY"] as PredictionChoice[]).map((choice) => (
            <button
              key={choice}
              onClick={() => onPredict(match.id, choice)}
              className={`py-2 rounded text-sm font-medium ${
                prediction?.prediction === choice
                  ? "bg-purple-600 text-white"
                  : "bg-slate-700 hover:bg-slate-600 text-slate-200"
              }`}
            >
              {choice === "HOME" ? match.home_team : choice === "AWAY" ? match.away_team : "Draw"}
            </button>
          ))}
        </div>
      ) : (
        <div className="pt-2 text-sm">
          {prediction ? (
            <div className="flex items-center justify-between">
              <span className="text-slate-400">
                Your prediction: <span className="text-slate-200">{prediction.prediction}</span>
              </span>
              {isFinished && (
                <span
                  className={prediction.points > 0 ? "text-green-400" : "text-slate-500"}
                >
                  {prediction.points > 0 ? `+${prediction.points} points` : "0 points"}
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-500">No prediction made</span>
          )}
        </div>
      )}
    </div>
  );
}

export default function Matches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [gameweek, setGameweek] = useState<number | null>(null);
  const [currentGameweek, setCurrentGameweek] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load(week: number) {
    setLoading(true);
    try {
      const [matchList, predictionList] = await Promise.all([
        api.matches(week),
        api.myPredictions(),
      ]);
      setMatches(matchList);
      setPredictions(predictionList);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load matches");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    api.currentGameweek().then(({ gameweek }) => {
      setCurrentGameweek(gameweek);
      setGameweek(gameweek);
    });
  }, []);

  useEffect(() => {
    if (gameweek !== null) load(gameweek);
  }, [gameweek]);

  async function handlePredict(matchId: number, choice: PredictionChoice) {
    try {
      const updated = await api.submitPrediction(matchId, choice);
      setPredictions((prev) => [updated, ...prev.filter((p) => p.match_id !== matchId)]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to submit prediction");
    }
  }

  const predictionByMatch = new Map(predictions.map((p) => [p.match_id, p]));

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">
          Gameweek {gameweek ?? "..."}
          {gameweek === currentGameweek && (
            <span className="ml-2 text-xs uppercase tracking-wide text-purple-400 align-middle">
              Current
            </span>
          )}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setGameweek((w) => Math.max(1, (w ?? 1) - 1))}
            disabled={gameweek === 1}
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-sm text-slate-200 disabled:opacity-40"
          >
            &larr; Prev
          </button>
          <button
            onClick={() => setGameweek((w) => (w ?? 1) + 1)}
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-sm text-slate-200"
          >
            Next &rarr;
          </button>
        </div>
      </div>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : matches.length === 0 ? (
        <p className="text-slate-400">
          No matches in this gameweek.
        </p>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              prediction={predictionByMatch.get(match.id)}
              onPredict={handlePredict}
            />
          ))}
        </div>
      )}
    </Layout>
  );
}
