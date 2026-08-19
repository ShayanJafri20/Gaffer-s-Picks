import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  api,
  type MonthlyResult,
  type MyMonthSummary,
  type MyRank,
  type PrizePool,
} from "../lib/api";
import Layout from "../components/Layout";

function formatMonth(period: string) {
  const [year, month] = period.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function NewMonthBanner({ pool }: { pool: PrizePool }) {
  const { user, refreshUser } = useAuth();
  const [lastMonth, setLastMonth] = useState<MonthlyResult | null | undefined>(undefined);
  const [dismissing, setDismissing] = useState(false);

  useEffect(() => {
    api
      .monthlyHistory()
      .then((history) => setLastMonth(history[0] ?? null))
      .catch(() => setLastMonth(null));
  }, []);

  const shouldShow =
    lastMonth !== undefined &&
    lastMonth !== null &&
    user !== null &&
    user.last_seen_month !== pool.period;

  if (!shouldShow || !lastMonth) return null;

  async function handleDismiss() {
    setDismissing(true);
    try {
      await api.acknowledgeMonth();
      await refreshUser();
    } finally {
      setDismissing(false);
    }
  }

  return (
    <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-4 space-y-2">
      <p className="text-white font-semibold">New month, new prize pool!</p>
      {lastMonth.winners.length > 0 ? (
        <p className="text-slate-300 text-sm">
          {lastMonth.winners[0].username} won {formatMonth(lastMonth.period)}'s pool - Rs.{" "}
          {Number(lastMonth.winners[0].payout).toLocaleString()}
          {lastMonth.winners.length > 1 &&
            ` (with ${lastMonth.winners
              .slice(1)
              .map((w) => w.username)
              .join(" and ")} rounding out the top ${lastMonth.winners.length})`}
          .
        </p>
      ) : (
        <p className="text-slate-300 text-sm">
          Nobody predicted in {formatMonth(lastMonth.period)}.
        </p>
      )}
      <p className="text-slate-400 text-sm">
        Contribute to this month's pool to keep predicting.
      </p>
      <button
        onClick={handleDismiss}
        disabled={dismissing}
        className="mt-1 px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium disabled:opacity-50"
      >
        Got it
      </button>
    </div>
  );
}

function MyPrizeHistory() {
  const [summaries, setSummaries] = useState<MyMonthSummary[] | null>(null);

  useEffect(() => {
    api.myMonthlySummaries().then(setSummaries).catch(() => setSummaries([]));
  }, []);

  if (!summaries || summaries.length === 0) return null;

  const totalContributed = summaries.reduce((sum, s) => sum + Number(s.contributed), 0);
  const totalWon = summaries.reduce((sum, s) => sum + Number(s.won), 0);
  const net = totalWon - totalContributed;

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold">Your Prize History</h2>
        <p className={`text-sm font-semibold ${net >= 0 ? "text-green-400" : "text-red-400"}`}>
          Net: {net >= 0 ? "+" : ""}
          Rs. {net.toLocaleString()}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-slate-400 text-xs">Total contributed</p>
          <p className="text-lg font-semibold text-white">
            Rs. {totalContributed.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-slate-400 text-xs">Total won</p>
          <p className="text-lg font-semibold text-white">Rs. {totalWon.toLocaleString()}</p>
        </div>
      </div>
      <div className="space-y-1.5">
        {summaries.map((s) => {
          const won = Number(s.won);
          return (
            <div
              key={s.period}
              className="flex items-center justify-between text-sm border-t border-slate-700 pt-1.5 first:border-t-0 first:pt-0"
            >
              <span className="text-slate-400">{formatMonth(s.period)}</span>
              <span className="text-slate-300">
                Contributed Rs. {Number(s.contributed).toLocaleString()}
              </span>
              <span className={won > 0 ? "text-green-400 font-medium" : "text-slate-500"}>
                {won > 0 ? `Won Rs. ${won.toLocaleString()}` : "Didn't place"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [rank, setRank] = useState<MyRank | null>(null);
  const [pool, setPool] = useState<PrizePool | null>(null);

  useEffect(() => {
    api.myRank().then(setRank).catch(() => {});
    api.prizePool().then(setPool).catch(() => {});
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <p className="text-slate-400">Welcome back,</p>
          <p className="text-2xl font-bold text-white">{user?.username}</p>
        </div>

        {pool && <NewMonthBanner pool={pool} />}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Your Rank</p>
            <p className="text-2xl font-bold text-white">
              {rank ? `#${rank.rank}` : "..."}
            </p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Points This Month</p>
            <p className="text-2xl font-bold text-white">{rank?.total_points ?? "..."}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Correct Picks</p>
            <p className="text-2xl font-bold text-white">
              {rank ? `${rank.correct_predictions}/${rank.total_predictions}` : "..."}
            </p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-slate-400 text-sm">This Month's Pool</p>
            <p className="text-2xl font-bold text-white">
              {pool ? `Rs. ${Number(pool.total).toLocaleString()}` : "..."}
            </p>
          </div>
        </div>

        <MyPrizeHistory />

        <div className="flex flex-wrap gap-3">
          <Link
            to="/matches"
            className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium"
          >
            Make Predictions
          </Link>
          <Link
            to="/leaderboard"
            className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium"
          >
            View Leaderboard
          </Link>
          <Link
            to="/my-predictions"
            className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium"
          >
            My Predictions
          </Link>
        </div>
      </div>
    </Layout>
  );
}
