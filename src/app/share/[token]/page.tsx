"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  FileText,
  Lock,
  ShieldCheck,
  KeyRound,
  AlertTriangle,
  ArrowRight,
  Eye,
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

type Note = {
  id: string;
  title: string;
  content: string;
};

export default function SharePage() {
  const params = useParams();
  const token = params.token as string;

  const [note, setNote] = useState<Note | null>(null);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [accessKey, setAccessKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState("");

  // Prevent duplicate API call in React Strict Mode
  const hasLoaded = useRef(false);

  const loadShare = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/share/${token}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to access this share link");
        return;
      }

      // Password protected link
      if (data.requiresPassword) {
        setRequiresPassword(true);
        return;
      }

      // Public link
      setNote(data.note);
    } catch (error) {
      console.error("Share page error:", error);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || hasLoaded.current) return;
    hasLoaded.current = true;
    loadShare();
  }, [token]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accessKey.trim()) {
      setError("Please enter the access key");
      return;
    }

    try {
      setUnlocking(true);
      setError("");

      const response = await fetch(`/api/share/${token}/unlock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessKey,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid access key");
        return;
      }

      setNote(data.note);
      setRequiresPassword(false);
    } catch (error) {
      console.error("Unlock error:", error);
      setError("Something went wrong");
    } finally {
      setUnlocking(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <main className="relative flex min-h-screen items-center justify-center bg-[#020202] text-zinc-400 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,#020202_1px)] bg-[size:20px_20px]" />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-violet-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <p className="text-sm font-medium tracking-wide">Decrypting secure payload...</p>
        </div>
      </main>
    );
  }

  // Error State
  if (error && !requiresPassword) {
    return (
      <main className="relative flex min-h-screen items-center justify-center bg-[#020202] px-4 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,#020202_1px)] bg-[size:20px_20px]" />
        
        <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950/60 p-8 text-center shadow-2xl backdrop-blur-2xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white">
            Unable to access note
          </h1>

          <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
            {error}
          </p>
        </div>
      </main>
    );
  }

  // Password Protected State
  if (requiresPassword) {
    return (
      <main className="relative flex min-h-screen items-center justify-center bg-[#020202] px-4 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,#020202_1px)] bg-[size:20px_20px]" />
        <div className="pointer-events-none absolute left-1/2 bottom-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-violet-900/15 blur-[150px]" />

        <div className="relative z-10 w-full max-w-md animate-fade-in">
          <div className="mb-8 text-center">
            <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03] shadow-inner shadow-white/5 backdrop-blur-xl">
              <div className="absolute inset-0 rounded-3xl bg-violet-500/20 blur-xl" />
              <Lock className="relative h-7 w-7 text-violet-400" />
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white">
              Protected Vault
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              This note is encrypted. Enter the cryptographic access key to decrypt it.
            </p>
          </div>

          <Card className="border border-white/10 bg-zinc-950/60 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] backdrop-blur-2xl overflow-hidden relative">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

            <CardContent className="p-8">
              <form onSubmit={handleUnlock} className="space-y-6">
                <div className="space-y-2.5">
                  <Label htmlFor="accessKey" className="text-zinc-300 font-medium">
                    Access Key
                  </Label>
                  <div className="relative group">
                    <KeyRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-violet-400" />
                    <Input
                      id="accessKey"
                      type="password"
                      value={accessKey}
                      onChange={(e) => {
                        setAccessKey(e.target.value);
                        setError("");
                      }}
                      placeholder="Paste your access key here..."
                      autoComplete="off"
                      className="h-12 w-full border-white/10 bg-white/5 pl-12 text-white placeholder:text-zinc-600 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:border-violet-500 transition-all rounded-xl font-mono text-sm"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-3 rounded-xl border border-red-900/50 bg-red-950/50 p-3.5 text-sm text-red-300 animate-shake">
                    <span className="h-2 w-2 rounded-full bg-red-400 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={unlocking || !accessKey.trim()}
                  className="h-12 w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold hover:from-violet-500 hover:to-indigo-500 focus-visible:ring-4 focus-visible:ring-violet-500/30 transition-all duration-300 rounded-xl shadow-lg shadow-violet-950/40 active:scale-[0.98]"
                >
                  {unlocking ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Decrypting Vault...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Unlock Secure Note <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  // No note fallback
  if (!note) {
    return null;
  }

  // Successfully Decrypted & Opened Note View
  return (
    <main className="relative min-h-screen w-full bg-[#020202] px-4 py-12 text-white overflow-hidden">
      {/* Background Pattern + Glow */}
      <div className="absolute inset-0 h-full w-full bg-[#020202] bg-[radial-gradient(#ffffff10_1px,#020202_1px)] bg-[size:20px_20px]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-violet-900/15 blur-[150px]" />

      <div className="relative z-10 mx-auto max-w-3xl animate-fade-in">
        {/* Header Badge */}
        <div className="mb-6 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-400 backdrop-blur-md text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4" /> Securely Decrypted Note
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-300">
            <Eye className="h-3.5 w-3.5 text-violet-400" />
            <span>Verified Viewer</span>
          </div>
        </div>

        {/* Note Card */}
        <Card className="border border-white/10 bg-zinc-950/65 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] backdrop-blur-2xl overflow-hidden relative">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

          <CardHeader className="px-8 pt-8 pb-4 space-y-2">
            <div className="flex items-center gap-2.5 text-violet-400">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
                <FileText className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider">Payload Title</span>
            </div>

            <CardTitle className="text-3xl font-extrabold tracking-tight text-white pt-1">
              {note.title}
            </CardTitle>
          </CardHeader>

          <CardContent className="px-8 pb-8 pt-2">
            <div className="whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/40 p-6 text-sm leading-relaxed text-zinc-300 font-mono shadow-inner select-text">
              {note.content}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Global CSS for Animations */}
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