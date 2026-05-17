"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Zap, Bell, BarChart3, Users, ArrowRight,
  ChevronDown, Check, Star, Shield, Smartphone,
} from "lucide-react";

const TICKER = [
  "Lagos • 18.4 units left",
  "Abuja • Recharged ₦5,000",
  "Port Harcourt • 3.2 units — LOW ⚠",
  "Ibadan • 42 units remaining",
  "Enugu • Alert sent ✓",
  "Kano • Recharged ₦3,000",
  "Benin City • 7.1 units left",
  "Owerri • Dashboard updated",
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-soil text-cream overflow-x-hidden">
      <style>{`
        .reveal { opacity:0; transform:translateY(24px); transition:opacity .65s ease, transform .65s ease; }
        .reveal.visible { opacity:1; transform:translateY(0); }
        .d1{transition-delay:.1s} .d2{transition-delay:.2s} .d3{transition-delay:.3s} .d4{transition-delay:.4s}
        .ticker-track { display:inline-flex; animation:ticker 28s linear infinite; }
        @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .bar-fill { width:0; animation:fillBar 1.4s ease .6s forwards; }
        @keyframes fillBar { to { width:63%; } }
        .float-card { animation:floatCard 5s ease-in-out infinite; }
        @keyframes floatCard { 0%,100%{transform:translateY(0) rotate(-1.5deg)} 50%{transform:translateY(-14px) rotate(-1.5deg)} }
        .notif-pop { opacity:0; animation:slideIn .5s ease 2s forwards; }
        @keyframes slideIn { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
        .blink { animation:blink 1.6s ease-in-out infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>

      {/* ── NAV ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-soil/95 backdrop-blur-md border-b border-gold/10 py-3"
          : "py-5"
      }`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-gold rounded-md flex items-center justify-center">
              <Zap size={15} className="text-soil fill-soil" strokeWidth={2.5} />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-cream">UnitWatch</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/auth" className="text-sm font-medium text-cream/70 hover:text-cream px-4 py-2 rounded transition-colors">
              Sign in
            </Link>
            <Link href="/auth" className="text-sm font-semibold bg-gold text-soil px-5 py-2.5 rounded hover:bg-gold-light transition-all hover:shadow-lg hover:shadow-gold/20 hover:-translate-y-px">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── TICKER ── */}
      <div className="pt-[56px] bg-gold/[0.07] border-b border-gold/10 overflow-hidden">
        <div className="py-2.5 whitespace-nowrap overflow-hidden">
          <div className="ticker-track">
            {[...TICKER, ...TICKER].map((item, i) => (
              <span key={i} className="font-mono text-[11px] text-cream/40 px-8 tracking-widest">
                <span className={item.includes("LOW") ? "text-orange-400" : item.includes("✓") ? "text-unit-high" : "text-gold/60"}>●</span>
                {" "}{item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        {/* bg dot grid */}
        <div className="absolute inset-0 bg-dot-grid bg-[length:44px_44px] pointer-events-none" />
        {/* radial glow */}
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-radial from-gold/10 to-transparent pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-28 grid grid-cols-2 gap-20 items-center">
          {/* LEFT */}
          <div>
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-3.5 py-1.5 mb-7">
              <span className="blink w-1.5 h-1.5 rounded-full bg-unit-high" />
              <span className="text-[11px] text-cream/60 tracking-[0.07em] uppercase font-medium">Live unit tracking · Nigeria</span>
            </div>
            <h1 className="font-display text-[clamp(44px,5.5vw,72px)] font-black leading-[1.04] tracking-[-0.025em] text-cream mb-5">
              Never get caught<br />
              <em className="text-gold not-italic">in the dark</em><br />
              again.
            </h1>
            <p className="text-[17px] text-cream/50 leading-[1.75] max-w-[440px] font-light mb-9">
              Track your prepaid electricity units from anywhere in Nigeria. Know exactly how many kWh you have left — even when you're far from home.
            </p>
            <div className="flex gap-3 flex-wrap mb-12">
              <Link href="/auth"
                className="inline-flex items-center gap-2 bg-gold text-soil text-[15px] font-semibold px-8 py-4 rounded hover:bg-gold-light hover:-translate-y-0.5 transition-all hover:shadow-xl hover:shadow-gold/25">
                Start tracking free <ArrowRight size={16} />
              </Link>
              <a href="#how-it-works"
                className="inline-flex items-center gap-2 text-[15px] text-cream/70 border border-cream/15 px-7 py-4 rounded hover:border-cream/35 hover:text-cream hover:bg-cream/[0.04] transition-all">
                How it works <ChevronDown size={15} />
              </a>
            </div>
            <div className="flex gap-8 pt-8 border-t border-cream/[0.08]">
              {[["12k+","Active users"],["6 DisCos","Supported"],["99.9%","Uptime"]].map(([n,l])=>(
                <div key={l}>
                  <div className="font-display text-2xl font-bold text-gold">{n}</div>
                  <div className="text-[11px] text-cream/35 mt-0.5">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — floating meter card */}
          <div className="relative flex justify-center items-center py-10">
            {/* Meter Card */}
            <div className="float-card relative z-10 bg-gradient-to-br from-soil-800 to-soil-700 border border-gold/20 rounded-2xl p-7 w-[300px] shadow-[0_32px_80px_rgba(0,0,0,0.6)]">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[10px] text-cream/35 tracking-[0.09em] uppercase mb-1">My Home</p>
                  <p className="font-mono text-[12px] text-cream/40">0101-2039-4812</p>
                </div>
                <div className="w-9 h-9 rounded-[10px] bg-unit-high/10 border border-unit-high/25 flex items-center justify-center">
                  <Zap size={15} className="text-unit-high" />
                </div>
              </div>
              <div className="text-center mb-5">
                <div className="font-display text-[68px] font-black text-cream leading-none mb-1">47.3</div>
                <div className="text-[10px] text-cream/35 tracking-[0.08em]">UNITS REMAINING (kWh)</div>
              </div>
              {/* Progress */}
              <div className="mb-5">
                <div className="h-1.5 bg-cream/[0.07] rounded-full overflow-hidden mb-1.5">
                  <div className="bar-fill h-full bg-gradient-to-r from-unit-high to-green-400 rounded-full" />
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-cream/25">0</span>
                  <span className="text-[11px] text-unit-high font-medium">63% full</span>
                  <span className="text-[10px] text-cream/25">75 kWh</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[["~6 days","Estimated left"],["₦12,500","Last recharge"]].map(([v,l])=>(
                  <div key={l} className="bg-cream/[0.04] border border-cream/[0.06] rounded-xl p-3">
                    <div className="text-[14px] font-semibold text-cream mb-0.5">{v}</div>
                    <div className="text-[10px] text-cream/30">{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notification pop */}
            <div className="notif-pop absolute top-0 -right-6 z-20 bg-soil-800 border border-gold/35 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 shadow-xl max-w-[210px]">
              <div className="w-8 h-8 bg-gold/12 rounded-lg flex items-center justify-center flex-shrink-0">
                <Bell size={13} className="text-gold" />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-cream leading-tight">Low units alert</p>
                <p className="text-[11px] text-cream/40">Shop: 5.1 kWh left</p>
              </div>
            </div>

            {/* DisCo tag */}
            <div className="absolute bottom-2 -left-4 z-20 bg-soil-800 border border-cream/10 rounded-xl px-3 py-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-gold rounded-full" />
              <span className="text-[12px] text-cream/50">Ikeja Electric</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="reveal text-center mb-16">
            <div className="w-9 h-0.5 bg-gold mx-auto mb-5" />
            <h2 className="font-display text-[clamp(30px,4vw,52px)] font-bold text-cream tracking-tight mb-4">
              Three steps to peace of mind
            </h2>
            <p className="text-[16px] text-cream/45 font-light">No hardware. No electrician. No DisCo office visits.</p>
          </div>
          <div className="grid grid-cols-3 gap-5">
            {[
              { n:"01", icon:<Users size={22} className="text-gold"/>, title:"Sign up & add your meter", body:"Create an account in 30 seconds with Google or email. Enter your meter number and nickname — Home, Shop, Tenant 2. Supports all major DisCos.", d:"d1" },
              { n:"02", icon:<BarChart3 size={22} className="text-gold"/>, title:"Log each recharge", body:"Every time you buy units, log the amount paid and units received. UnitWatch calculates your daily consumption and predicts when you'll run out.", d:"d2" },
              { n:"03", icon:<Bell size={22} className="text-gold"/>, title:"Get alerts anywhere", body:"Set your own alert threshold — say 10 units. We'll notify you by email and push before darkness comes knocking, no matter where you are.", d:"d3" },
            ].map((s)=>(
              <div key={s.n} className={`reveal ${s.d} relative bg-cream/[0.03] border border-cream/[0.07] rounded-2xl p-8 hover:bg-cream/[0.05] hover:border-gold/20 hover:-translate-y-1 transition-all duration-300`}>
                <div className="font-display text-[76px] font-black text-gold/[0.055] absolute top-3 right-5 leading-none">{s.n}</div>
                <div className="w-11 h-11 bg-gold/10 border border-gold/20 rounded-xl flex items-center justify-center mb-5">{s.icon}</div>
                <h3 className="text-[18px] font-semibold text-cream tracking-tight mb-3">{s.title}</h3>
                <p className="text-[14px] text-cream/45 leading-[1.75] font-light">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <div className="bg-gold/[0.05] border-y border-gold/10 py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-4 gap-8 text-center">
          {[["12,400+","Meters tracked"],["₦2.1B+","Units recharged via alerts"],["6","DisCos supported"],["4.8★","Average rating"]].map(([n,l])=>(
            <div key={l} className="reveal">
              <div className="font-display text-[48px] font-bold text-gold leading-none mb-2">{n}</div>
              <div className="text-[13px] text-cream/35">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── TESTIMONIALS ── */}
      <section className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="reveal text-center mb-16">
            <div className="w-9 h-0.5 bg-gold mx-auto mb-5" />
            <h2 className="font-display text-[clamp(28px,4vw,48px)] font-bold text-cream tracking-tight">
              What Nigerians are saying
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-5">
            {[
              { name:"Adaeze Okonkwo", loc:"Lagos Island", role:"Landlord, 6 units", q:"I manage 6 tenants. Before UnitWatch I was driving home every weekend just to check meters. Now I do it from my phone at work in one glance.", d:"d1" },
              { name:"Emeka Nwosu", loc:"Port Harcourt", role:"Homeowner", q:"The alert saved me twice. I was in Abuja for a meeting when my wife's meter hit 5 units. Bought units immediately — the family didn't even notice.", d:"d2" },
              { name:"Funke Balogun", loc:"Abuja", role:"Small business owner", q:"My shop and my house on one dashboard. The daily estimate is scary accurate. I've completely stopped running out. Not once since I joined.", d:"d3" },
            ].map((t)=>(
              <div key={t.name} className={`reveal ${t.d} bg-cream/[0.03] border border-cream/[0.07] rounded-2xl p-8 hover:border-gold/18 hover:-translate-y-1 transition-all duration-300`}>
                <span className="font-display text-[64px] text-gold/20 leading-none block -mb-1">"</span>
                <p className="text-[14px] text-cream/65 leading-[1.8] font-light mb-5">{t.q}</p>
                <div className="flex gap-0.5 mb-4">{Array(5).fill(0).map((_,i)=><Star key={i} size={12} className="text-gold fill-gold"/>)}</div>
                <div className="border-t border-cream/[0.07] pt-4">
                  <div className="text-[14px] font-semibold text-cream">{t.name}</div>
                  <div className="text-[11px] text-cream/30 mt-0.5">{t.role} · {t.loc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES LIST ── */}
      <section className="py-16 px-6 border-t border-cream/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="reveal text-center mb-14">
            <div className="w-9 h-0.5 bg-gold mx-auto mb-5" />
            <h2 className="font-display text-[clamp(28px,4vw,48px)] font-bold text-cream tracking-tight">
              Everything you need, nothing you don't
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon:<Shield size={18} className="text-gold"/>, title:"Supabase Auth + Google Sign-in", desc:"Secure login, one tap with Google or email." },
              { icon:<Zap size={18} className="text-gold"/>, title:"Multi-meter dashboard", desc:"Add unlimited meters — home, shop, tenants — all in one view." },
              { icon:<BarChart3 size={18} className="text-gold"/>, title:"Smart consumption estimates", desc:"Auto-calculated daily usage from your recharge history." },
              { icon:<Bell size={18} className="text-gold"/>, title:"Low-unit alerts", desc:"Email + push notifications before you run out." },
              { icon:<Smartphone size={18} className="text-gold"/>, title:"Mobile-first design", desc:"Built for slow Nigerian connections. Works everywhere." },
              { icon:<ArrowRight size={18} className="text-gold"/>, title:"Quick recharge links", desc:"One-click to BuyPower and DisCo portals from each meter card." },
            ].map((f)=>(
              <div key={f.title} className="reveal flex items-start gap-4 bg-cream/[0.03] border border-cream/[0.07] rounded-xl p-5 hover:border-gold/18 transition-all">
                <div className="w-9 h-9 bg-gold/10 border border-gold/18 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">{f.icon}</div>
                <div>
                  <div className="text-[14px] font-semibold text-cream mb-1">{f.title}</div>
                  <div className="text-[13px] text-cream/40 font-light leading-relaxed">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="reveal text-center mb-16">
            <div className="w-9 h-0.5 bg-gold mx-auto mb-5" />
            <h2 className="font-display text-[clamp(28px,4vw,48px)] font-bold text-cream tracking-tight mb-3">
              Simple, honest pricing
            </h2>
            <p className="text-[16px] text-cream/45 font-light">No surprises. No hidden fees.</p>
          </div>
          <div className="grid grid-cols-2 gap-5">
            {[
              { plan:"Free", price:"₦0", period:"forever", desc:"Perfect for a single household.",
                features:["1 meter","Full recharge history","Email alerts","7-day consumption chart"],
                cta:"Start free", highlight:false },
              { plan:"Pro", price:"₦1,500", period:"per month", desc:"For landlords & multi-property owners.",
                features:["Up to 10 meters","Push & SMS alerts","Full consumption analytics","Multi-property dashboard","Priority support"],
                cta:"Start 14-day trial", highlight:true },
            ].map((p)=>(
              <div key={p.plan} className={`reveal relative rounded-2xl p-10 ${p.highlight ? "bg-gradient-to-br from-gold/10 to-gold/[0.04] border border-gold/32" : "bg-cream/[0.03] border border-cream/[0.08]"} hover:-translate-y-1 transition-all`}>
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-soil text-[10px] font-bold px-4 py-1 rounded-full tracking-widest uppercase whitespace-nowrap">
                    Most popular
                  </div>
                )}
                <div className="text-[11px] text-cream/35 tracking-widest uppercase mb-1.5">{p.plan}</div>
                <div className="font-display text-[52px] font-bold text-cream leading-none mb-1">{p.price}</div>
                <div className="text-[13px] text-cream/35 mb-4">{p.period}</div>
                <p className="text-[14px] text-cream/45 mb-7 font-light">{p.desc}</p>
                <ul className="space-y-3 mb-8">
                  {p.features.map((f)=>(
                    <li key={f} className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${p.highlight ? "bg-gold/12 border border-gold/28" : "bg-unit-high/12 border border-unit-high/28"}`}>
                        <Check size={10} className={p.highlight ? "text-gold" : "text-unit-high"} strokeWidth={3}/>
                      </div>
                      <span className="text-[13px] text-cream/60">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/auth" className={`flex items-center justify-center gap-2 w-full py-3.5 rounded text-[15px] font-semibold transition-all ${
                  p.highlight
                    ? "bg-gold text-soil hover:bg-gold-light hover:shadow-lg hover:shadow-gold/25"
                    : "border border-cream/18 text-cream hover:border-cream/38 hover:bg-cream/[0.04]"
                }`}>
                  {p.cta} <ArrowRight size={15}/>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="reveal relative bg-gradient-to-br from-gold/10 to-green-900/10 border border-gold/20 rounded-3xl px-16 py-20 text-center overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gold/5 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="w-9 h-0.5 bg-gold mx-auto mb-5" />
            <h2 className="font-display text-[clamp(28px,4vw,56px)] font-black text-cream tracking-tight mb-4 leading-[1.05]">
              Your light.<br />Your control.
            </h2>
            <p className="text-[17px] text-cream/50 max-w-md mx-auto mb-9 font-light leading-relaxed">
              Join thousands of Nigerians who've stopped guessing and started knowing. Free to start, takes 60 seconds.
            </p>
            <Link href="/auth" className="inline-flex items-center gap-2 bg-gold text-soil text-[16px] font-bold px-10 py-4 rounded hover:bg-gold-light hover:-translate-y-0.5 transition-all hover:shadow-xl hover:shadow-gold/25">
              Create your free account <ArrowRight size={17}/>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-cream/[0.07] py-10 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-gold rounded-md flex items-center justify-center">
              <Zap size={13} className="text-soil fill-soil" strokeWidth={2.5}/>
            </div>
            <span className="font-display text-[17px] font-bold text-cream">UnitWatch</span>
          </div>
          <p className="text-[12px] text-cream/25">© 2025 UnitWatch. Built for Nigeria, by Nigerians.</p>
          <div className="flex gap-6">
            {["Privacy","Terms","Contact"].map((l)=>(
              <a key={l} href="#" className="text-[13px] text-cream/30 hover:text-gold transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}
