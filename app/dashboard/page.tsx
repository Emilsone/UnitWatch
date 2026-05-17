"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { computeMeterStats, getUnitColor, getUnitStatus, formatNaira } from "@/lib/calculations";
import { MeterWithStats, RECHARGE_LINKS, DISCOS } from "@/types";
import {
  Zap, Bell, Plus, LogOut, Settings, ExternalLink,
  AlertTriangle, RefreshCw, ChevronRight, BarChart3,
  Droplets, Clock, TrendingDown, X,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [meters, setMeters] = useState<MeterWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [rechargeModal, setRechargeModal] = useState<MeterWithStats | null>(null);
  const [rechargeForm, setRechargeForm] = useState({ date: new Date().toISOString().split("T")[0], amount_naira: "", units_kwh: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/auth"); return; }
      setUser(data.user);
      fetchMeters(data.user.id);
    });
  }, []);

  const fetchMeters = async (userId: string) => {
    setLoading(true);
    const { data: meterData } = await supabase
      .from("meters")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (!meterData) { setLoading(false); return; }

    const metersWithStats = await Promise.all(
      meterData.map(async (meter) => {
        const { data: logs } = await supabase
          .from("recharge_logs")
          .select("*")
          .eq("meter_id", meter.id)
          .order("date", { ascending: true });
        return computeMeterStats(meter, logs || []);
      })
    );
    setMeters(metersWithStats);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleLogRecharge = async () => {
    if (!rechargeModal) return;
    setSaving(true);
    const { error } = await supabase.from("recharge_logs").insert({
      meter_id: rechargeModal.id,
      user_id: user.id,
      date: rechargeForm.date,
      amount_naira: parseFloat(rechargeForm.amount_naira),
      units_kwh: parseFloat(rechargeForm.units_kwh),
      notes: rechargeForm.notes || null,
    });
    if (!error) {
      setNotification("Recharge logged successfully!");
      setRechargeModal(null);
      setRechargeForm({ date: new Date().toISOString().split("T")[0], amount_naira: "", units_kwh: "", notes: "" });
      fetchMeters(user.id);
      setTimeout(() => setNotification(""), 3000);
    }
    setSaving(false);
  };

  const deleteMeter = async (meterId: string) => {
    if (!confirm("Delete this meter and all its recharge history?")) return;
    await supabase.from("meters").delete().eq("id", meterId);
    fetchMeters(user.id);
  };

  const lowUnitMeters = meters.filter((m) => m.percent_remaining < m.alert_threshold && m.recharge_logs.length > 0);
  const displayName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";
  const discoLabel = (val: string) => DISCOS.find((d) => d.value === val)?.label.split("(")[0].trim() || val;

  return (
    <div className="min-h-screen bg-soil">
      {/* Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-unit-high text-soil font-semibold text-sm px-5 py-3 rounded-lg shadow-xl animate-fade-in">
          ✓ {notification}
        </div>
      )}

      {/* NAV */}
      <nav className="sticky top-0 z-40 bg-soil/95 backdrop-blur-md border-b border-cream/[0.07]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-gold rounded-md flex items-center justify-center">
              <Zap size={14} className="text-soil fill-soil" strokeWidth={2.5} />
            </div>
            <span className="font-display text-lg font-bold text-cream">UnitWatch</span>
          </div>
          <div className="flex items-center gap-2">
            {lowUnitMeters.length > 0 && (
              <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[12px] font-medium px-3 py-1.5 rounded-full">
                <AlertTriangle size={12} />
                {lowUnitMeters.length} meter{lowUnitMeters.length > 1 ? "s" : ""} low
              </div>
            )}
            <Link href="/dashboard/settings" className="w-9 h-9 rounded-lg bg-cream/[0.05] border border-cream/10 flex items-center justify-center hover:bg-cream/[0.09] transition-all">
              <Settings size={15} className="text-cream/50" />
            </Link>
            <button onClick={handleSignOut} className="w-9 h-9 rounded-lg bg-cream/[0.05] border border-cream/10 flex items-center justify-center hover:bg-cream/[0.09] transition-all">
              <LogOut size={15} className="text-cream/50" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* HEADER */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <p className="text-[12px] text-cream/35 tracking-[0.08em] uppercase mb-1">Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"},</p>
            <h1 className="font-display text-[32px] font-bold text-cream tracking-tight leading-tight capitalize">{displayName}</h1>
            <p className="text-[14px] text-cream/40 mt-1 font-light">
              {meters.length === 0 ? "Add your first meter to get started" : `Tracking ${meters.length} meter${meters.length > 1 ? "s" : ""}`}
            </p>
          </div>
          <Link href="/dashboard/add-meter"
            className="flex items-center gap-2 bg-gold text-soil text-[14px] font-semibold px-5 py-2.5 rounded hover:bg-gold-light transition-all hover:shadow-lg hover:shadow-gold/20 hover:-translate-y-px">
            <Plus size={16} /> Add meter
          </Link>
        </div>

        {/* LOW UNIT ALERT BANNER */}
        {lowUnitMeters.length > 0 && (
          <div className="bg-red-500/8 border border-red-500/18 rounded-xl p-4 mb-8 flex items-start gap-3">
            <AlertTriangle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[14px] font-semibold text-red-400 mb-1">Low unit alert</p>
              <p className="text-[13px] text-cream/50 font-light">
                {lowUnitMeters.map((m) => `"${m.nickname}" (${m.estimated_units_remaining} kWh)`).join(", ")} — recharge soon to avoid blackout.
              </p>
            </div>
          </div>
        )}

        {/* DISCLAIMER */}
        <div className="bg-gold/[0.06] border border-gold/12 rounded-xl p-4 mb-8 flex items-start gap-3">
          <BarChart3 size={16} className="text-gold/60 mt-0.5 flex-shrink-0" />
          <p className="text-[12px] text-cream/40 leading-relaxed font-light">
            <span className="text-gold/70 font-medium">Estimate-based tracking.</span> Since Nigerian prepaid meters don't have remote API access, unit levels are calculated from your recharge history and average daily usage. Figures are estimates, not live readings.
          </p>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="flex items-center gap-3 text-cream/40">
              <RefreshCw size={18} className="animate-spin" />
              <span className="text-[14px]">Loading your meters...</span>
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && meters.length === 0 && (
          <div className="text-center py-24 border border-cream/[0.06] rounded-2xl bg-cream/[0.02]">
            <div className="w-16 h-16 bg-gold/10 border border-gold/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Zap size={28} className="text-gold" />
            </div>
            <h2 className="font-display text-[24px] font-bold text-cream mb-2">No meters yet</h2>
            <p className="text-[14px] text-cream/40 mb-7 font-light max-w-xs mx-auto leading-relaxed">
              Add your first prepaid meter to start tracking units and receive low-unit alerts.
            </p>
            <Link href="/dashboard/add-meter"
              className="inline-flex items-center gap-2 bg-gold text-soil text-[14px] font-semibold px-6 py-3 rounded hover:bg-gold-light transition-all">
              <Plus size={16} /> Add your first meter
            </Link>
          </div>
        )}

        {/* METER CARDS GRID */}
        {!loading && meters.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {meters.map((meter) => {
              const color = meter.recharge_logs.length > 0 ? getUnitColor(meter.percent_remaining) : "#6B7280";
              const status = meter.recharge_logs.length > 0 ? getUnitStatus(meter.percent_remaining) : "No data";
              const pct = meter.percent_remaining;
              const rechargeUrl = RECHARGE_LINKS[meter.disco] || "https://buypower.ng/";

              return (
                <div key={meter.id}
                  className="group bg-gradient-to-br from-soil-800 to-soil-700 border border-cream/[0.07] rounded-2xl p-6 hover:border-gold/18 transition-all duration-300 relative overflow-hidden">
                  {/* Low unit flash border */}
                  {pct < meter.alert_threshold && meter.recharge_logs.length > 0 && (
                    <div className="absolute inset-0 border-2 border-red-500/25 rounded-2xl pointer-events-none animate-pulse-slow" />
                  )}

                  {/* Card top row */}
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <h3 className="font-semibold text-cream text-[16px] leading-tight">{meter.nickname}</h3>
                      <p className="font-mono text-[11px] text-cream/30 mt-0.5">{meter.meter_number}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                      <span className="text-[11px] font-medium" style={{ color }}>{status}</span>
                    </div>
                  </div>

                  {/* Unit big number */}
                  {meter.recharge_logs.length > 0 ? (
                    <>
                      <div className="mb-4">
                        <div className="font-display text-[56px] font-black text-cream leading-none mb-0.5" style={{ color: pct < 15 ? color : undefined }}>
                          {meter.estimated_units_remaining}
                        </div>
                        <div className="text-[10px] text-cream/30 tracking-[0.08em]">UNITS REMAINING (kWh)</div>
                      </div>

                      {/* Progress bar */}
                      <div className="mb-4">
                        <div className="h-1.5 bg-cream/[0.07] rounded-full overflow-hidden mb-1.5">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: color }}
                          />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[10px] text-cream/25">0 kWh</span>
                          <span className="text-[11px] font-medium" style={{ color }}>{pct}%</span>
                        </div>
                      </div>

                      {/* Stats grid */}
                      <div className="grid grid-cols-3 gap-2 mb-5">
                        <div className="bg-cream/[0.04] rounded-lg p-2.5 text-center">
                          <div className="text-[13px] font-semibold text-cream">{meter.days_remaining}</div>
                          <div className="text-[9px] text-cream/30 mt-0.5">days left</div>
                        </div>
                        <div className="bg-cream/[0.04] rounded-lg p-2.5 text-center">
                          <div className="text-[13px] font-semibold text-cream">{meter.daily_consumption}</div>
                          <div className="text-[9px] text-cream/30 mt-0.5">kWh/day</div>
                        </div>
                        <div className="bg-cream/[0.04] rounded-lg p-2.5 text-center">
                          <div className="text-[13px] font-semibold text-cream">{meter.recharge_logs.length}</div>
                          <div className="text-[9px] text-cream/30 mt-0.5">recharges</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="py-6 text-center mb-4">
                      <TrendingDown size={28} className="text-cream/20 mx-auto mb-2" />
                      <p className="text-[13px] text-cream/35 font-light">No recharge logs yet</p>
                      <p className="text-[12px] text-cream/20 mt-1">Log your first recharge to see stats</p>
                    </div>
                  )}

                  {/* DisCo tag */}
                  <div className="flex items-center gap-1.5 mb-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold/50" />
                    <span className="text-[11px] text-cream/35">{discoLabel(meter.disco)} · {meter.meter_type}</span>
                  </div>

                  {/* Alert threshold indicator */}
                  {meter.recharge_logs.length > 0 && (
                    <div className="flex items-center gap-2 text-[11px] text-cream/30 mb-4">
                      <Bell size={11} />
                      Alert when below {meter.alert_threshold} units
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-cream/[0.06]">
                    <button
                      onClick={() => setRechargeModal(meter)}
                      className="flex-1 text-[12px] font-medium text-soil bg-gold py-2 rounded hover:bg-gold-light transition-all"
                    >
                      Log recharge
                    </button>
                    <a href={rechargeUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 text-[12px] text-cream/60 border border-cream/10 px-3 py-2 rounded hover:border-cream/25 hover:text-cream transition-all">
                      Buy units <ExternalLink size={11} />
                    </a>
                    <Link href={`/dashboard/meter/${meter.id}`}
                      className="flex items-center justify-center text-cream/40 border border-cream/10 w-9 rounded hover:border-cream/25 hover:text-cream transition-all">
                      <ChevronRight size={15} />
                    </Link>
                  </div>
                </div>
              );
            })}

            {/* Add meter card */}
            <Link href="/dashboard/add-meter"
              className="border border-dashed border-cream/[0.12] rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:border-gold/25 hover:bg-cream/[0.02] transition-all group min-h-[280px]">
              <div className="w-12 h-12 bg-cream/[0.04] border border-cream/10 rounded-xl flex items-center justify-center group-hover:bg-gold/10 group-hover:border-gold/20 transition-all">
                <Plus size={22} className="text-cream/25 group-hover:text-gold transition-colors" />
              </div>
              <div className="text-center">
                <p className="text-[14px] font-medium text-cream/30 group-hover:text-cream/60 transition-colors">Add another meter</p>
                <p className="text-[12px] text-cream/18 mt-0.5 font-light">Shop, tenant, second home...</p>
              </div>
            </Link>
          </div>
        )}

        {/* RECENT ACTIVITY — last 5 recharges across all meters */}
        {!loading && meters.some((m) => m.recharge_logs.length > 0) && (
          <div className="mt-12">
            <h2 className="font-display text-[20px] font-bold text-cream mb-5 tracking-tight">Recent recharges</h2>
            <div className="bg-cream/[0.025] border border-cream/[0.07] rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cream/[0.07]">
                    {["Meter","Date","Amount","Units","Notes"].map((h) => (
                      <th key={h} className="text-left text-[11px] text-cream/30 font-medium tracking-widest uppercase px-5 py-3.5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {meters
                    .flatMap((m) => m.recharge_logs.map((l) => ({ ...l, meterNickname: m.nickname })))
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 8)
                    .map((log) => (
                      <tr key={log.id} className="border-b border-cream/[0.04] hover:bg-cream/[0.02] transition-colors">
                        <td className="px-5 py-3.5 text-[13px] font-medium text-cream">{log.meterNickname}</td>
                        <td className="px-5 py-3.5 text-[13px] text-cream/50">{new Date(log.date).toLocaleDateString("en-NG", { day:"numeric", month:"short", year:"numeric" })}</td>
                        <td className="px-5 py-3.5 text-[13px] text-gold font-medium">{formatNaira(log.amount_naira)}</td>
                        <td className="px-5 py-3.5 text-[13px] text-cream/70">{log.units_kwh} kWh</td>
                        <td className="px-5 py-3.5 text-[12px] text-cream/30">{log.notes || "—"}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* RECHARGE LOG MODAL */}
      {rechargeModal && (
        <div className="fixed inset-0 z-50 bg-soil/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-soil-800 border border-cream/10 rounded-2xl p-7 w-full max-w-md shadow-2xl">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-display text-[22px] font-bold text-cream tracking-tight">Log recharge</h2>
                <p className="text-[13px] text-cream/40 mt-0.5">{rechargeModal.nickname} · {rechargeModal.meter_number}</p>
              </div>
              <button onClick={() => setRechargeModal(null)} className="text-cream/30 hover:text-cream transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] text-cream/35 tracking-widest uppercase mb-2">Date of recharge</label>
                <input type="date" value={rechargeForm.date}
                  onChange={(e) => setRechargeForm({ ...rechargeForm, date: e.target.value })}
                  className="w-full bg-cream/[0.05] border border-cream/10 text-cream text-[14px] px-4 py-3 rounded outline-none focus:border-gold/40 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-cream/35 tracking-widest uppercase mb-2">Amount paid (₦)</label>
                  <input type="number" placeholder="e.g. 5000" value={rechargeForm.amount_naira}
                    onChange={(e) => setRechargeForm({ ...rechargeForm, amount_naira: e.target.value })}
                    className="w-full bg-cream/[0.05] border border-cream/10 text-cream text-[14px] px-4 py-3 rounded outline-none focus:border-gold/40 transition-all" />
                </div>
                <div>
                  <label className="block text-[11px] text-cream/35 tracking-widest uppercase mb-2">Units received (kWh)</label>
                  <input type="number" step="0.1" placeholder="e.g. 42.5" value={rechargeForm.units_kwh}
                    onChange={(e) => setRechargeForm({ ...rechargeForm, units_kwh: e.target.value })}
                    className="w-full bg-cream/[0.05] border border-cream/10 text-cream text-[14px] px-4 py-3 rounded outline-none focus:border-gold/40 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-cream/35 tracking-widest uppercase mb-2">Notes (optional)</label>
                <input type="text" placeholder="e.g. Paid via BuyPower" value={rechargeForm.notes}
                  onChange={(e) => setRechargeForm({ ...rechargeForm, notes: e.target.value })}
                  className="w-full bg-cream/[0.05] border border-cream/10 text-cream text-[14px] px-4 py-3 rounded outline-none focus:border-gold/40 transition-all" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setRechargeModal(null)}
                className="flex-1 border border-cream/10 text-cream/50 text-[14px] py-3 rounded hover:border-cream/20 hover:text-cream transition-all">
                Cancel
              </button>
              <button onClick={handleLogRecharge} disabled={saving || !rechargeForm.amount_naira || !rechargeForm.units_kwh}
                className="flex-1 bg-gold text-soil text-[14px] font-semibold py-3 rounded hover:bg-gold-light transition-all disabled:opacity-50">
                {saving ? "Saving..." : "Save recharge"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
