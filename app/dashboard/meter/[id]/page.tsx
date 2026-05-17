"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { computeMeterStats, getUnitColor, getUnitStatus, formatNaira } from "@/lib/calculations";
import { MeterWithStats, RechargeLog, DISCOS, RECHARGE_LINKS } from "@/types";
import {
  Zap, ArrowLeft, ExternalLink, Trash2, Bell,
  TrendingDown, Calendar, Plus, X, AlertTriangle,
} from "lucide-react";

export default function MeterDetailPage() {
  const router = useRouter();
  const params = useParams();
  const meterId = params.id as string;

  const [meter, setMeter] = useState<MeterWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteLogId, setDeleteLogId] = useState<string | null>(null);
  const [rechargeModal, setRechargeModal] = useState(false);
  const [alertForm, setAlertForm] = useState(false);
  const [newThreshold, setNewThreshold] = useState("");
  const [rechargeForm, setRechargeForm] = useState({
    date: new Date().toISOString().split("T")[0],
    amount_naira: "",
    units_kwh: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState("");

  useEffect(() => {
    fetchMeter();
  }, [meterId]);

  const fetchMeter = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }

    const { data: meterData } = await supabase
      .from("meters")
      .select("*")
      .eq("id", meterId)
      .eq("user_id", user.id)
      .single();

    if (!meterData) { router.push("/dashboard"); return; }

    const { data: logs } = await supabase
      .from("recharge_logs")
      .select("*")
      .eq("meter_id", meterId)
      .order("date", { ascending: false });

    const stats = computeMeterStats(meterData, logs || []);
    setMeter(stats);
    setNewThreshold(String(meterData.alert_threshold));
    setLoading(false);
  };

  const handleLogRecharge = async () => {
    if (!meter) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("recharge_logs").insert({
      meter_id: meter.id,
      user_id: user!.id,
      date: rechargeForm.date,
      amount_naira: parseFloat(rechargeForm.amount_naira),
      units_kwh: parseFloat(rechargeForm.units_kwh),
      notes: rechargeForm.notes || null,
    });
    setRechargeModal(false);
    setRechargeForm({ date: new Date().toISOString().split("T")[0], amount_naira: "", units_kwh: "", notes: "" });
    setNotification("Recharge logged!");
    setTimeout(() => setNotification(""), 3000);
    fetchMeter();
    setSaving(false);
  };

  const handleDeleteLog = async (logId: string) => {
    await supabase.from("recharge_logs").delete().eq("id", logId);
    setDeleteLogId(null);
    fetchMeter();
  };

  const handleDeleteMeter = async () => {
    if (!confirm(`Delete "${meter?.nickname}" and all its history? This cannot be undone.`)) return;
    await supabase.from("meters").delete().eq("id", meterId);
    router.push("/dashboard");
  };

  const handleUpdateThreshold = async () => {
    if (!meter) return;
    await supabase.from("meters").update({ alert_threshold: parseFloat(newThreshold) }).eq("id", meter.id);
    setAlertForm(false);
    setNotification("Alert threshold updated!");
    setTimeout(() => setNotification(""), 3000);
    fetchMeter();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soil flex items-center justify-center">
        <p className="text-cream/30 text-[14px]">Loading meter...</p>
      </div>
    );
  }

  if (!meter) return null;

  const color = meter.recharge_logs.length > 0 ? getUnitColor(meter.percent_remaining) : "#6B7280";
  const discoLabel = DISCOS.find((d) => d.value === meter.disco)?.label.split("(")[0].trim() || meter.disco;
  const rechargeUrl = RECHARGE_LINKS[meter.disco] || "https://buypower.ng/";
  const inputCls = "w-full bg-cream/[0.05] border border-cream/10 text-cream text-[14px] px-4 py-3 rounded outline-none focus:border-gold/40 transition-all";
  const labelCls = "block text-[11px] text-cream/35 tracking-widest uppercase mb-2";

  return (
    <div className="min-h-screen bg-soil pb-16">
      {/* Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-unit-high text-soil font-semibold text-sm px-5 py-3 rounded-lg shadow-xl">
          ✓ {notification}
        </div>
      )}

      {/* NAV */}
      <nav className="sticky top-0 z-40 bg-soil/95 backdrop-blur-md border-b border-cream/[0.07]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-gold rounded-md flex items-center justify-center">
              <Zap size={14} className="text-soil fill-soil" strokeWidth={2.5} />
            </div>
            <span className="font-display text-lg font-bold text-cream">UnitWatch</span>
          </div>
          <button
            onClick={handleDeleteMeter}
            className="flex items-center gap-1.5 text-[12px] text-red-400/60 hover:text-red-400 transition-colors border border-red-500/15 hover:border-red-500/30 px-3 py-1.5 rounded"
          >
            <Trash2 size={12} /> Delete meter
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-[13px] text-cream/35 hover:text-cream/55 transition-colors mb-8">
          <ArrowLeft size={13} /> All meters
        </Link>

        {/* HEADER */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="font-display text-[32px] font-bold text-cream tracking-tight">{meter.nickname}</h1>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                <span className="text-[12px] font-medium" style={{ color }}>
                  {meter.recharge_logs.length > 0 ? getUnitStatus(meter.percent_remaining) : "No data"}
                </span>
              </div>
            </div>
            <p className="font-mono text-[13px] text-cream/30">{meter.meter_number}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gold/50" />
              <span className="text-[12px] text-cream/35">{discoLabel} · {meter.meter_type}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <a href={rechargeUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 border border-cream/10 text-cream/60 text-[13px] px-4 py-2.5 rounded hover:border-cream/25 hover:text-cream transition-all">
              Buy units <ExternalLink size={13} />
            </a>
            <button
              onClick={() => setRechargeModal(true)}
              className="flex items-center gap-2 bg-gold text-soil text-[13px] font-semibold px-5 py-2.5 rounded hover:bg-gold-light transition-all"
            >
              <Plus size={15} /> Log recharge
            </button>
          </div>
        </div>

        {/* LOW UNIT WARNING */}
        {meter.recharge_logs.length > 0 && meter.percent_remaining < meter.alert_threshold && (
          <div className="bg-red-500/8 border border-red-500/18 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertTriangle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-[13px] text-red-400">
              Units are below your alert threshold of {meter.alert_threshold} kWh. Recharge soon to avoid blackout.
            </p>
          </div>
        )}

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Units remaining", value: meter.recharge_logs.length > 0 ? `${meter.estimated_units_remaining} kWh` : "—", highlight: true },
            { label: "Days remaining", value: meter.recharge_logs.length > 0 ? `~${meter.days_remaining} days` : "—" },
            { label: "Daily usage", value: meter.recharge_logs.length > 0 ? `${meter.daily_consumption} kWh/day` : "—" },
            { label: "Total recharged", value: meter.recharge_logs.length > 0 ? `${meter.total_units_loaded} kWh` : "—" },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl p-5 border ${s.highlight ? "bg-gold/[0.07] border-gold/18" : "bg-cream/[0.03] border-cream/[0.07]"}`}>
              <div className="text-[11px] text-cream/35 tracking-widest uppercase mb-2">{s.label}</div>
              <div className={`font-display text-[26px] font-bold leading-none ${s.highlight ? "text-gold" : "text-cream"}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* PROGRESS BAR */}
        {meter.recharge_logs.length > 0 && (
          <div className="bg-cream/[0.025] border border-cream/[0.07] rounded-2xl p-6 mb-8">
            <div className="flex justify-between items-end mb-3">
              <span className="text-[12px] text-cream/35 uppercase tracking-widest">Unit level</span>
              <span className="font-display text-[20px] font-bold" style={{ color }}>{meter.percent_remaining}%</span>
            </div>
            <div className="h-3 bg-cream/[0.07] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${meter.percent_remaining}%`, background: color }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[11px] text-cream/20">0 kWh</span>
              <span className="text-[11px] text-cream/20">
                {meter.recharge_logs[0] ? `${meter.recharge_logs[0].units_kwh} kWh (last load)` : ""}
              </span>
            </div>
          </div>
        )}

        {/* ALERT SETTINGS */}
        <div className="bg-cream/[0.025] border border-cream/[0.07] rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-gold/60" />
              <span className="text-[14px] font-semibold text-cream">Alert settings</span>
            </div>
            <button
              onClick={() => setAlertForm(!alertForm)}
              className="text-[12px] text-gold hover:text-gold-light transition-colors"
            >
              {alertForm ? "Cancel" : "Edit"}
            </button>
          </div>
          <p className="text-[13px] text-cream/40 font-light mb-3">
            You'll get an email alert when units drop below <span className="text-cream/60 font-medium">{meter.alert_threshold} kWh</span>.
          </p>
          {alertForm && (
            <div className="flex gap-2 mt-3">
              <input
                type="number" min="1" max="100" value={newThreshold}
                onChange={(e) => setNewThreshold(e.target.value)}
                className="flex-1 bg-cream/[0.05] border border-cream/10 text-cream text-[14px] px-4 py-2.5 rounded outline-none focus:border-gold/40 transition-all"
                placeholder="Alert at X units"
              />
              <button onClick={handleUpdateThreshold}
                className="bg-gold text-soil text-[13px] font-semibold px-5 py-2.5 rounded hover:bg-gold-light transition-all">
                Save
              </button>
            </div>
          )}
        </div>

        {/* RECHARGE HISTORY TABLE */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-[20px] font-bold text-cream tracking-tight">Recharge history</h2>
            <span className="text-[12px] text-cream/30">{meter.recharge_logs.length} recharge{meter.recharge_logs.length !== 1 ? "s" : ""}</span>
          </div>

          {meter.recharge_logs.length === 0 ? (
            <div className="border border-dashed border-cream/[0.1] rounded-2xl py-16 text-center">
              <TrendingDown size={28} className="text-cream/15 mx-auto mb-3" />
              <p className="text-[14px] text-cream/30 font-light">No recharge history yet</p>
              <p className="text-[12px] text-cream/18 mt-1">Log your first recharge to start tracking</p>
              <button
                onClick={() => setRechargeModal(true)}
                className="mt-5 inline-flex items-center gap-1.5 text-[13px] text-gold hover:text-gold-light transition-colors"
              >
                <Plus size={14} /> Log first recharge
              </button>
            </div>
          ) : (
            <div className="bg-cream/[0.025] border border-cream/[0.07] rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cream/[0.07]">
                    {["Date", "Amount paid", "Units received", "Cost/unit", "Notes", ""].map((h) => (
                      <th key={h} className="text-left text-[10px] text-cream/28 font-medium tracking-widest uppercase px-5 py-3.5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {meter.recharge_logs.map((log: RechargeLog) => (
                    <tr key={log.id} className="border-b border-cream/[0.04] hover:bg-cream/[0.02] transition-colors group">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <Calendar size={12} className="text-cream/25" />
                          <span className="text-[13px] text-cream/70">
                            {new Date(log.date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-gold font-medium">{formatNaira(log.amount_naira)}</td>
                      <td className="px-5 py-3.5 text-[13px] text-cream/70">{log.units_kwh} kWh</td>
                      <td className="px-5 py-3.5 text-[12px] text-cream/35">
                        {formatNaira(log.amount_naira / log.units_kwh)}/kWh
                      </td>
                      <td className="px-5 py-3.5 text-[12px] text-cream/30">{log.notes || "—"}</td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => setDeleteLogId(log.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400/50 hover:text-red-400"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* LOG RECHARGE MODAL */}
      {rechargeModal && (
        <div className="fixed inset-0 z-50 bg-soil/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-soil-800 border border-cream/10 rounded-2xl p-7 w-full max-w-md shadow-2xl">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-display text-[22px] font-bold text-cream tracking-tight">Log recharge</h2>
                <p className="text-[13px] text-cream/40 mt-0.5">{meter.nickname}</p>
              </div>
              <button onClick={() => setRechargeModal(false)} className="text-cream/30 hover:text-cream transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Date of recharge</label>
                <input type="date" value={rechargeForm.date}
                  onChange={(e) => setRechargeForm({ ...rechargeForm, date: e.target.value })}
                  className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Amount paid (₦)</label>
                  <input type="number" placeholder="5000" value={rechargeForm.amount_naira}
                    onChange={(e) => setRechargeForm({ ...rechargeForm, amount_naira: e.target.value })}
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Units received (kWh)</label>
                  <input type="number" step="0.1" placeholder="42.5" value={rechargeForm.units_kwh}
                    onChange={(e) => setRechargeForm({ ...rechargeForm, units_kwh: e.target.value })}
                    className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Notes (optional)</label>
                <input type="text" placeholder="e.g. Paid via BuyPower" value={rechargeForm.notes}
                  onChange={(e) => setRechargeForm({ ...rechargeForm, notes: e.target.value })}
                  className={inputCls} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setRechargeModal(false)}
                className="flex-1 border border-cream/10 text-cream/50 text-[14px] py-3 rounded hover:border-cream/20 hover:text-cream transition-all">
                Cancel
              </button>
              <button onClick={handleLogRecharge}
                disabled={saving || !rechargeForm.amount_naira || !rechargeForm.units_kwh}
                className="flex-1 bg-gold text-soil text-[14px] font-semibold py-3 rounded hover:bg-gold-light transition-all disabled:opacity-50">
                {saving ? "Saving..." : "Save recharge"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE LOG CONFIRM */}
      {deleteLogId && (
        <div className="fixed inset-0 z-50 bg-soil/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-soil-800 border border-cream/10 rounded-2xl p-7 w-full max-w-sm shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-400" />
            </div>
            <h3 className="font-display text-[18px] font-bold text-cream mb-2">Delete this log?</h3>
            <p className="text-[13px] text-cream/40 mb-6 font-light">This recharge entry will be permanently removed and your unit estimates will recalculate.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteLogId(null)}
                className="flex-1 border border-cream/10 text-cream/50 text-[14px] py-3 rounded hover:border-cream/20 transition-all">
                Cancel
              </button>
              <button onClick={() => handleDeleteLog(deleteLogId)}
                className="flex-1 bg-red-500 text-white text-[14px] font-semibold py-3 rounded hover:bg-red-600 transition-all">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
