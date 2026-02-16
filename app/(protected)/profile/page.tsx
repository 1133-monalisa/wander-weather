"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Save as SaveIcon,
  RotateCcw,
  Search,
  X,
  Check,
  AtSign,
  ImageOff,
  Copy,
  User,
  Fingerprint,
  Mail,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useAuth } from "@/context/AuthContext";
import { useDashboardMoodContext } from "@/context/DashboardMoodContext";
import { AVATAR_OPTIONS } from "@/lib/avatars";
import { updateUserProfile } from "@/lib/firebase/profile";

function SafeAvatarImage({ src, alt }: { src?: string | null; alt: string }) {
  if (!src) return null;
  return <AvatarImage src={src} alt={alt} className="object-cover" />;
}

function SectionTitle({
  icon,
  title,
  subtitle,
  themeHeading,
  themeMuted,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  themeHeading: string;
  themeMuted: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-black/10 bg-white shadow-sm">
        {icon}
      </div>
      <div className="min-w-0">
        <div className={`text-base font-bold truncate ${themeHeading}`}>
          {title}
        </div>
        <div className={`${themeMuted} text-xs mt-0.5 line-clamp-1 opacity-70`}>
          {subtitle}
        </div>
      </div>
    </div>
  );
}

async function copyToClipboard(value: string, label: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied.`);
  } catch {
    toast.error("Copy failed.");
  }
}

export default function ProfilePage() {
  const router = useRouter();
  const { theme } = useDashboardMoodContext();
  const { user, refreshUser } = useAuth();

  const [displayName, setDisplayName] = useState<string>(
    user?.displayName ?? "",
  );
  const [selectedPhotoURL, setSelectedPhotoURL] = useState<string | null>(
    user?.photoURL ?? null,
  );
  const [avatarQuery, setAvatarQuery] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDisplayName(user?.displayName ?? "");
    setSelectedPhotoURL(user?.photoURL ?? null);
  }, [user?.displayName, user?.photoURL]);

  const initials = useMemo(() => {
    const base = displayName?.trim() || user?.email?.split("@")[0] || "U";
    return base.slice(0, 2).toUpperCase();
  }, [displayName, user?.email]);

  const filteredAvatars = useMemo(() => {
    const q = avatarQuery.trim().toLowerCase();
    if (!q) return AVATAR_OPTIONS;
    return AVATAR_OPTIONS.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [avatarQuery]);

  const isDirty = useMemo(() => {
    return (
      displayName !== (user?.displayName ?? "") ||
      selectedPhotoURL !== (user?.photoURL ?? null)
    );
  }, [displayName, selectedPhotoURL, user]);

  const nameTooLong = displayName.length > 40;
  const canSave = !!user?.uid && isDirty && !saving && !nameTooLong;

  async function handleSave() {
    if (!user?.uid || !canSave) return;
    setSaving(true);
    try {
      await updateUserProfile({
        uid: user.uid,
        displayName: displayName.trim() || null,
        photoURL: selectedPhotoURL,
      });
      await refreshUser();
      toast.success("Profile updated.");
    } catch {
      toast.error("Update failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen lg:h-[calc(100vh-64px)] lg:overflow-hidden bg-transparent">
      <div className="relative h-full flex flex-col">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="h-64 w-full bg-gradient-to-b from-black/[0.03] to-transparent" />
        </div>

        <div className="mx-auto flex w-full max-w-[90rem] flex-1 flex-col px-4 py-8 sm:px-6 lg:overflow-hidden">
          {/* Header */}
          <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1
                className={`text-3xl sm:text-4xl font-black tracking-tight ${theme.heading}`}
              >
                Profile Settings
              </h1>
              <p className={`${theme.mutedText} text-sm mt-1.5`}>
                Customize how you appear to others in the workspace.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-black/10 bg-white/50 backdrop-blur-md hover:bg-white"
                onClick={() => router.push("/dashboard")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
          </div>

          <div className="grid flex-1 gap-8 lg:grid-cols-12 lg:min-h-0">
            {/* LEFT COLUMN */}
            <Card
              className={`lg:col-span-5 xl:col-span-4 flex flex-col border ${theme.border} ${theme.surface} shadow-xl shadow-black/[0.03] rounded-[2.5rem] overflow-hidden`}
            >
              <CardHeader className="p-6 border-b border-black/[0.05] bg-black/[0.01]">
                <SectionTitle
                  icon={<User className="h-5 w-5 text-amber-500" />}
                  title="Your Identity"
                  subtitle="Preview and account data"
                  themeHeading={theme.heading}
                  themeMuted={theme.mutedText}
                />
              </CardHeader>

              <CardContent className="p-6 flex flex-col gap-8 flex-1 overflow-y-auto">
                <div className="flex flex-col items-center justify-center pt-2">
                  <div className="relative group">
                    <Avatar className="h-32 w-32 sm:h-40 sm:w-40 ring-[12px] ring-white shadow-2xl transition-transform duration-500">
                      <SafeAvatarImage
                        src={selectedPhotoURL || user?.photoURL}
                        alt="Preview"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-4xl font-black text-slate-400">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    {selectedPhotoURL && (
                      <button
                        onClick={() => setSelectedPhotoURL(null)}
                        className="absolute -top-1 -right-1 h-10 w-10 bg-white border border-black/10 rounded-full flex items-center justify-center text-red-500 shadow-lg hover:bg-red-50 transition-colors z-20"
                      >
                        <ImageOff className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  <div className="mt-6 text-center">
                    <h3 className={`text-xl font-bold ${theme.heading}`}>
                      {displayName || "Unnamed User"}
                    </h3>
                    <p
                      className={`text-xs font-medium uppercase tracking-widest opacity-40 mt-1`}
                    >
                      Live Preview
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid gap-3 p-4 rounded-3xl bg-black/[0.03] border border-black/[0.02]">
                    <div className="flex items-center justify-between text-sm group">
                      <div className="flex items-center gap-3 min-w-0">
                        <Mail className="h-4 w-4 opacity-40 shrink-0" />
                        <span className="truncate font-medium opacity-70">
                          {user?.email}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        onClick={() =>
                          copyToClipboard(user?.email || "", "Email")
                        }
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between text-sm group">
                      <div className="flex items-center gap-3 min-w-0">
                        <Fingerprint className="h-4 w-4 opacity-40 shrink-0" />
                        <span className="truncate font-mono text-[10px] opacity-50 uppercase tracking-tighter">
                          ID: {user?.uid}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        onClick={() => copyToClipboard(user?.uid || "", "UID")}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-xs font-black uppercase tracking-widest opacity-50">
                        Display Name
                      </label>
                      <span
                        className={`text-[10px] font-bold ${nameTooLong ? "text-red-500" : "opacity-30"}`}
                      >
                        {displayName.length}/40
                      </span>
                    </div>
                    <div className="relative">
                      <Input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="What should we call you?"
                        className={`rounded-2xl bg-white border-black/10 h-12 pl-11 pr-10 shadow-sm transition-all focus-visible:ring-black/5 ${
                          nameTooLong
                            ? "border-red-500 ring-1 ring-red-500/20"
                            : ""
                        }`}
                      />
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-30" />
                      {displayName && (
                        <button
                          onClick={() => setDisplayName("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-4 flex flex-col gap-3">
                  <Button
                    onClick={handleSave}
                    disabled={!canSave}
                    className={`w-full rounded-2xl h-14 text-base font-bold transition-all active:scale-[0.98] ${theme.accentBg} text-white shadow-xl shadow-black/10`}
                  >
                    {saving ? (
                      <RotateCcw className="h-5 w-5 animate-spin mr-3" />
                    ) : (
                      <SaveIcon className="h-5 w-5 mr-3" />
                    )}
                    Save Changes
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 text-xs font-bold uppercase tracking-widest opacity-40 hover:opacity-100 hover:bg-black/5 rounded-xl"
                    onClick={() => {
                      setDisplayName(user?.displayName ?? "");
                      setSelectedPhotoURL(user?.photoURL ?? null);
                      toast.success("Changes discarded.");
                    }}
                    disabled={!isDirty || saving}
                  >
                    Discard Changes
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* RIGHT COLUMN - GALLERY */}
            <Card
              className={`lg:col-span-7 xl:col-span-8 flex flex-col border ${theme.border} ${theme.surface} shadow-sm rounded-[2.5rem] overflow-hidden`}
            >
              <CardHeader className="p-6 border-b border-black/[0.05]">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <SectionTitle
                    icon={<AtSign className="h-5 w-5 text-blue-500" />}
                    title="Avatar Gallery"
                    subtitle="Vivid and ready for selection"
                    themeHeading={theme.heading}
                    themeMuted={theme.mutedText}
                  />
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-30" />
                    <Input
                      placeholder="Search styles..."
                      value={avatarQuery}
                      onChange={(e) => setAvatarQuery(e.target.value)}
                      className="pl-11 rounded-2xl bg-black/5 border-transparent h-11 text-sm focus-visible:bg-white transition-all"
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0 flex-1 lg:min-h-0">
                <ScrollArea className="h-full">
                  <div className="p-8">
                    {filteredAvatars.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-6">
                        {filteredAvatars.map((opt) => {
                          const isSelected = selectedPhotoURL === opt.src;
                          return (
                            <button
                              key={opt.id}
                              onClick={() => setSelectedPhotoURL(opt.src)}
                              className={`group relative flex flex-col items-center gap-3 p-3 rounded-[2rem] transition-all duration-200 bg-transparent ${
                                isSelected
                                  ? "bg-white shadow-xl ring-2 ring-black/5 scale-110 z-10"
                                  : "hover:bg-white hover:shadow-md hover:scale-105"
                              }`}
                            >
                              <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-transparent transition-all overflow-hidden bg-slate-50">
                                <SafeAvatarImage
                                  src={opt.src}
                                  alt={opt.label}
                                />
                                <AvatarFallback className="text-xs">
                                  {opt.label[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-[10px] font-bold uppercase tracking-tighter truncate w-full text-center opacity-80">
                                {opt.label}
                              </span>
                              {isSelected && (
                                <div className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-1.5 shadow-lg ring-4 ring-white">
                                  <Check className="h-3 w-3 stroke-[3]" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-32 text-center">
                        <Search className="h-12 w-12 text-slate-200 mb-4" />
                        <h4 className="text-lg font-bold opacity-60">
                          No matches found
                        </h4>
                        <Button
                          variant="link"
                          onClick={() => setAvatarQuery("")}
                          className="text-amber-600 font-bold"
                        >
                          Show all avatars
                        </Button>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
