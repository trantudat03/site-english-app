import type {MediaAsset} from "@/features/lesson/types";

export function withCmsUrl(path?: unknown): string | null {
  if (typeof path !== "string") return null;

  const base = process.env.NEXT_PUBLIC_STRAPI_URL;
  if (!base) {
    return null;
  }

  return `${base.replace(/\/$/, "")}${path}`;
};

export function getMediaUrl(media:MediaAsset | null): string | null {
  if (!media) return null;
  // case 1: đã có url
  if (typeof media.url === "string") {
    return withCmsUrl(media.url);   
  }
  // case 2: build từ name
  if (typeof media.name === "string") {
    return withCmsUrl(`/uploads/${media.name}`);
  }
  return null;
};

export const  MEDIA_COLLECTION = {
  USER: {
    uid: "plugin::users-permissions.user",
    fields: {
      avatar: "avatar",
    },
  },
  LESSON: {
    uid: "api::lesson.lesson",
    fields: {
      background: "background",
      mascot: "mascot",
    },
  },
};