import type { MediaAsset } from "@/features/lesson/types";

export function getMediaUrl(media: MediaAsset | null): string | null {
  if (!media) return null;
  
  if (typeof media.url === "string" && media.url.startsWith("http")) {
    return media.url;
  }
  return null;
}
