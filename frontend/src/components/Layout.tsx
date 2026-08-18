import type { ReactNode } from "react";
import Nav from "./Nav";
import RulesModal from "./RulesModal";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950">
      <Nav />
      <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
      <RulesModal />
    </div>
  );
}
