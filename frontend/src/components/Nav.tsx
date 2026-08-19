import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { LogoMark } from "./Logo";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded text-sm font-medium whitespace-nowrap ${
    isActive ? "bg-purple-600 text-white" : "text-slate-300 hover:bg-slate-800"
  }`;

const MORE_PATHS = ["/table", "/prize-history", "/my-predictions", "/rules", "/admin"];

function MoreMenu() {
  const { user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const isActiveInMore = MORE_PATHS.some((p) => location.pathname.startsWith(p));

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`px-3 py-2 rounded text-sm font-medium whitespace-nowrap ${
          isActiveInMore ? "bg-purple-600 text-white" : "text-slate-300 hover:bg-slate-800"
        }`}
      >
        More &#9662;
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-44 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 py-1">
            <NavLink
              to="/table"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
            >
              Table
            </NavLink>
            <NavLink
              to="/prize-history"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
            >
              Champions
            </NavLink>
            <NavLink
              to="/my-predictions"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
            >
              My Predictions
            </NavLink>
            <NavLink
              to="/rules"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
            >
              Rules
            </NavLink>
            {user?.is_admin && (
              <NavLink
                to="/admin"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
              >
                Admin
              </NavLink>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function Nav() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-slate-900 border-b border-slate-800">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <LogoMark className="w-7 h-7" />
          <span className="text-white font-bold tracking-tight hidden sm:inline">
            Gaffer's Picks
          </span>
        </div>
        <div className="flex items-center gap-1">
          <NavLink to="/" end className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/matches" className={linkClass}>
            Matches
          </NavLink>
          <NavLink to="/leaderboard" className={linkClass}>
            Leaderboard
          </NavLink>
          <NavLink to="/prize-pool" className={linkClass}>
            Prize Pool
          </NavLink>
          <MoreMenu />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-slate-400 text-sm hidden sm:inline">{user?.username}</span>
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
