import Link from "next/link";
import { ShieldCheck, Lock, Clock3, Link2, ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full bg-[#020202] text-white overflow-hidden">
      {/* Background Dot Pattern + Subtle Glows */}
      <div className="absolute inset-0 h-full w-full bg-[#020202] bg-[radial-gradient(#ffffff10_1px,#020202_1px)] bg-[size:20px_20px]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-violet-900/15 blur-[150px]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center py-20">
        
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-violet-400 mb-6 backdrop-blur-md shadow-lg shadow-violet-950/40">
          <ShieldCheck className="h-4 w-4" />
          <span>Secure Note Sharing Platform</span>
        </div>

        {/* Main Headline */}
        <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight sm:text-7xl leading-tight">
          Create notes.
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Share securely.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 max-w-2xl text-base text-zinc-400 sm:text-lg leading-relaxed">
          Draft private notes and distribute them effortlessly with cryptographically-secure share links, password protection, one-time access, and absolute expiry controls.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row w-full max-w-sm justify-center">
          <Link
            href="/register"
            className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-7 py-4 font-semibold text-white transition-all hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-950/50 active:scale-[0.98]"
          >
            <Sparkles className="h-4 w-4" />
            Get Started
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/login"
            className="flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] px-7 py-4 font-semibold text-white transition-all hover:bg-white/[0.06] hover:border-white/20 backdrop-blur-md"
          >
            Login to Vault
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="mt-20 grid w-full max-w-4xl gap-6 sm:grid-cols-3">
          
          {/* Card 1 */}
          <div className="group relative rounded-2xl border border-white/10 bg-zinc-950/60 p-6 text-left transition-all duration-300 hover:border-violet-500/40 hover:bg-zinc-950/80 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] backdrop-blur-xl overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
              <Link2 className="h-5 w-5" />
            </div>
            <h2 className="font-semibold text-white text-lg">Secure Links</h2>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
              Generate unique, hard-to-guess tokens for every shared note instance.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group relative rounded-2xl border border-white/10 bg-zinc-950/60 p-6 text-left transition-all duration-300 hover:border-violet-500/40 hover:bg-zinc-950/80 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] backdrop-blur-xl overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
              <Lock className="h-5 w-5" />
            </div>
            <h2 className="font-semibold text-white text-lg">Protected Access</h2>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
              Secure sensitive content using dynamic keys stored safely via bcrypt hashes.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group relative rounded-2xl border border-white/10 bg-zinc-950/60 p-6 text-left transition-all duration-300 hover:border-violet-500/40 hover:bg-zinc-950/80 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] backdrop-blur-xl overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
              <Clock3 className="h-5 w-5" />
            </div>
            <h2 className="font-semibold text-white text-lg">Expiry Control</h2>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
              Enforce self-destruction with atomic one-time views or time-based expiry timestamps.
            </p>
          </div>

        </div>

      </div>
    </main>
  );
}