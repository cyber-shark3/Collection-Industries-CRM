import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProjectionBuilder from "./projection-builder";

export default async function FinancialProjectionsPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const params = await searchParams;
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await db.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !["admin", "manager", "analyst"].includes(profile.role)) redirect("/access-denied");

  const { data: companies, error } = await db.from("companies").select("id,name").order("name");
  if (error) throw new Error("Unable to load applicant businesses.");

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
      </div>
    </main>
  );
}
