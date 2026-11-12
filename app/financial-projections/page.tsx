import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProjectionBuilder from "./projection-builder";

export default async function FinancialProjectionsPage() {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await db.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !["admin", "manager", "analyst", "sales"].includes(profile.role)) redirect("/access-denied");

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
        <ProjectionBuilder companies={companies ?? []} />
      </div>
    </main>
  );
}
