import { useAuth } from "../contexts/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Prediction Game</h1>
          <button
            onClick={logout}
            className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 text-sm"
          >
            Log out
          </button>
        </div>
        <div className="bg-slate-800 rounded-lg p-6">
          <p className="text-slate-400">Welcome,</p>
          <p className="text-xl font-semibold">{user?.username}</p>
          <p className="text-slate-500 text-sm mt-1">{user?.email}</p>
        </div>
        <p className="text-slate-500 text-sm">
          Matches, predictions, and the leaderboard will show up here next.
        </p>
      </div>
    </div>
  );
}
