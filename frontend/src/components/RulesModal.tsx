import { useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import RulesContent from "./RulesContent";

export default function RulesModal() {
  const { user, refreshUser } = useAuth();
  const [dismissing, setDismissing] = useState(false);

  if (!user || user.has_seen_rules) return null;

  async function handleDismiss() {
    setDismissing(true);
    try {
      await api.acknowledgeRules();
      await refreshUser();
    } finally {
      setDismissing(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 space-y-4">
        <h1 className="text-2xl font-bold text-white">Welcome! Here's how it works</h1>
        <RulesContent />
        <button
          onClick={handleDismiss}
          disabled={dismissing}
          className="w-full py-2 rounded bg-purple-600 hover:bg-purple-500 text-white font-medium disabled:opacity-50"
        >
          {dismissing ? "..." : "Got it, let's go"}
        </button>
      </div>
    </div>
  );
}
