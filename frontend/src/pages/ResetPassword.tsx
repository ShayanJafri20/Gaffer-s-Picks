import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import AuthLayout from "../components/AuthLayout";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.resetPassword(token, password);
      navigate("/login");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <AuthLayout title="Invalid link">
        <p className="text-slate-300 text-sm">
          This reset link is missing its token. Request a new one from the login page.
        </p>
        <Link
          to="/forgot-password"
          className="block mt-4 text-purple-400 hover:text-purple-300 text-sm font-medium"
        >
          &larr; Request a new link
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Set a new password">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-red-400 text-sm">
            {error}
            {error.toLowerCase().includes("expired") || error.toLowerCase().includes("invalid") ? (
              <>
                {" "}
                <Link to="/forgot-password" className="text-purple-400 hover:text-purple-300">
                  Request a new one
                </Link>
              </>
            ) : null}
          </div>
        )}
        <div>
          <label className="text-slate-400 text-xs font-medium">New password</label>
          <input
            type="password"
            placeholder="Min 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-colors disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Reset password"}
        </button>
      </form>
    </AuthLayout>
  );
}
