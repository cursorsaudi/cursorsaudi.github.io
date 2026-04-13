import { getCollection, type CollectionEntry } from "astro:content";

export type EventStatus = "backlog" | "informed" | "venue-pending" | "register-open" | "register-closed" | "concluded" | "canceled";

export type EventEntry = CollectionEntry<"events">;

/** Formats the community hosts and lists on `/events` (not invited talks or interviews). */
export const HOSTED_EVENT_TYPES = ["meetup", "hackathon", "workshop", "build"] as const;

export function isHostedCommunityEventType(type: string): boolean {
  return (HOSTED_EVENT_TYPES as readonly string[]).includes(type);
}

export async function getSortedEvents(): Promise<EventEntry[]> {
  const events: EventEntry[] = await getCollection("events");
  return [...events].sort((a, b) => a.data.date.getTime() - b.data.date.getTime());
}

export async function getUpcomingEvents(): Promise<EventEntry[]> {
  const now = new Date();
  return (await getSortedEvents()).filter((event) => event.data.date >= now);
}

export async function getPastEvents(): Promise<EventEntry[]> {
  const now = new Date();
  return (await getSortedEvents())
    .filter((event) => event.data.date < now)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export async function getEventsByStatus(status: EventStatus): Promise<EventEntry[]> {
  return (await getSortedEvents()).filter((event) => event.data.status === status);
}

export async function getEventsWithAlbums(): Promise<EventEntry[]> {
  return (await getPastEvents()).filter(
    (event) =>
      (event.data.photos && event.data.photos.length > 0) ||
      (event.data.videos && event.data.videos.length > 0)
  );
}

const VIDEO_EXTS = new Set([".mp4", ".webm", ".mov", ".ogg"]);

function mediaPathForExtensionCheck(mediaRef: string): string {
  if (mediaRef.startsWith("http://") || mediaRef.startsWith("https://")) {
    try {
      return new URL(mediaRef).pathname;
    } catch {
      return mediaRef;
    }
  }
  return mediaRef;
}

export function isVideo(mediaRef: string) {
  const path = mediaPathForExtensionCheck(mediaRef);
  const dot = path.lastIndexOf(".");
  if (dot < 0) return false;
  const ext = path.slice(dot).toLowerCase();
  return VIDEO_EXTS.has(ext);
}

export function getEventCoverUrl(event: { id: string; data: { coverPhoto?: string; photos?: string[] } }) {
  const filename = event.data.coverPhoto || event.data.photos?.[0];
  return filename ? getEventImageUrl(event.id, filename) : null;
}

/**
 * First image suitable for a card thumbnail (skips video filenames in coverPhoto / photos).
 */
export function getEventThumbnailUrl(event: { id: string; data: { coverPhoto?: string; photos?: string[] } }): string | null {
  const ordered: string[] = [];
  if (event.data.coverPhoto) ordered.push(event.data.coverPhoto);
  for (const p of event.data.photos ?? []) ordered.push(p);
  for (const filename of ordered) {
    if (!isVideo(filename)) return getEventImageUrl(event.id, filename);
  }
  return null;
}

/**
 * Unique image URLs for album-style previews (cover + photos, de-duplicated, skips videos).
 */
export function getEventAlbumPreviewUrls(
  event: { id: string; data: { coverPhoto?: string; photos?: string[] } },
  limit = 4
): string[] {
  const ordered: string[] = [];
  if (event.data.coverPhoto) ordered.push(event.data.coverPhoto);
  for (const p of event.data.photos ?? []) ordered.push(p);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const filename of ordered) {
    if (isVideo(filename)) continue;
    const url = getEventImageUrl(event.id, filename);
    if (seen.has(url)) continue;
    seen.add(url);
    out.push(url);
    if (out.length >= limit) break;
  }
  return out;
}

/** Local filename under `/events/{id}/`, `/images/…` site path, or an absolute http(s) URL. */
export function getEventImageUrl(eventId: string, filename: string) {
  if (filename.startsWith("http://") || filename.startsWith("https://")) return filename;
  if (filename.startsWith("/")) return filename;
  return `/events/${eventId}/${filename}`;
}
