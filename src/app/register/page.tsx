"use client";

import { FormEvent, useState } from "react";
import Link from "next/navigation"; // or next/link, keeping next/link as original
import LinkComponent from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      router.push("/login");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#020202] px-4 py-10 text-white">
      {/* Background Dot Pattern + Subtle Gradients */}
      <div className="absolute inset-0 h-full w-full bg-[#020202] bg-[radial-gradient(#ffffff10_1px,#020202_1px)] bg-[size:20px_20px]" />
      
      <div className="pointer-events-none absolute left-1/2 bottom-0 h-[600px] w-[800px] -translate-x-1/2 translate-y-[20%] rounded-full bg-violet-900/20 blur-[150px]" />
      <div className="pointer-events-none absolute top-0 right-0 h-[300px] w-[300px] rounded-full bg-indigo-900/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* Logo Section */}
        <div className="mb-10 text-center">
          <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03] shadow-inner shadow-white/5 backdrop-blur-xl">
            <div className="absolute inset-0 rounded-3xl bg-violet-500/20 blur-xl" />
            <ShieldCheck className="relative h-8 w-8 text-violet-400 drop-shadow-[0_0_10px_rgba(139,92,246,0.7)]" />
          </div>

          <h1 className="text-4xl font-bold tracking-tighter text-white">
            Secure<span className="text-violet-500">Notes</span>
          </h1>

          <p className="mt-2.5 text-sm text-zinc-400 max-w-xs mx-auto">
            Create your encrypted vault. Private by default.
          </p>
        </div>

        {/* Main Register Card */}
        <Card className="border border-white/10 bg-zinc-950/60 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] backdrop-blur-2xl overflow-hidden relative">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

          <CardHeader className="space-y-3 pb-6 pt-8 px-8">
            <CardTitle className="text-3xl text-white tracking-tight">
              Create an account
            </CardTitle>
            <CardDescription className="text-zinc-400 text-base">
              Start building and securely sharing your notes.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2.5">
                <Label htmlFor="email" className="text-zinc-300 font-medium">
                  Email Address
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-violet-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 w-full border-white/10 bg-white/5 pl-12 text-white placeholder:text-zinc-600 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:border-violet-500 transition-all duration-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2.5">
                <Label htmlFor="password" className="text-zinc-300 font-medium">
                  Password
                </Label>
                <div className="relative group">
                  <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-violet-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 w-full border-white/10 bg-white/5 pl-12 pr-12 text-white placeholder:text-zinc-600 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:border-violet-500 transition-all duration-200 rounded-xl"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-zinc-200 focus:outline-none focus:text-violet-400 rounded-full p-1"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Box */}
              {error && (
                <div className="flex items-center gap-3 rounded-xl border border-red-900/50 bg-red-950/50 p-4 text-sm text-red-300 animate-shake">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-500/20">
                    <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                  </div>
                  <p>{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold hover:from-violet-500 hover:to-indigo-500 focus-visible:ring-4 focus-visible:ring-violet-500/30 transition-all duration-300 rounded-xl shadow-lg shadow-violet-950/30 active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Creating account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            {/* Footer Link */}
            <p className="mt-8 text-center text-sm text-zinc-500">
              Already have an account?{" "}
              <LinkComponent
                href="/login"
                className="font-medium text-violet-400 transition hover:text-violet-300 hover:underline underline-offset-4"
              >
                Sign in
              </LinkComponent>
            </p>
          </CardContent>
        </Card>

        {/* Bottom Text */}
        <p className="mt-8 text-center text-xs text-zinc-700">
          Passwords are securely hashed with bcrypt prior to storage.
        </p>
      </div>

      {/* Animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-5px); }
          40%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </main>
  );
}