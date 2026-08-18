import type { ReactNode } from "react";
import Logo from "./Logo";

const DECORATIVE_CRESTS = [
  { url: "https://crests.football-data.org/57.png", top: "8%", left: "10%", size: 70, rotate: -8 },
  { url: "https://crests.football-data.org/61.png", top: "70%", left: "6%", size: 60, rotate: 10 },
  { url: "https://crests.football-data.org/64.png", top: "15%", left: "88%", size: 65, rotate: 6 },
  { url: "https://crests.football-data.org/65.png", top: "75%", left: "90%", size: 55, rotate: -12 },
  { url: "https://crests.football-data.org/66.png", top: "45%", left: "3%", size: 45, rotate: 4 },
  { url: "https://crests.football-data.org/73.png", top: "50%", left: "94%", size: 50, rotate: -6 },
];

export default function AuthLayout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-purple-950/40 overflow-hidden">
      {DECORATIVE_CRESTS.map((c, i) => (
        <img
          key={i}
          src={c.url}
          alt=""
          className="absolute hidden sm:block opacity-10 pointer-events-none select-none"
          style={{
            top: c.top,
            left: c.left,
            width: c.size,
            height: c.size,
            transform: `rotate(${c.rotate}deg)`,
          }}
        />
      ))}

      <div className="relative z-10 w-full max-w-sm px-4">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        <div className="bg-slate-800/90 backdrop-blur border border-slate-700 p-8 rounded-xl shadow-xl space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            <p className="text-slate-400 text-sm mt-1">
              Predict every gameweek. Bragging rights guaranteed.
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
