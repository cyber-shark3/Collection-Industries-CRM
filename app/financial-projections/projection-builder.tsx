"use client";

import { useMemo, useState } from "react";
import { saveProjection } from "./actions";

type Company = { id: string; name: string };
type Line = { id: string; label: string; values: number[] };
type Section = "revenue" | "cogs" | "opex" | "capex";
const years = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"];
const makeLine = (label: string): Line => ({ id: crypto.randomUUID(), label, values: [0,0,0,0,0] });
const initial = {
  revenue: [makeLine("Product / Service 1")],
  cogs: [makeLine("Product / Service 1")],
  opex: [makeLine("Salaries & Wages"), makeLine("Rent / Utilities"), makeLine("Marketing / Sales"), makeLine("Other OPEX")],
  capex: [makeLine("Equipment"), makeLine("Vehicles"), makeLine("IT / Software"), makeLine("Other CapEx")],
  workingCapital: {
    inventoryDays: [0,0,0,0,0],
    receivableDays: [0,0,0,0,0],
    payableDays: [0,0,0,0,0],
    netWorkingCapital: [0,0,0,0,0],
  },
};

const money = (amount: number) => new Intl.NumberFormat("en-NA", { style: "currency", currency: "NAD", maximumFractionDigits: 0 }).format(amount || 0);
const total = (lines: Line[], year: number) => lines.reduce((sum, line) => sum + (Number(line.values[year]) || 0), 0);

export default function ProjectionBuilder({ companies }: { companies: Company[] }) {
  const [model, setModel] = useState(initial);
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [active, setActive] = useState<Section>("revenue");
  const [notice, setNotice] = useState("");
  const totals = useMemo(() => ({
    revenue: years.map((_, i) => total(model.revenue, i)),
    cogs: years.map((_, i) => total(model.cogs, i)),
    opex: years.map((_, i) => total(model.opex, i)),
    capex: years.map((_, i) => total(model.capex, i)),
  }), [model]);

  function updateLine(section: Section, id: string, field: "label" | number, value: string) {
    setModel(current => ({
      ...current,
      [section]: current[section].map(line => line.id !== id ? line : field === "label"
        ? { ...line, label: value }
        : { ...line, values: line.values.map((v, i) => i === field ? (Number(value) || 0) : v) }),
    }));
  }

  function addLine(section: Section) {
    setModel(current => ({ ...current, [section]: [...current[section], makeLine("New item")] }));
  }

  function removeLine(section: Section, id: string) {
    setModel(current => ({ ...current, [section]: current[section].filter(line => line.id !== id) }));
  }

  function updateDays(field: keyof typeof model.workingCapital, year: number, value: string) {
    setModel(current => ({
      ...current,
      workingCapital: { ...current.workingCapital, [field]: current.workingCapital[field].map((v, i) => i === year ? (Number(value) || 0) : v) },
    }));
  }

  const sectionLabels: Record<Section, string> = { revenue: "1. Revenue", cogs: "2. Cost of goods sold", opex: "3. Operating expenses", capex: "4. Capital expenditure" };

  return (
    <div className="mt-7 space-y-6">
      <div className="rounded-2xl border border-line bg-panel p-5">
        <h2 className="font-semibold">Applicant details</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="text-xs text-slate-400">Applicant business<select required name="company_id" form="projection-form" className="mt-2"><option value="">Select an existing CRM company</option>{companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          <label className="text-xs text-slate-400">Business name<input required value={businessName} onChange={e => setBusinessName(e.target.value)} className="mt-2" placeholder="Registered / trading name" /></label>
          <label className="text-xs text-slate-400">Owner name<input value={ownerName} onChange={e => setOwnerName(e.target.value)} className="mt-2" placeholder="Applicant / owner" /></label>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="font-semibold">Projection schedules</h2><p className="mt-1 text-xs text-slate-500">Enter annual estimates. Totals update automatically.</p></div>
          <span className="rounded-lg border border-line px-3 py-2 text-xs text-slate-400">Currency: NAD (N$)</span>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">{(Object.keys(sectionLabels) as Section[]).map(key => <button type="button" key={key} onClick={() => setActive(key)} className={`rounded-lg px-3 py-2 text-xs ${active === key ? "bg-blue-500 text-white" : "border border-line text-slate-400"}`}>{sectionLabels[key]}</button>)}</div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-xs">
            <thead className="text-slate-500"><tr><th className="w-56 pb-3">Product / category</th>{years.map(y => <th key={y} className="pb-3 text-right">{y} (N$)</th>)}<th /></tr></thead>
            <tbody>{model[active].map(line => <tr key={line.id} className="border-t border-line">
              <td className="py-2 pr-3"><input aria-label="Line item name" value={line.label} onChange={e => updateLine(active, line.id, "label", e.target.value)} /></td>
              {line.values.map((v, i) => <td key={i} className="py-2 pl-2"><input aria-label={`${line.label} ${years[i]}`} type="number" min="0" step="0.01" value={v} onChange={e => updateLine(active, line.id, i, e.target.value)} className="min-w-24 text-right tabular-nums" /></td>)}
              <td className="py-2 pl-2"><button type="button" onClick={() => removeLine(active, line.id)} className="text-slate-500 hover:text-rose-300" aria-label="Remove row">Remove</button></td>
            </tr>)}</tbody>
            <tfoot><tr className="border-t border-line font-semibold"><td className="py-3">Total {active.toUpperCase()}</td>{totals[active].map((v, i) => <td key={i} className="py-3 text-right">{money(v)}</td>)}<td /></tr></tfoot>
          </table>
        </div>
        <button type="button" onClick={() => addLine(active)} className="mt-4 rounded-lg border border-blue-400/30 px-3 py-2 text-xs text-blue-300">+ Add line item</button>
      </div>

      <div className="rounded-2xl border border-line bg-panel p-5">
        <h2 className="font-semibold">5. Working capital</h2>
        <p className="mt-1 text-xs text-slate-500">Enter the number of days for each measure. Net working capital is entered in N$ as requested by the template; the system does not invent a calculation formula.</p>
        <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[720px] text-xs"><thead className="text-slate-500"><tr><th className="pb-3 text-left">Category</th>{years.map(y => <th key={y} className="pb-3 text-right">{y}</th>)}</tr></thead><tbody>
          {([
            ["inventoryDays","Inventory Days","days"],
            ["receivableDays","Receivable Days","days"],
            ["payableDays","Payable Days","days"],
            ["netWorkingCapital","Net Working Capital (N$)","money"],
          ] as const).map(([field,label,kind]) => <tr key={field} className="border-t border-line"><td className="py-2">{label}</td>{model.workingCapital[field].map((v,i)=><td key={i} className="py-2 pl-2"><input aria-label={`${label} ${years[i]}`} type="number" min="0" step={kind === "days" ? "1" : "0.01"} value={v} onChange={e => updateDays(field,i,e.target.value)} className="min-w-24 text-right tabular-nums" /></td>)}</tr>)}
        </tbody></table></div>
      </div>

      <div className="rounded-2xl border border-line bg-panel p-5">
        <h2 className="font-semibold">Five-year summary</h2>
        <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[650px] text-xs"><thead className="text-slate-500"><tr><th className="pb-3 text-left">Schedule</th>{years.map(y=><th key={y} className="pb-3 text-right">{y}</th>)}</tr></thead><tbody>
          {([
            ["Total revenue",totals.revenue],["Total COGS",totals.cogs],["Total OPEX",totals.opex],["Total CapEx",totals.capex],
          ] as [string,number[]][]).map(([label,values])=><tr key={label} className="border-t border-line"><td className="py-3">{label}</td>{values.map((v,i)=><td key={i} className="py-3 text-right">{money(v)}</td>)}</tr>)}
          <tr className="border-t border-line font-semibold"><td className="py-3">Gross profit (revenue less COGS)</td>{years.map((_,i)=><td key={i} className="py-3 text-right">{money(totals.revenue[i]-totals.cogs[i])}</td>)}</tr>
        </tbody></table></div>
        <p className="mt-3 text-[11px] text-slate-500">Gross profit is a simple arithmetic subtotal. This template does not provide tax, depreciation, financing, cash-flow, or valuation assumptions.</p>
      </div>

      <form id="projection-form" action={saveProjection} className="rounded-2xl border border-blue-400/20 bg-blue-400/5 p-5">
        <input type="hidden" name="business_name" value={businessName} />
        <input type="hidden" name="owner_name" value={ownerName} />
        <input type="hidden" name="model_data" value={JSON.stringify(model)} />
        {notice && <p className="mb-3 text-xs text-rose-300">{notice}</p>}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="font-semibold">Save financial projection</h2><p className="mt-1 text-xs text-slate-500">Saved as a draft for internal review. No funding outcome is implied.</p></div>
          <button type="submit" onClick={e => { if (!businessName.trim()) { e.preventDefault(); setNotice("Enter the applicant business name."); } }} className="rounded-xl bg-blue-500 px-5 py-3 text-xs font-semibold text-white hover:bg-blue-400">Save draft</button>
        </div>
      </form>
    </div>
  );
}
