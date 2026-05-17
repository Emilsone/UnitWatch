"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Zap, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) setError(error.message);
      else setSuccess("Check your email to confirm your account, then sign in.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else router.push("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-soil flex">
      {/* LEFT — branding panel */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden border-r border-cream/[0.06]">
        <div className="absolute inset-0 bg-dot-grid bg-[length:44px_44px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-gold/[0.07] pointer-events-none" />

        <div className="relative">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-soil fill-soil" strokeWidth={2.5} />
            </div>
            <span className="font-display text-xl font-bold text-cream">UnitWatch</span>
          </Link>
        </div>

        <div className="relative space-y-10">
          <div>
            <p className="font-display text-[10px] tracking-[0.18em] uppercase text-gold/50 mb-4">What our users say</p>
            <blockquote className="font-display text-[26px] font-bold text-cream leading-[1.35] italic mb-5">
              "I stopped running out of light the day I joined UnitWatch."
            </blockquote>
            <p className="font-semibold text-cream text-[13px]">Adaeze Okonkwo</p>
            <p className="text-cream/35 text-[12px] mt-0.5">Landlord, Lagos Island · 6 meters tracked</p>
          </div>

          <div className="bg-soil-800/80 border border-gold/15 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] text-cream/35 tracking-widest uppercase">My Home</span>
              <span className="text-[11px] font-medium text-unit-high">● Active</span>
            </div>
            <div className="font-display text-[42px] font-black text-cream leading-none mb-1">47.3</div>
            <div className="text-[10px] text-cream/30 tracking-[0.07em] mb-3">UNITS REMAINING (kWh)</div>
            <div className="h-1.5 bg-cream/[0.07] rounded-full overflow-hidden">
              <div className="h-full w-[63%] bg-gradient-to-r from-unit-high to-green-400 rounded-full" />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[10px] text-cream/25">~6 days left</span>
              <span className="text-[10px] text-unit-high font-medium">63%</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16">
        <div className="w-full max-w-[390px]">
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-gold rounded-lg flex items-center justify-center">
                <Zap size={14} className="text-soil fill-soil" strokeWidth={2.5} />
              </div>
              <span className="font-display text-lg font-bold text-cream">UnitWatch</span>
            </Link>
          </div>

          <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] text-cream/35 hover:text-cream/55 transition-colors mb-8">
            <ArrowLeft size={13} /> Back to home
          </Link>

          <h1 className="font-display text-[30px] font-bold text-cream tracking-tight mb-1.5">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-[14px] text-cream/40 font-light mb-8">
            {mode === "signin"
              ? "Sign in to check your units and alerts."
              : "Start tracking your prepaid meters for free."}
          </p>

          {/* Google */}
          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-cream/[0.05] border border-cream/12 text-cream text-[14px] font-medium py-3 rounded hover:bg-cream/[0.09] hover:border-cream/25 transition-all mb-5 disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-cream/[0.07]" />
            <span className="text-[11px] text-cream/20 tracking-wide">or email</span>
            <div className="flex-1 h-px bg-cream/[0.07]" />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] px-4 py-3 rounded mb-4 leading-relaxed">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-unit-high/10 border border-unit-high/20 text-unit-high text-[13px] px-4 py-3 rounded mb-4 leading-relaxed">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-[11px] text-cream/35 tracking-widest uppercase mb-2">Full name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  required placeholder="Adaeze Okonkwo"
                  className="w-full bg-cream/[0.05] border border-cream/10 text-cream text-[14px] px-4 py-3 rounded outline-none placeholder:text-cream/18 focus:border-gold/40 focus:bg-cream/[0.07] transition-all" />
              </div>
            )}
            <div>
              <label className="block text-[11px] text-cream/35 tracking-widest uppercase mb-2">Email address</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cream/20" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  required placeholder="you@example.com"
                  className="w-full bg-cream/[0.05] border border-cream/10 text-cream text-[14px] pl-10 pr-4 py-3 rounded outline-none placeholder:text-cream/18 focus:border-gold/40 focus:bg-cream/[0.07] transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] text-cream/35 tracking-widest uppercase mb-2">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cream/20" />
                <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  required placeholder="Min. 8 characters"
                  className="w-full bg-cream/[0.05] border border-cream/10 text-cream text-[14px] pl-10 pr-12 py-3 rounded outline-none placeholder:text-cream/18 focus:border-gold/40 focus:bg-cream/[0.07] transition-all" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cream/20 hover:text-cream/45 transition-colors">
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-gold text-soil text-[15px] font-semibold py-3.5 rounded hover:bg-gold-light transition-all hover:shadow-lg hover:shadow-gold/20 disabled:opacity-55 mt-1">
              {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="text-center text-[13px] text-cream/30 mt-6">
            {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setSuccess(""); }}
              className="text-gold hover:text-gold-light transition-colors font-medium">
              {mode === "signin" ? "Sign up free" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
