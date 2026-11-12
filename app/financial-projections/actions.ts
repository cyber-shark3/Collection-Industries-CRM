"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const value = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

function isFiveNonNegativeNumbers(value: unknown): value is number[] {
  return Array.isArray(value) && value.length === 5 &&
    value.every((item) => typeof item === "number" && Number.isFinite(item) && item >= 0);
}

function isLineSchedule(value: unknown): boolean {
  return Array.isArray(value) && value.every((line) =>
    line && typeof line === "object" &&
    typeof (line as { label?: unknown }).label === "string" &&
    (line as { label: string }).label.trim().length > 0 &&
    isFiveNonNegativeNumbers((line as { values?: unknown }).values)
  );
}

function isProjectionModel(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const model = value as Record<string, unknown>;
  const workingCapital = model.workingCapital;
  if (!workingCapital || typeof workingCapital !== "object") return false;
  const wc = workingCapital as Record<string, unknown>;
  return isLineSchedule(model.revenue) &&
    isLineSchedule(model.cogs) &&
    isLineSchedule(model.opex) &&
    isLineSchedule(model.capex) &&
    isFiveNonNegativeNumbers(wc.inventoryDays) &&
    isFiveNonNegativeNumbers(wc.receivableDays) &&
    isFiveNonNegativeNumbers(wc.payableDays) &&
    isFiveNonNegativeNumbers(wc.netWorkingCapital);
}

export async function saveProjection(form: FormData) {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await db.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !["admin", "manager", "analyst"].includes(profile.role)) redirect("/access-denied");

  const companyId = value(form, "company_id");
  const businessName = value(form, "business_name");
  const ownerName = value(form, "owner_name");
  let modelData: unknown;
  try {
    modelData = JSON.parse(value(form, "model_data"));
  } catch {
    redirect("/financial-projections?error=invalid-model");
  }
  if (!companyId || !businessName || !isProjectionModel(modelData)) {
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
