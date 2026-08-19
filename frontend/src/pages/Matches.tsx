import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError, type Match, type Prediction, type PredictionChoice } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import Layout from "../components/Layout";

const MAX_GAMEWEEK = 38;

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

function outcomeFor(home: number, away: number): PredictionChoice {
  return home > away ? "HOME" : home < away ? "AWAY" : "DRAW";
}

function MatchCard({
  match,
  prediction,
  onSave,
  isCurrentGameweek,
  hasContributed,
}: {
  match: Match;
  prediction: Prediction | undefined;
  onSave: (matchId: number, home: number, away: number) => void;
  isCurrentGameweek: boolean;
  hasContributed: boolean;
}) {
  const kickedOff = new Date(match.kickoff_time).getTime() <= Date.now();
  const isFinished = match.status === "FINISHED";
  const canPredict = !kickedOff && isCurrentGameweek && hasContributed;

  const [homeInput, setHomeInput] = useState(
    prediction?.home_score_prediction?.toString() ?? "",
  );
  const [awayInput, setAwayInput] = useState(
    prediction?.away_score_prediction?.toString() ?? "",
  );

  // What's currently typed but not necessarily saved yet.
  const pendingChoice =
    homeInput !== "" && awayInput !== ""
      ? outcomeFor(Number(homeInput), Number(awayInput))
      : null;

  // Whether the current inputs exactly match what's already saved on the server.
  const isSaved =
    prediction !== undefined &&
    prediction.home_score_prediction === (homeInput === "" ? null : Number(homeInput)) &&
    prediction.away_score_prediction === (awayInput === "" ? null : Number(awayInput));

  function pickTeam(choice: PredictionChoice) {
    if (choice === "HOME") {
      setHomeInput("1");
      setAwayInput("0");
    } else if (choice === "AWAY") {
      setHomeInput("0");
      setAwayInput("1");
    } else {
      setHomeInput("0");
      setAwayInput("0");
    }
  }

  function handleSave() {
    if (homeInput === "" || awayInput === "") return;
    onSave(match.id, Number(homeInput), Number(awayInput));
  }

  return (
    <div className="bg-slate-800 rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-center text-sm text-slate-400">
        <span>Gameweek {match.gameweek}</span>
        <span>
          {isFinished ? "FINAL" : match.status === "LIVE" ? "LIVE" : formatKickoff(match.kickoff_time)}
        </span>
      </div>

      <div className="flex items-center justify-between text-white text-lg font-semibold">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {match.home_team_crest && (
            <img src={match.home_team_crest} alt="" className="w-6 h-6 object-contain shrink-0" />
          )}
          <span className="truncate">{match.home_team}</span>
        </div>
        {match.home_score !== null && match.away_score !== null ? (
          <span className="text-2xl px-3 shrink-0">
            {match.home_score} - {match.away_score}
          </span>
        ) : (
          <span className="text-slate-500 text-sm px-3 shrink-0">vs</span>
        )}
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
          <span className="truncate">{match.away_team}</span>
          {match.away_team_crest && (
            <img src={match.away_team_crest} alt="" className="w-6 h-6 object-contain shrink-0" />
          )}
        </div>
      </div>

      {canPredict ? (
        <div className="space-y-2 pt-2">
          <div className="grid grid-cols-3 gap-2">
            {(["HOME", "DRAW", "AWAY"] as PredictionChoice[]).map((choice) => {
              const crest =
                choice === "HOME"
                  ? match.home_team_crest
                  : choice === "AWAY"
                    ? match.away_team_crest
                    : null;
              const isConfirmed = isSaved && pendingChoice === choice;
              const isPendingOnly = !isSaved && pendingChoice === choice;
              return (
                <button
                  key={choice}
                  onClick={() => pickTeam(choice)}
                  className={`py-2 rounded text-sm font-medium flex items-center justify-center gap-1.5 border ${
                    isConfirmed
                      ? "bg-green-600 border-green-500 text-white"
                      : isPendingOnly
                        ? "bg-slate-700 border-purple-500 text-slate-100"
                        : "bg-slate-700 border-transparent hover:bg-slate-600 text-slate-200"
                  }`}
                >
                  {crest && <img src={crest} alt="" className="w-4 h-4 object-contain" />}
                  <span className="truncate">
                    {choice === "HOME"
                      ? match.home_team
                      : choice === "AWAY"
                        ? match.away_team
                        : "Draw"}
                  </span>
                  {isConfirmed && <span>&#10003;</span>}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Score:</span>
            <input
              type="number"
              min="0"
              value={homeInput}
              onChange={(e) => setHomeInput(e.target.value)}
              className="w-14 px-2 py-1 rounded bg-slate-700 text-white text-center"
            />
            <span className="text-slate-500">-</span>
            <input
              type="number"
              min="0"
              value={awayInput}
              onChange={(e) => setAwayInput(e.target.value)}
              className="w-14 px-2 py-1 rounded bg-slate-700 text-white text-center"
            />
            <button
              onClick={handleSave}
              disabled={homeInput === "" || awayInput === "" || isSaved}
              className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40"
            >
              {isSaved ? "Saved" : "Save"}
            </button>
            <span className="text-slate-500 text-xs">
              exact score = +5, correct side only = +3
            </span>
          </div>
        </div>
      ) : (
        <div className="pt-2 text-sm">
          {prediction ? (
            <div className="flex items-center justify-between">
              <span className="text-slate-400">
                Your prediction:{" "}
                <span className="text-slate-200">
                  {prediction.home_score_prediction}-{prediction.away_score_prediction}
                </span>
              </span>
              {isFinished && (
                <span
                  className={prediction.points > 0 ? "text-green-400" : "text-slate-500"}
                >
                  {prediction.points > 0 ? `+${prediction.points} points` : "0 points"}
                </span>
              )}
            </div>
          ) : !hasContributed ? (
            <span className="text-slate-500">Add your contribution to unlock predictions</span>
          ) : !kickedOff ? (
            <span className="text-slate-500">
              Locked - opens once the current gameweek finishes
            </span>
          ) : (
            <span className="text-slate-500">No prediction made</span>
          )}
        </div>
      )}
    </div>
  );
}

export default function Matches() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [gameweek, setGameweek] = useState<number | null>(null);
  const [currentGameweek, setCurrentGameweek] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasContributed, setHasContributed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;
    api
      .prizePool()
      .then((pool) => setHasContributed(pool.has_contributed))
      .catch(() => setHasContributed(true)); // fail open - don't block on a network hiccup
  }, [user]);

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

  async function handleSave(matchId: number, home: number, away: number) {
    const choice = outcomeFor(home, away);
    try {
      const updated = await api.submitPrediction(matchId, choice, home, away);
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
            onClick={() => setGameweek((w) => Math.min(MAX_GAMEWEEK, (w ?? 1) + 1))}
            disabled={gameweek === MAX_GAMEWEEK}
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-sm text-slate-200 disabled:opacity-40"
          >
            Next &rarr;
          </button>
        </div>
      </div>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      {hasContributed === false && (
        <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-4 mb-6 flex items-center justify-between gap-4">
          <p className="text-slate-200 text-sm">
            Add your contribution to this month's prize pool before you can start predicting.
          </p>
          <Link
            to="/prize-pool"
            className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium whitespace-nowrap"
          >
            Add contribution
          </Link>
        </div>
      )}
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
              onSave={handleSave}
              isCurrentGameweek={gameweek === currentGameweek}
              hasContributed={hasContributed !== false}
            />
          ))}
        </div>
      )}
    </Layout>
  );
}
