"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  Eye,
  FileText,
  Link2,
  Lock,
  Check,
  Ban,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ShareLink = {
  id: string;
  token: string;
  shareType: "ONE_TIME" | "TIME_BASED";
  accessType: "PUBLIC" | "PASSWORD";
  expiresAt: string | null;
  revokedAt: string | null;
  usedAt: string | null;
  viewCount: number;
};

type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  shareLinks: ShareLink[];
};

export default function NoteDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const loadNote = async () => {
    try {
      const response = await fetch(`/api/notes/${id}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to load note");
        return;
      }

      setNote(data.note);
    } catch {
      setError("Failed to load note");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNote();
  }, [id]);

  const revokeShare = async (shareId: string) => {
    const response = await fetch(
      `/api/notes/${id}/share/${shareId}/revoke`,
      {
        method: "POST",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Failed to revoke link");
      return;
    }

    await loadNote();
  };

  const copyLink = async (token: string) => {
    const url = `${window.location.origin}/share/${token}`;

    await navigator.clipboard.writeText(url);

    setCopied(token);

    setTimeout(() => {
      setCopied("");
    }, 2000);
  };

  if (loading) {
    return (
      <main className="relative flex min-h-screen items-center justify-center bg-[#020202] text-zinc-400 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,#020202_1px)] bg-[size:20px_20px]" />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-violet-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <p className="text-sm font-medium tracking-wide">Loading secure vault...</p>
        </div>
      </main>
    );
  }

  if (error || !note) {
    return (
      <main className="relative flex min-h-screen items-center justify-center bg-[#020202] px-4 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,#020202_1px)] bg-[size:20px_20px]" />
        <div className="relative z-10 text-center max-w-md p-8 rounded-3xl border border-white/10 bg-zinc-950/60 backdrop-blur-2xl shadow-2xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
            <Ban className="h-6 w-6" />
          </div>
          <p className="text-lg font-semibold text-white">
            {error || "Note not found"}
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            The requested note may have expired, been deleted, or never existed.
          </p>
          <Link
            href="/notes/new"
            className="mt-6 inline-flex items-center justify-center w-full h-12 rounded-xl bg-violet-600 font-semibold text-white transition hover:bg-violet-500"
          >
            Create a new note
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen w-full bg-[#020202] px-4 py-12 text-white overflow-hidden">
      {/* Background Dot Pattern + Glows */}
      <div className="absolute inset-0 h-full w-full bg-[#020202] bg-[radial-gradient(#ffffff10_1px,#020202_1px)] bg-[size:20px_20px]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-violet-900/15 blur-[150px]" />

      <div className="relative z-10 mx-auto max-w-5xl animate-fade-in">
        {/* Navigation / Header Bar */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/notes/new"
            className="group inline-flex items-center gap-2.5 text-sm text-zinc-400 transition hover:text-white"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition group-hover:border-violet-500/50 group-hover:bg-violet-500/10">
              <ArrowLeft className="h-4 w-4 text-zinc-400 group-hover:text-violet-400 transition-colors" />
            </div>
            <span className="font-medium">Create another note</span>
          </Link>

          <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-400 backdrop-blur-md text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="h-3.5 w-3.5" /> Vault Dashboard
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          {/* Note Content Card */}
          <Card className="border border-white/10 bg-zinc-950/65 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] backdrop-blur-2xl overflow-hidden relative flex flex-col">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

            <CardHeader className="px-8 pt-8 pb-4 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-violet-400">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
                    <FileText className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider">Payload Content</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(note.createdAt).toLocaleDateString()}
                </div>
              </div>

              <CardTitle className="text-2xl font-bold tracking-tight text-white pt-2">
                {note.title}
              </CardTitle>
            </CardHeader>

            <CardContent className="px-8 pb-8 flex-1">
              <div className="whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/40 p-6 text-sm leading-relaxed text-zinc-300 font-mono shadow-inner select-text">
                {note.content}
              </div>
            </CardContent>
          </Card>

          {/* Share Links Management Card */}
          <Card className="border border-white/10 bg-zinc-950/65 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] backdrop-blur-2xl overflow-hidden relative flex flex-col">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

            <CardHeader className="px-8 pt-8 pb-4 space-y-1">
              <div className="flex items-center gap-2.5 text-violet-400">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
                  <Link2 className="h-4 w-4" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider">Active Links</span>
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-white pt-2">
                Share Parameters
              </CardTitle>
              <CardDescription className="text-zinc-400 text-sm">
                Monitor access statistics or revoke tokens instantly.
              </CardDescription>
            </CardHeader>

            <CardContent className="px-8 pb-8 space-y-4 flex-1">
              {note.shareLinks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                  <Link2 className="h-8 w-8 text-zinc-600 mb-2" />
                  <p className="text-sm text-zinc-400 font-medium">No share links generated yet.</p>
                </div>
              ) : (
                note.shareLinks.map((share) => (
                  <div
                    key={share.id}
                    className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.04]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          {share.accessType === "PASSWORD" ? (
                            <Lock className="h-4 w-4 text-amber-400" />
                          ) : (
                            <Link2 className="h-4 w-4 text-violet-400" />
                          )}

                          <span className="text-sm font-semibold text-white">
                            {share.accessType === "PASSWORD"
                              ? "Password Protected"
                              : "Public Access"}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-zinc-400 font-medium">
                          {share.shareType === "ONE_TIME"
                            ? "One-Time Self-Destruct"
                            : "Time-Based Lifespan"}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-300">
                        <Eye className="h-3.5 w-3.5 text-violet-400" />
                        <span>{share.viewCount} views</span>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center gap-2.5">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => copyLink(share.token)}
                        disabled={!!share.revokedAt}
                        className="h-10 flex-1 border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all"
                      >
                        {copied === share.token ? (
                          <span className="flex items-center gap-2 text-violet-400">
                            <Check className="h-3.5 w-3.5" /> Copied Link
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Copy className="h-3.5 w-3.5" /> Copy Link
                          </span>
                        )}
                      </Button>

                      {!share.revokedAt && !share.usedAt && (
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => revokeShare(share.id)}
                          className="h-10 px-4 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-900/50 rounded-xl transition-all"
                        >
                          <Ban className="mr-1.5 h-3.5 w-3.5" />
                          Revoke
                        </Button>
                      )}
                    </div>

                    {/* Status Banners */}
                    {share.revokedAt && (
                      <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-900/50 bg-red-950/40 p-3 text-xs text-red-300">
                        <Ban className="h-4 w-4 text-red-400 flex-shrink-0" />
                        <span>This secure link has been manually revoked.</span>
                      </div>
                    )}

                    {share.usedAt && (
                      <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-900/50 bg-amber-950/40 p-3 text-xs text-amber-300">
                        <ShieldCheck className="h-4 w-4 text-amber-400 flex-shrink-0" />
                        <span>One-time link consumed and self-destructed.</span>
                      </div>
                    )}

                    {share.expiresAt && !share.revokedAt && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500 font-mono">
                        <span>Expires on: {new Date(share.expiresAt).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
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
      `}</style>
    </main>
  );
}