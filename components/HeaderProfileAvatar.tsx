"use client";

import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getUserAvatarUrl, getUserInitials } from "@/lib/user-avatar";

type HeaderProfileAvatarProps = {
  user: User;
  email: string;
};

export function HeaderProfileAvatar({ user, email }: HeaderProfileAvatarProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const photoUrl = getUserAvatarUrl(user);
  const initials = getUserInitials(email, user);
  const showPhoto = Boolean(photoUrl) && !imgFailed;

  if (showPhoto && photoUrl) {
    return (
      <img
        className="avatar-photo"
        src={photoUrl}
        alt=""
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setImgFailed(true)}
      />
    );
  }

  return (
    <span className="avatar-initials" aria-hidden>
      {initials}
    </span>
  );
}