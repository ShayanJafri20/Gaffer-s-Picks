const API_BASE = "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, body.detail ?? "Request failed");
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

export interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  has_seen_rules: boolean;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export type MatchStatus = "SCHEDULED" | "LIVE" | "FINISHED" | "POSTPONED";
export type PredictionChoice = "HOME" | "DRAW" | "AWAY";

export interface Match {
  id: number;
  gameweek: number;
  home_team: string;
  away_team: string;
  home_team_crest: string | null;
  away_team_crest: string | null;
  kickoff_time: string;
  home_score: number | null;
  away_score: number | null;
  status: MatchStatus;
}

export interface Prediction {
  id: number;
  match_id: number;
  prediction: PredictionChoice;
  home_score_prediction: number | null;
  away_score_prediction: number | null;
  points: number;
  created_at: string;
  updated_at: string;
  locked_at: string | null;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  total_points: number;
  correct_predictions: number;
  total_predictions: number;
}

export interface MyRank {
  rank: number;
  total_points: number;
  correct_predictions: number;
  total_predictions: number;
}

export interface Contribution {
  id: number;
  user_id: number;
  amount: string;
  created_at: string;
}

export interface PrizePool {
  total: string;
  contributions: Contribution[];
}

export interface StandingsRow {
  position: number;
  team_name: string;
  team_crest: string | null;
  played: number;
  won: number;
  draw: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}

export const api = {
  register: (username: string, email: string, password: string) =>
    request<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    }),

  login: (email: string, password: string) =>
    request<Token>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<User>("/auth/me"),

  acknowledgeRules: () => request<User>("/auth/acknowledge-rules", { method: "POST" }),

  matches: (gameweek?: number) =>
    request<Match[]>(gameweek ? `/matches?gameweek=${gameweek}` : "/matches"),

  currentGameweek: () => request<{ gameweek: number }>("/matches/current-gameweek"),

  myPredictions: () => request<Prediction[]>("/predictions/me"),

  submitPrediction: (
    matchId: number,
    prediction: PredictionChoice,
    homeScorePrediction?: number,
    awayScorePrediction?: number,
  ) =>
    request<Prediction>(`/matches/${matchId}/prediction`, {
      method: "POST",
      body: JSON.stringify({
        prediction,
        home_score_prediction: homeScorePrediction ?? null,
        away_score_prediction: awayScorePrediction ?? null,
      }),
    }),

  leaderboard: () => request<LeaderboardEntry[]>("/leaderboard"),

  myRank: () => request<MyRank>("/leaderboard/me"),

  prizePool: () => request<PrizePool>("/contributions"),

  addContribution: (amount: number) =>
    request<Contribution>("/contributions", {
      method: "POST",
      body: JSON.stringify({ amount }),
    }),

  adminListUsers: () => request<User[]>("/admin/users"),

  adminCreateUser: (username: string, email: string, password: string, is_admin: boolean) =>
    request<User>("/admin/users", {
      method: "POST",
      body: JSON.stringify({ username, email, password, is_admin }),
    }),

  adminUpdateUser: (
    userId: number,
    updates: Partial<{ username: string; email: string; is_admin: boolean }>,
  ) =>
    request<User>(`/admin/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    }),

  adminDeleteUser: (userId: number) =>
    request<void>(`/admin/users/${userId}`, { method: "DELETE" }),

  standings: () => request<StandingsRow[]>("/standings"),
};
