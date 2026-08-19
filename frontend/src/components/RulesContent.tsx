export default function RulesContent() {
  return (
    <div className="space-y-6 text-slate-300">
      <section>
        <h2 className="text-white font-semibold mb-2">How predictions work</h2>
        <p>
          Before each match kicks off, pick who you think will win — Home, Draw, or
          Away. Once the match starts, your prediction locks and can't be changed.
        </p>
      </section>

      <section>
        <h2 className="text-white font-semibold mb-2">Points</h2>
        <ul className="space-y-1.5">
          <li>
            <span className="text-green-400 font-medium">+3 points</span> — you predicted
            the correct outcome (Home win / Draw / Away win)
          </li>
          <li>
            <span className="text-purple-400 font-medium">+5 points</span> — you predicted
            the <span className="italic">exact scoreline</span> (e.g. Arsenal 2-1 Chelsea).
            This replaces the +3, it's not on top of it.
          </li>
          <li>
            <span className="text-slate-500 font-medium">0 points</span> — wrong
            prediction. Nothing is deducted, ever.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-white font-semibold mb-2">Gameweeks</h2>
        <p>
          Only the current gameweek is open for predictions. Once every match in it
          finishes, the next gameweek unlocks automatically — you can't get ahead and
          predict future weeks early.
        </p>
      </section>

      <section>
        <h2 className="text-white font-semibold mb-2">Leaderboard & monthly winners</h2>
        <p>
          The leaderboard resets every month — it only ranks points earned within the
          current calendar month. When the month ends, the top 3 scorers split that
          month's prize pool: 60% to 1st, 20% to 2nd, 10% to 3rd. Then it all resets and
          a new month starts.
        </p>
      </section>

      <section>
        <h2 className="text-white font-semibold mb-2">Prize pool</h2>
        <p>
          Add your contribution amount at the start of each month — this is required
          before you can predict that month's matches. This is purely a record — the
          app never processes real payments. Points and money are completely separate:
          the leaderboard never depends on who contributed, and contributing never
          affects your points. The actual prize money is settled between you and your
          friends outside the app. You can check past months' winners on the
          Champions page anytime.
        </p>
      </section>
    </div>
  );
}
