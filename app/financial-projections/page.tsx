import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import ProjectionBuilder from "./projection-builder";

export default async function FinancialProjectionsPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const params = await searchParams;
  if (!isSupabaseConfigured()) {
    return <main className="min-h-screen p-8"><Link href="/" className="text-sm text-blue-300">← Back to CRM</Link><h1 className="mt-5 text-3xl font-semibold">Five-year financial projections</h1><div className="mt-6 max-w-2xl rounded-2xl border border-amber-400/30 bg-amber-400/10 p-6"><b className="text-amber-100">Supabase setup required</b><p className="mt-2 text-sm leading-6 text-amber-100/80">Connect the development Supabase project and apply the CRM and financial-projection migrations before using this module.</p></div></main>;
  }

  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await db.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !["admin", "manager", "analyst"].includes(profile.role)) redirect("/access-denied");

  const [{ data: companies, error: companiesError }, { data: models, error: modelsError }] = await Promise.all([
    db.from("companies").select("id,name").order("name"),
    db.from("financial_projection_models").select("id,business_name,owner_name,status,created_at").order("created_at", { ascending: false }).limit(10),
  ]);
  if (companiesError) throw new Error("Unable to load applicant businesses.");
  if (modelsError) throw new Error("Unable to load saved projections. Confirm the financial-projections migration has been applied.");

  return (
    <main className="min-h-screen px-5 py-7 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <Link href="/" className="text-sm text-blue-300 hover:text-blue-200">← Back to CRM</Link>
        <div className="mt-5 border-b border-line pb-6">
          <p className="text-xs uppercase tracking-[.22em] text-blue-300">CORE Intelligence / Financial modelling</p>
          <h1 className="mt-2 text-3xl font-semibold">Five-year financial projections</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Prepare and review applicant projections using the five sections in the NYDF financial projection template. All figures are in Namibian dollars.
          </p>
        </div>
        {params.saved && <p className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">Projection saved as a draft.</p>}
        {params.error && <p className="mt-5 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">Could not save the projection. Check the applicant details and database migration.</p>}
        {companies?.length ? <ProjectionBuilder companies={companies} /> : <div className="mt-7 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5 text-sm text-amber-100">Create the applicant business in Companies before preparing its projection.</div>}
        <section className="mt-8 rounded-2xl border border-line bg-panel p-5">
          <h2 className="font-semibold">Recently saved projections</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-xs">
              <thead className="text-slate-500"><tr><th className="pb-3">Business</th><th className="pb-3">Owner</th><th className="pb-3">Status</th><th className="pb-3 text-right">Created</th></tr></thead>
              <tbody>{(models ?? []).map(model => <tr key={model.id} className="border-t border-line"><td className="py-3">{model.business_name}</td><td className="py-3 text-slate-400">{model.owner_name || "—"}</td><td className="py-3 capitalize text-slate-400">{model.status.replaceAll("_", " ")}</td><td className="py-3 text-right text-slate-500">{new Date(model.created_at).toLocaleDateString("en-NA")}</td></tr>)}</tbody>
            </table>
            {!models?.length && <p className="py-5 text-sm text-slate-500">No projections saved yet.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
