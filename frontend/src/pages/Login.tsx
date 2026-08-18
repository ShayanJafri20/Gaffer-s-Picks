import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ApiError } from "../lib/api";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-800 p-8 rounded-lg w-full max-w-sm space-y-4"
      >
        <h1 className="text-2xl font-bold text-white">Log in</h1>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 rounded bg-slate-700 text-white placeholder-slate-400"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 rounded bg-slate-700 text-white placeholder-slate-400"
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2 rounded bg-purple-600 hover:bg-purple-500 text-white font-medium disabled:opacity-50"
        >
          {submitting ? "Logging in..." : "Log in"}
        </button>
        <p className="text-slate-400 text-sm text-center">
          No account?{" "}
          <Link to="/register" className="text-purple-400 hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
