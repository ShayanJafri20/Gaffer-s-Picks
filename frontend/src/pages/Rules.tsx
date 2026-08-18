import Layout from "../components/Layout";
import RulesContent from "../components/RulesContent";

export default function Rules() {
  return (
    <Layout>
      <h1 className="text-2xl font-bold text-white mb-6">Rules</h1>
      <div className="bg-slate-800 rounded-lg p-6">
        <RulesContent />
      </div>
    </Layout>
  );
}
