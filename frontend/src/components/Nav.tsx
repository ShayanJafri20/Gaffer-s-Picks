import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded text-sm font-medium ${
    isActive ? "bg-purple-600 text-white" : "text-slate-300 hover:bg-slate-800"
  }`;

export default function Nav() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-slate-900 border-b border-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <NavLink to="/" end className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/matches" className={linkClass}>
            Matches
          </NavLink>
          <NavLink to="/table" className={linkClass}>
            Table
          </NavLink>
          <NavLink to="/leaderboard" className={linkClass}>
            Leaderboard
          </NavLink>
          <NavLink to="/prize-pool" className={linkClass}>
            Prize Pool
          </NavLink>
          <NavLink to="/rules" className={linkClass}>
            Rules
          </NavLink>
          {user?.is_admin && (
            <NavLink to="/admin" className={linkClass}>
              Admin
            </NavLink>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-sm">{user?.username}</span>
          <button
            onClick={logout}
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-sm text-slate-200"
          >
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
}
