"use client";

import { uploadToStrapi } from "@/features/api";
import { Profile } from "@/features/profile";
import { MEDIA_COLLECTION } from "@/features/utils/media";
import { useRef, useState } from "react";

type Props = {
  profile: Profile;
  onUploaded?: () => void;
};

export function AvatarUploader({ profile, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const avatarUrl =
    profile.avatar?.url || "/avatar-placeholder.jpg";

  const handleClick = () => {
    if (loading) return;
    inputRef.current?.click();
  };

  const handleChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);

      await uploadToStrapi({
        file,
        ref: MEDIA_COLLECTION.USER.uid,
        refId: profile.id,
        field: MEDIA_COLLECTION.USER.fields.avatar,
      });

      onUploaded?.();
    } catch (err) {
      console.error("Upload avatar failed", err);
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  return (
    <div
      onClick={handleClick}
      className="relative w-36 h-36 rounded-full overflow-hidden 
             cursor-pointer group shrink-0
             border-4 border-black"
    >
      <img
        src={avatarUrl}
        alt="avatar"
        className="w-full h-full object-cover"
      />


      {/* Overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center">
        <span className="text-white text-sm opacity-0 group-hover:opacity-100 transition">
          {loading ? "Uploading..." : "Change avatar"}
        </span>
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleChange}
      />
    </div>
  );
}
