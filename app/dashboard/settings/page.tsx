"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Zap, ArrowLeft, User, Bell, Shield, LogOut, Save } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [meterCount, setMeterCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [emailAlerts, setEmailAlerts] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push("/auth"); return; }
      setUser(data.user);
      setDisplayName(data.user.user_metadata?.full_name || "");
      const { count } = await supabase.from("meters").select("*", { count: "exact" }).eq("user_id", data.user.id);
      setMeterCount(count || 0);
      setLoading(false);
    });
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    await supabase.auth.updateUser({ data: { full_name: displayName } });
    setNotification("Profile updated!");
    setTimeout(() => setNotification(""), 3000);
    setSaving(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const inputCls = "w-full bg-cream/[0.05] border border-cream/10 text-cream text-[14px] px-4 py-3 rounded outline-none focus:border-gold/40 transition-all";
  const labelCls = "block text-[11px] text-cream/35 tracking-widest uppercase mb-2";

  if (loading) return (
    <div className="min-h-screen bg-soil flex items-center justify-center">
      <p className="text-cream/30 text-sm">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-soil pb-16">
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-unit-high text-soil font-semibold text-sm px-5 py-3 rounded-lg shadow-xl">
          ✓ {notification}
        </div>
      )}

      {/* NAV */}
      <nav className="sticky top-0 z-40 bg-soil/95 backdrop-blur-md border-b border-cream/[0.07]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-7 h-7 bg-gold rounded-md flex items-center justify-center">
            <Zap size={14} className="text-soil fill-soil" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-bold text-cream">UnitWatch</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-[13px] text-cream/35 hover:text-cream/55 transition-colors mb-8">
          <ArrowLeft size={13} /> Back to dashboard
        </Link>

        <div className="mb-8">
          <div className="w-9 h-0.5 bg-gold mb-4" />
          <h1 className="font-display text-[30px] font-bold text-cream tracking-tight">Settings</h1>
        </div>

        {/* ACCOUNT OVERVIEW */}
        <div className="bg-cream/[0.03] border border-cream/[0.07] rounded-2xl p-6 mb-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gold/15 border border-gold/25 flex items-center justify-center flex-shrink-0">
            <span className="font-display text-[22px] font-bold text-gold">
              {(displayName || user?.email || "?")[0].toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-semibold text-cream text-[15px]">{displayName || "No name set"}</div>
            <div className="text-[13px] text-cream/40 mt-0.5">{user?.email}</div>
            <div className="text-[12px] text-cream/25 mt-1">{meterCount} meter{meterCount !== 1 ? "s" : ""} · Free plan</div>
          </div>
        </div>

        {/* PROFILE SECTION */}
        <div className="bg-cream/[0.03] border border-cream/[0.07] rounded-2xl p-6 mb-5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 bg-gold/10 border border-gold/18 rounded-lg flex items-center justify-center">
              <User size={14} className="text-gold" />
            </div>
            <h2 className="text-[15px] font-semibold text-cream">Profile</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Display name</label>
              <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your full name" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Email address</label>
              <input type="email" value={user?.email || ""} disabled
                className={`${inputCls} opacity-40 cursor-not-allowed`} />
              <p className="text-[11px] text-cream/22 mt-1.5 font-light">Email cannot be changed here.</p>
            </div>
            <button onClick={handleSaveProfile} disabled={saving}
              className="flex items-center gap-2 bg-gold text-soil text-[13px] font-semibold px-5 py-2.5 rounded hover:bg-gold-light transition-all disabled:opacity-55">
              <Save size={14} /> {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>

        {/* NOTIFICATIONS SECTION */}
        <div className="bg-cream/[0.03] border border-cream/[0.07] rounded-2xl p-6 mb-5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 bg-gold/10 border border-gold/18 rounded-lg flex items-center justify-center">
              <Bell size={14} className="text-gold" />
            </div>
            <h2 className="text-[15px] font-semibold text-cream">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-cream/[0.06]">
              <div>
                <p className="text-[14px] text-cream font-medium">Email alerts</p>
                <p className="text-[12px] text-cream/35 mt-0.5 font-light">Get emailed when any meter drops below its alert threshold.</p>
              </div>
              <button
                onClick={() => setEmailAlerts(!emailAlerts)}
                className={`relative w-11 h-6 rounded-full transition-all ${emailAlerts ? "bg-gold" : "bg-cream/[0.12]"}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${emailAlerts ? "left-5" : "left-0.5"}`} />
              </button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-[14px] text-cream font-medium">Weekly summary</p>
                <p className="text-[12px] text-cream/35 mt-0.5 font-light">A weekly email summarising all your meters and usage patterns.</p>
              </div>
              <button className="relative w-11 h-6 rounded-full bg-cream/[0.12] transition-all">
                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-all" />
              </button>
            </div>
          </div>
          <p className="text-[11px] text-cream/22 mt-4 font-light">
            Alert thresholds are set per meter. Go to a specific meter page to change when you get notified.
          </p>
        </div>

        {/* SECURITY SECTION */}
        <div className="bg-cream/[0.03] border border-cream/[0.07] rounded-2xl p-6 mb-5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 bg-gold/10 border border-gold/18 rounded-lg flex items-center justify-center">
              <Shield size={14} className="text-gold" />
            </div>
            <h2 className="text-[15px] font-semibold text-cream">Security</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[14px] text-cream font-medium">Authentication method</p>
                <p className="text-[12px] text-cream/35 mt-0.5 font-light">
                  {user?.app_metadata?.provider === "google" ? "Signed in via Google" : "Email & password"}
                </p>
              </div>
              <span className="text-[11px] text-cream/30 bg-cream/[0.05] border border-cream/[0.08] px-3 py-1.5 rounded-full capitalize">
                {user?.app_metadata?.provider || "email"}
              </span>
            </div>
          </div>
        </div>

        {/* SIGN OUT */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 border border-red-500/20 text-red-400/70 text-[14px] py-3.5 rounded hover:border-red-500/35 hover:text-red-400 transition-all"
        >
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </div>
  );
}
