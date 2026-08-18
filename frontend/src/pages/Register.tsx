import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ApiError } from "../lib/api";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(username, email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed");
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
        <h1 className="text-2xl font-bold text-white">Register</h1>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full px-3 py-2 rounded bg-slate-700 text-white placeholder-slate-400"
        />
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
          placeholder="Password (min 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="w-full px-3 py-2 rounded bg-slate-700 text-white placeholder-slate-400"
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2 rounded bg-purple-600 hover:bg-purple-500 text-white font-medium disabled:opacity-50"
        >
          {submitting ? "Creating account..." : "Register"}
        </button>
        <p className="text-slate-400 text-sm text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-400 hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
