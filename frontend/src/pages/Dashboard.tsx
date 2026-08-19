import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api, type MyRank } from "../lib/api";
import Layout from "../components/Layout";

export default function Dashboard() {
  const { user } = useAuth();
  const [rank, setRank] = useState<MyRank | null>(null);

  useEffect(() => {
    api.myRank().then(setRank).catch(() => {});
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <p className="text-slate-400">Welcome back,</p>
          <p className="text-2xl font-bold text-white">{user?.username}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Your Rank</p>
            <p className="text-2xl font-bold text-white">
              {rank ? `#${rank.rank}` : "..."}
            </p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Total Points</p>
            <p className="text-2xl font-bold text-white">{rank?.total_points ?? "..."}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Correct Picks</p>
            <p className="text-2xl font-bold text-white">
              {rank ? `${rank.correct_predictions}/${rank.total_predictions}` : "..."}
            </p>
          </div>
        </div>

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
