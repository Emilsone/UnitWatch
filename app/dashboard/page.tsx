"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client"; // ✅ Updated to use our new client helper
import { computeMeterStats, getUnitColor, getUnitStatus, formatNaira } from "@/lib/calculations";
import { MeterWithStats, RECHARGE_LINKS, DISCOS } from "@/types";
import {
  Zap, Bell, Plus, LogOut, Settings, ExternalLink,
  AlertTriangle, RefreshCw, ChevronRight, BarChart3,
  Droplets, Clock, TrendingDown, X,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient(); // ✅ Instantiated the new client
  const [user, setUser] = useState<any>(null);
  const [meters, setMeters] = useState<MeterWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [rechargeModal, setRechargeModal] = useState<MeterWithStats | null>(null);
  const [rechargeForm, setRechargeForm] = useState({ date: new Date().toISOString().split("T")[0], amount_naira: "", units_kwh: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { 
        router.push("/auth"); 
        return; 
      }
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
            <span className="text-[14px]">No meters tracked yet.</span>
          </div>
        )}
      </div>
    </div>
  );
}
