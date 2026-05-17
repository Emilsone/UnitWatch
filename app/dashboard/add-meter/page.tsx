"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { DISCOS } from "@/types";
import { Zap, ArrowLeft, Check } from "lucide-react";

export default function AddMeterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    meter_number: "",
    nickname: "",
    disco: "",
    meter_type: "single-phase",
    alert_threshold: "10",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }

    const { error } = await supabase.from("meters").insert({
      user_id: user.id,
      meter_number: form.meter_number.trim(),
      nickname: form.nickname.trim(),
      disco: form.disco,
      meter_type: form.meter_type,
      alert_threshold: parseFloat(form.alert_threshold),
    });

    if (error) { setError(error.message); setLoading(false); return; }
    router.push("/dashboard");
  };

  const inputCls = "w-full bg-cream/[0.05] border border-cream/10 text-cream text-[14px] px-4 py-3 rounded outline-none placeholder:text-cream/20 focus:border-gold/40 focus:bg-cream/[0.07] transition-all";
  const labelCls = "block text-[11px] text-cream/35 tracking-widest uppercase mb-2";

  return (
    <div className="min-h-screen bg-soil">
      {/* NAV */}
      <nav className="sticky top-0 z-40 bg-soil/95 backdrop-blur-md border-b border-cream/[0.07]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <div className="w-7 h-7 bg-gold rounded-md flex items-center justify-center">
            <Zap size={14} className="text-soil fill-soil" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-bold text-cream">UnitWatch</span>
        </div>
      </nav>

      <div className="max-w-xl mx-auto px-6 py-12">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-[13px] text-cream/35 hover:text-cream/55 transition-colors mb-8">
          <ArrowLeft size={13} /> Back to dashboard
        </Link>

        <div className="mb-8">
          <div className="w-9 h-0.5 bg-gold mb-4" />
          <h1 className="font-display text-[30px] font-bold text-cream tracking-tight mb-2">Add a meter</h1>
          <p className="text-[14px] text-cream/40 font-light leading-relaxed">
            Enter your prepaid meter details. You can add as many meters as you need — home, shop, tenants.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nickname */}
          <div>
            <label className={labelCls}>Meter nickname</label>
            <input
              type="text"
              placeholder='e.g. "My Home", "Shop", "Tenant 2"'
              value={form.nickname}
              onChange={(e) => setForm({ ...form, nickname: e.target.value })}
              required
              className={inputCls}
            />
            <p className="text-[11px] text-cream/25 mt-1.5 font-light">A friendly name to identify this meter on your dashboard.</p>
          </div>

          {/* Meter number */}
          <div>
            <label className={labelCls}>Meter number</label>
            <input
              type="text"
              placeholder="e.g. 0101-2039-4812"
              value={form.meter_number}
              onChange={(e) => setForm({ ...form, meter_number: e.target.value })}
              required
              className={`${inputCls} font-mono tracking-wider`}
            />
            <p className="text-[11px] text-cream/25 mt-1.5 font-light">Found on your meter display or recharge token receipt.</p>
          </div>

          {/* DisCo */}
          <div>
            <label className={labelCls}>Electricity provider (DisCo)</label>
            <select
              value={form.disco}
              onChange={(e) => setForm({ ...form, disco: e.target.value })}
              required
              className={`${inputCls} appearance-none cursor-pointer`}
              style={{ background: "rgba(242,235,217,0.05)" }}
            >
              <option value="" disabled>Select your DisCo...</option>
              {DISCOS.map((d) => (
                <option key={d.value} value={d.value} style={{ background: "#1A1710", color: "#F2EBD9" }}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Meter type */}
          <div>
            <label className={labelCls}>Meter type</label>
            <div className="grid grid-cols-2 gap-3">
              {["single-phase", "three-phase"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm({ ...form, meter_type: type })}
                  className={`relative py-3.5 px-4 rounded border text-[13px] font-medium transition-all text-left ${
                    form.meter_type === type
                      ? "bg-gold/10 border-gold/35 text-cream"
                      : "bg-cream/[0.03] border-cream/10 text-cream/45 hover:border-cream/20"
                  }`}
                >
                  {form.meter_type === type && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-gold rounded-full flex items-center justify-center">
                      <Check size={9} className="text-soil" strokeWidth={3} />
                    </span>
                  )}
                  <span className="block font-semibold mb-0.5 capitalize">{type}</span>
                  <span className="text-[11px] text-cream/30 font-light">
                    {type === "single-phase" ? "Most homes" : "Industrial / large"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Alert threshold */}
          <div>
            <label className={labelCls}>Alert threshold (units)</label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="100"
                step="1"
                value={form.alert_threshold}
                onChange={(e) => setForm({ ...form, alert_threshold: e.target.value })}
                className={inputCls}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <span className="text-[11px] text-cream/30">kWh</span>
              </div>
            </div>
            <p className="text-[11px] text-cream/25 mt-1.5 font-light">
              You'll receive an alert when your estimated units drop below this number. Default is 10 kWh (~2–3 days).
            </p>
          </div>

          {/* Divider */}
          <div className="pt-2 border-t border-cream/[0.07]" />

          {/* Buttons */}
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="flex-1 text-center border border-cream/10 text-cream/50 text-[14px] py-3.5 rounded hover:border-cream/20 hover:text-cream transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gold text-soil text-[14px] font-semibold py-3.5 rounded hover:bg-gold-light transition-all hover:shadow-lg hover:shadow-gold/20 disabled:opacity-55"
            >
              {loading ? "Adding meter..." : "Add meter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
