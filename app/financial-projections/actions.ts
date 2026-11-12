"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const value = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

export async function saveProjection(form: FormData) {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await db.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !["admin", "manager", "analyst", "sales"].includes(profile.role)) redirect("/access-denied");

  const companyId = value(form, "company_id");
  const businessName = value(form, "business_name");
  const ownerName = value(form, "owner_name");
  let modelData: unknown;
  try {
    modelData = JSON.parse(value(form, "model_data"));
  } catch {
    redirect("/financial-projections?error=invalid-model");
  }
  if (!companyId || !businessName || !modelData || typeof modelData !== "object") {
    redirect("/financial-projections?error=missing-fields");
  }

  const { error } = await db.from("financial_projection_models").insert({
    company_id: companyId,
    business_name: businessName,
    owner_name: ownerName || null,
    model_name: "NYDF Five-Year Financial Projection",
    currency: "NAD",
    model_data: modelData,
    created_by: user.id,
    status: "draft",
  });
  if (error) redirect("/financial-projections?error=save-failed");

  revalidatePath("/financial-projections");
  redirect("/financial-projections?saved=1");
}
