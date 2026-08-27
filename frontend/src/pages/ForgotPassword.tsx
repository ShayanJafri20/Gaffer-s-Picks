import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import AuthLayout from "../components/AuthLayout";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <AuthLayout title="Check your email">
        <p className="text-slate-300 text-sm">
          If <span className="text-white">{email}</span> has an account, we've sent a
          password reset link to it. It expires in 1 hour.
        </p>
        <Link
          to="/login"
          className="block mt-4 text-purple-400 hover:text-purple-300 text-sm font-medium"
        >
          &larr; Back to login
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot password">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div>
          <label className="text-slate-400 text-xs font-medium">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-colors disabled:opacity-50"
        >
          {submitting ? "Sending..." : "Send reset link"}
        </button>
        <p className="text-slate-400 text-sm text-center">
          <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">
            Back to login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
