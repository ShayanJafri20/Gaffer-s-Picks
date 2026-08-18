import { useEffect, useState, type FormEvent } from "react";
import { api, ApiError, type User } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import Layout from "../components/Layout";

export default function Admin() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newIsAdmin, setNewIsAdmin] = useState(false);
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");

  function load() {
    setLoading(true);
    api
      .adminListUsers()
      .then(setUsers)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load users"))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError("");
    setCreating(true);
    try {
      await api.adminCreateUser(newUsername, newEmail, newPassword, newIsAdmin);
      setNewUsername("");
      setNewEmail("");
      setNewPassword("");
      setNewIsAdmin(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create user");
    } finally {
      setCreating(false);
    }
  }

  function startEdit(u: User) {
    setEditingId(u.id);
    setEditUsername(u.username);
    setEditEmail(u.email);
  }

  async function saveEdit(userId: number) {
    setError("");
    try {
      await api.adminUpdateUser(userId, { username: editUsername, email: editEmail });
      setEditingId(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update user");
    }
  }

  async function toggleAdmin(u: User) {
    setError("");
    try {
      await api.adminUpdateUser(u.id, { is_admin: !u.is_admin });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update user");
    }
  }

  async function toggleHidden(u: User) {
    setError("");
    try {
      await api.adminUpdateUser(u.id, { hide_from_leaderboard: !u.hide_from_leaderboard });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update user");
    }
  }

  async function handleDelete(u: User) {
    if (!confirm(`Remove ${u.username}? This deletes their predictions and contributions too.`)) {
      return;
    }
    setError("");
    try {
      await api.adminDeleteUser(u.id);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete user");
    }
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-white mb-6">Admin: Users</h1>
      {error && <p className="text-red-400 mb-4">{error}</p>}

      <form
        onSubmit={handleCreate}
        className="bg-slate-800 rounded-lg p-4 mb-6 flex flex-wrap gap-2 items-center"
      >
        <input
          placeholder="Username"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          required
          className="px-3 py-2 rounded bg-slate-700 text-white placeholder-slate-400 flex-1 min-w-[120px]"
        />
        <input
          type="email"
          placeholder="Email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          required
          className="px-3 py-2 rounded bg-slate-700 text-white placeholder-slate-400 flex-1 min-w-[160px]"
        />
        <input
          type="password"
          placeholder="Password (min 8 chars)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={8}
          className="px-3 py-2 rounded bg-slate-700 text-white placeholder-slate-400 flex-1 min-w-[160px]"
        />
        <label className="flex items-center gap-1.5 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={newIsAdmin}
            onChange={(e) => setNewIsAdmin(e.target.checked)}
          />
          Admin
        </label>
        <button
          type="submit"
          disabled={creating}
          className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 text-white font-medium disabled:opacity-50"
        >
          Add user
        </button>
      </form>

      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : (
        <div className="bg-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-slate-400 text-sm">
              <tr>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Admin</th>
                <th className="px-4 py-3">Leaderboard</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-slate-700">
                  {editingId === u.id ? (
                    <>
                      <td className="px-4 py-2">
                        <input
                          value={editUsername}
                          onChange={(e) => setEditUsername(e.target.value)}
                          className="px-2 py-1 rounded bg-slate-700 text-white w-full"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="px-2 py-1 rounded bg-slate-700 text-white w-full"
                        />
                      </td>
                      <td className="px-4 py-2 text-slate-400">{u.is_admin ? "Yes" : "No"}</td>
                      <td className="px-4 py-2 text-slate-400">
                        {u.hide_from_leaderboard ? "Hidden" : "Visible"}
                      </td>
                      <td className="px-4 py-2 text-right space-x-2">
                        <button
                          onClick={() => saveEdit(u.id)}
                          className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white text-sm"
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-white">{u.username}</td>
                      <td className="px-4 py-3 text-slate-400">{u.email}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleAdmin(u)}
                          disabled={u.id === me?.id}
                          className={`text-xs px-2 py-1 rounded ${
                            u.is_admin
                              ? "bg-purple-900/50 text-purple-300"
                              : "bg-slate-700 text-slate-300"
                          } disabled:opacity-50`}
                        >
                          {u.is_admin ? "Admin" : "Make admin"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleHidden(u)}
                          className={`text-xs px-2 py-1 rounded ${
                            u.hide_from_leaderboard
                              ? "bg-slate-700 text-slate-400"
                              : "bg-green-900/40 text-green-300"
                          }`}
                        >
                          {u.hide_from_leaderboard ? "Hidden" : "Visible"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => startEdit(u)}
                          className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          disabled={u.id === me?.id}
                          className="px-3 py-1 rounded bg-red-900/50 hover:bg-red-900 text-red-200 text-sm disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
