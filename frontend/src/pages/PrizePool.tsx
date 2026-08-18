import { useEffect, useState, type FormEvent } from "react";
import { api, ApiError, type PrizePool as PrizePoolData } from "../lib/api";
import Layout from "../components/Layout";

export default function PrizePool() {
  const [data, setData] = useState<PrizePoolData | null>(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function load() {
    api
      .prizePool()
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load prize pool"));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.addContribution(Number(amount));
      setAmount("");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add contribution");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-white mb-6">Prize Pool</h1>
      {error && <p className="text-red-400 mb-4">{error}</p>}

      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <p className="text-slate-400 text-sm">Total pool</p>
        <p className="text-4xl font-bold text-white">
          Rs. {data ? Number(data.total).toLocaleString() : "..."}
        </p>
        <p className="text-slate-500 text-xs mt-2">
          Informational only — this app does not process real payments. The prize is
          settled between you and your friends outside the app.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg p-4 flex gap-2 mb-6">
        <input
          type="number"
          min="1"
          step="0.01"
          placeholder="Your contribution amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="flex-1 px-3 py-2 rounded bg-slate-700 text-white placeholder-slate-400"
        />
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 text-white font-medium disabled:opacity-50"
        >
          Record
        </button>
      </form>

      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-slate-400 text-sm">
            <tr>
              <th className="px-4 py-3">Contribution ID</th>
              <th className="px-4 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data?.contributions.map((c) => (
              <tr key={c.id} className="border-t border-slate-700">
                <td className="px-4 py-3 text-slate-300">#{c.id}</td>
                <td className="px-4 py-3 text-right text-white">
                  Rs. {Number(c.amount).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
