"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/AuthContext";
import { useDashboardMoodContext } from "@/context/DashboardMoodContext";
import { AVATAR_OPTIONS } from "@/lib/avatars";
import { updateUserProfile } from "@/lib/firebase/profile";

export default function ProfilePage() {
  const router = useRouter();
  const { theme } = useDashboardMoodContext();
  const { user, refreshUser } = useAuth();

  const [displayName, setDisplayName] = useState<string>(
    user?.displayName ?? ""
  );
  const [selectedPhotoURL, setSelectedPhotoURL] = useState<string>(
    user?.photoURL ?? ""
  );
  const [avatarQuery, setAvatarQuery] = useState("");
  const [saving, setSaving] = useState(false);

  const initials = useMemo(() => {
    const base =
      displayName?.trim() ||
      user?.displayName?.trim() ||
      user?.email?.split("@")[0] ||
      "User";
    const parts = base.split(" ").filter(Boolean).slice(0, 2);
    const joined = parts.map((part) => part[0]?.toUpperCase()).join("");
    return joined || "U";
  }, [displayName, user?.displayName, user?.email]);

  const filteredAvatars = useMemo(() => {
    const query = avatarQuery.trim().toLowerCase();
    if (!query) return AVATAR_OPTIONS;
    return AVATAR_OPTIONS.filter((opt) =>
      opt.label.toLowerCase().includes(query)
    );
  }, [avatarQuery]);

  async function handleSave() {
    if (!user?.uid) return;

    setSaving(true);

    const nextDisplayName = displayName.trim() ? displayName.trim() : null;
    const nextPhotoURL = selectedPhotoURL.trim()
      ? selectedPhotoURL.trim()
      : null;

    try {
      await updateUserProfile({
        uid: user.uid,
        displayName: nextDisplayName,
        photoURL: nextPhotoURL,
      });
      await refreshUser();
      toast.success("Profile updated.");
    } catch {
      toast.error("Unable to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className={`text-2xl font-extrabold ${theme.heading}`}>Profile</h1>
        <p className={`${theme.mutedText} text-sm mt-1`}>
          Update your username and choose an avatar.
        </p>
      </div>

      <Card className={`${theme.surface} border ${theme.border}`}>
        <CardHeader>
          <CardTitle className={`${theme.heading}`}>Your account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage
                src={selectedPhotoURL || user?.photoURL || ""}
                alt="Avatar"
              />
              <AvatarFallback className="text-lg font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className={`font-bold ${theme.heading} truncate`}>
                {user?.email ?? ""}
              </div>
              <div className={`${theme.mutedText} text-sm`}>
                UID: {user?.uid ?? ""}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className={`text-sm font-semibold ${theme.text}`}>
              Username
            </label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className={`bg-white ${theme.border}`}
            />
          </div>

          <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className={`text-sm font-semibold ${theme.text}`}>
                  Choose an avatar
                </div>
                <div className={`${theme.mutedText} text-xs mt-0.5`}>
                  Pick one of the built-in avatars.
                </div>
              </div>
              <div className="flex w-full sm:w-auto items-center gap-2">
                <Input
                  value={avatarQuery}
                  onChange={(e) => setAvatarQuery(e.target.value)}
                  placeholder="Search avatars..."
                  className={`bg-white ${theme.border} w-full sm:w-64`}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setSelectedPhotoURL("")}
                  disabled={saving}
                >
                  Remove
                </Button>
              </div>
            </div>

            <ScrollArea className="h-44 rounded-2xl border border-slate-200 bg-white/60">
                <div className="p-3">
                  {filteredAvatars.length ? (
                    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
                      {filteredAvatars.map((opt) => {
                        const isSelected = selectedPhotoURL === opt.src;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setSelectedPhotoURL(opt.src)}
                            className={`group rounded-2xl p-1 border transition-all ${
                              isSelected
                                ? `${theme.border} ring-4 ring-black/10`
                                : "border-transparent hover:border-slate-200"
                            }`}
                            aria-label={`Select ${opt.label} avatar`}
                            disabled={saving}
                            title={opt.label}
                          >
                            <Avatar className="w-14 h-14">
                              <AvatarImage src={opt.src} alt={opt.label} />
                              <AvatarFallback className="text-xs font-bold">
                                {opt.label.slice(0, 1)}
                              </AvatarFallback>
                            </Avatar>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-10 text-center">
                      <div className={`text-sm font-semibold ${theme.text}`}>
                        No avatars found
                      </div>
                      <div className={`${theme.mutedText} text-xs mt-1`}>
                        Try a different search.
                      </div>
                    </div>
                  )}
                </div>
            </ScrollArea>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving || !user?.uid}
              className={`rounded-full ${theme.accentBg} text-white`}
            >
              {saving ? "Saving..." : "Save changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => router.push("/dashboard")}
              disabled={saving}
            >
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
