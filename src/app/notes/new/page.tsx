"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Link2,
  Lock,
  Globe2,
  Clock3,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight,
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
import { Textarea } from "@/components/ui/textarea";

type ShareType = "ONE_TIME" | "TIME_BASED";
type AccessType = "PUBLIC" | "PASSWORD";

export default function NewNotePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [shareType, setShareType] = useState<ShareType>("ONE_TIME");
  const [accessType, setAccessType] = useState<AccessType>("PUBLIC");
  const [expiresAt, setExpiresAt] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [shareUrl, setShareUrl] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [createdNoteId, setCreatedNoteId] = useState(""); // <-- Note ID store karne ke liye state

  const [copied, setCopied] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false); // <-- Access key copy status

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      // 1. Create note
      const noteResponse = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
        }),
      });

      const noteData = await noteResponse.json();

      if (!noteResponse.ok) {
        setError(noteData.message || "Failed to create note");
        return;
      }

      const noteId = noteData.note.id;
      setCreatedNoteId(noteId); // Save note ID for later redirection

      // 2. Create share link
      const shareBody: {
        shareType: ShareType;
        accessType: AccessType;
        expiresAt?: string;
      } = {
        shareType,
        accessType,
      };

      if (shareType === "TIME_BASED") {
        if (!expiresAt) {
          setError("Please select an expiry date and time.");
          return;
        }
        shareBody.expiresAt = new Date(expiresAt).toISOString();
      }

      const shareResponse = await fetch(`/api/notes/${noteId}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(shareBody),
      });

      const shareData = await shareResponse.json();

      if (!shareResponse.ok) {
        setError(shareData.message || "Failed to create share link");
        return;
      }

      setShareUrl(shareData.share.shareUrl);
      setAccessKey(shareData.share.accessKey || "");

      // ❌ Auto-redirect (setTimeout) REMOVED here so user can securely copy keys!
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyShareUrl = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyAccessKey = async () => {
    await navigator.clipboard.writeText(accessKey);
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 2000);
  };

  return (
    <main className="relative min-h-screen w-full bg-[#020202] px-4 py-12 text-white overflow-hidden">
      {/* Background Dot Pattern + Subtle Glows */}
      <div className="absolute inset-0 h-full w-full bg-[#020202] bg-[radial-gradient(#ffffff10_1px,#020202_1px)] bg-[size:20px_20px]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-violet-900/15 blur-[150px]" />

      <div className="relative z-10 mx-auto max-w-3xl animate-fade-in">
        {/* Header Section */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-400 mb-4 backdrop-blur-md">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Secure Vault
            </span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Create a secure note
          </h1>

          <p className="mt-2 text-base text-zinc-400 max-w-xl">
            Draft your private content and configure granular, cryptographically-secure sharing policies.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Note Card */}
          {!shareUrl && (
            <Card className="border border-white/10 bg-zinc-950/60 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] backdrop-blur-2xl overflow-hidden relative">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

              <CardHeader className="space-y-2 px-8 pt-8 pb-4">
                <CardTitle className="flex items-center gap-3 text-2xl text-white">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
                    <FileText className="h-5 w-5" />
                  </div>
                  Note Payload
                </CardTitle>

                <CardDescription className="text-zinc-400 text-sm">
                  Add the title and secure body content you wish to distribute.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 px-8 pb-8">
                <div className="space-y-2.5">
                  <Label htmlFor="title" className="text-zinc-300 font-medium">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Q3 Confidential Strategy"
                    className="h-12 w-full border-white/10 bg-white/5 px-4 text-white placeholder:text-zinc-600 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:border-violet-500 transition-all rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="content" className="text-zinc-300 font-medium">Content Body</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write or paste your secure notes here..."
                    className="min-h-[220px] w-full resize-none border-white/10 bg-white/5 p-4 text-white placeholder:text-zinc-600 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:border-violet-500 transition-all rounded-xl leading-relaxed"
                    required
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Share Settings Card */}
          {!shareUrl && (
            <Card className="border border-white/10 bg-zinc-950/60 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] backdrop-blur-2xl overflow-hidden relative">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

              <CardHeader className="space-y-2 px-8 pt-8 pb-4">
                <CardTitle className="flex items-center gap-3 text-2xl text-white">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
                    <Link2 className="h-5 w-5" />
                  </div>
                  Share Parameters
                </CardTitle>

                <CardDescription className="text-zinc-400 text-sm">
                  Control link behavior, lifespan, and authorization security.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-8 px-8 pb-8">
                {/* Share type selection */}
                <div className="space-y-3">
                  <Label className="text-zinc-300 font-medium block">
                    Link Lifespan Behavior
                  </Label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setShareType("ONE_TIME")}
                      className={`group relative rounded-2xl border p-5 text-left transition-all duration-300 ${
                        shareType === "ONE_TIME"
                          ? "border-violet-500 bg-violet-500/10 shadow-[0_0_25px_rgba(139,92,246,0.15)]"
                          : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-colors ${shareType === "ONE_TIME" ? "bg-violet-500 text-white" : "bg-white/5 text-zinc-400 group-hover:text-white"}`}>
                          <Link2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">One-Time Access</p>
                          <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                            Self-destructs instantly after the first successful view.
                          </p>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShareType("TIME_BASED")}
                      className={`group relative rounded-2xl border p-5 text-left transition-all duration-300 ${
                        shareType === "TIME_BASED"
                          ? "border-violet-500 bg-violet-500/10 shadow-[0_0_25px_rgba(139,92,246,0.15)]"
                          : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-colors ${shareType === "TIME_BASED" ? "bg-violet-500 text-white" : "bg-white/5 text-zinc-400 group-hover:text-white"}`}>
                          <Clock3 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Time-Based Access</p>
                          <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                            Accessible repeatedly until selected absolute expiry.
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {shareType === "TIME_BASED" && (
                  <div className="space-y-2.5 animate-fade-in">
                    <Label htmlFor="expiry" className="text-zinc-300 font-medium">Expiry Date & Time</Label>
                    <Input
                      id="expiry"
                      type="datetime-local"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="h-12 w-full border-white/10 bg-white/5 px-4 text-white focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:border-violet-500 rounded-xl"
                      required
                    />
                  </div>
                )}

                {/* Access type selection */}
                <div className="space-y-3">
                  <Label className="text-zinc-300 font-medium block">
                    Access Authorization Layer
                  </Label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setAccessType("PUBLIC")}
                      className={`group relative rounded-2xl border p-5 text-left transition-all duration-300 ${
                        accessType === "PUBLIC"
                          ? "border-violet-500 bg-violet-500/10 shadow-[0_0_25px_rgba(139,92,246,0.15)]"
                          : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-colors ${accessType === "PUBLIC" ? "bg-violet-500 text-white" : "bg-white/5 text-zinc-400 group-hover:text-white"}`}>
                          <Globe2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Public</p>
                          <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                            Anyone possessing the secure token can unlock it.
                          </p>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAccessType("PASSWORD")}
                      className={`group relative rounded-2xl border p-5 text-left transition-all duration-300 ${
                        accessType === "PASSWORD"
                          ? "border-violet-500 bg-violet-500/10 shadow-[0_0_25px_rgba(139,92,246,0.15)]"
                          : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-colors ${accessType === "PASSWORD" ? "bg-violet-500 text-white" : "bg-white/5 text-zinc-400 group-hover:text-white"}`}>
                          <Lock className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Password Protected</p>
                          <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                            Generates a secure cryptographic access key.
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Message Box */}
          {error && (
            <div className="flex items-center gap-3 rounded-2xl border border-red-900/50 bg-red-950/50 p-4 text-sm text-red-300 animate-shake">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-500/20">
                <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              </div>
              <p>{error}</p>
            </div>
          )}

          {/* Generated Link & Password Result Section (Stays on screen safely) */}
          {shareUrl && (
            <Card className="border border-violet-500/30 bg-violet-950/20 shadow-2xl backdrop-blur-2xl animate-fade-in relative overflow-hidden space-y-6 p-8">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400 to-transparent" />

              <div>
                <CardTitle className="text-xl text-white flex items-center gap-2 mb-1">
                  <Check className="h-5 w-5 text-violet-400" />
                  Secure Link Generated Successfully
                </CardTitle>
                <CardDescription className="text-zinc-400 text-sm">
                  Please copy your shareable link and access key below before leaving this page.
                </CardDescription>
              </div>

              {/* Share URL Box */}
              <div className="space-y-2">
                <Label className="text-zinc-300 text-xs uppercase tracking-wider">Share URL</Label>
                <div className="flex gap-3">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="h-12 border-white/10 bg-black/40 text-zinc-300 font-mono text-sm rounded-xl"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={copyShareUrl}
                    className="h-12 px-5 border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all"
                  >
                    {copied ? (
                      <span className="flex items-center gap-2 text-violet-400">
                        <Check className="h-4 w-4" /> Copied
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Copy className="h-4 w-4" /> Copy Link
                      </span>
                    )}
                  </Button>
                </div>
              </div>

              {/* Access Key Box (if password protected) */}
              {accessKey && (
                <div className="space-y-2 rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                      🔐 Cryptographic Access Key (Shown only once)
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      onClick={copyAccessKey}
                      className="h-8 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs"
                    >
                      {keyCopied ? "Key Copied!" : "Copy Key"}
                    </Button>
                  </div>
                  <p className="font-mono text-base text-white tracking-wide select-all bg-black/40 p-3 rounded-lg border border-amber-500/20 mt-2">
                    {accessKey}
                  </p>
                </div>
              )}

              {/* Manual Navigation Button */}
              <div className="pt-4 flex gap-4">
                <Button
                  type="button"
                  onClick={() => router.push(`/notes/${createdNoteId}`)}
                  className="h-12 flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold hover:from-violet-500 hover:to-indigo-500 rounded-xl shadow-lg"
                >
                  Go to Vault Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="h-12 border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl"
                >
                  Create Another Note
                </Button>
              </div>
            </Card>
          )}

          {/* Submit Button */}
          {!shareUrl && (
            <Button
              type="submit"
              disabled={loading}
              className="h-13 w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold hover:from-violet-500 hover:to-indigo-500 focus-visible:ring-4 focus-visible:ring-violet-500/30 transition-all duration-300 rounded-xl shadow-lg shadow-violet-950/40 active:scale-[0.98] py-6 text-base"
            >
              {loading ? (
                <span className="flex items-center gap-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Initializing Secure Vault & Link...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Create Note & Generate Link <ArrowRight className="h-5 w-5" />
                </span>
              )}
            </Button>
          )}
        </form>
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