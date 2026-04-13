import { getCollection, type CollectionEntry } from "astro:content";

export type EventStatus = "backlog" | "informed" | "venue-pending" | "register-open" | "register-closed" | "concluded" | "canceled";

export type EventEntry = CollectionEntry<"events">;

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

/** Local filename under `/events/{id}/`, or an absolute image/video URL. */
export function getEventImageUrl(eventId: string, filename: string) {
  if (filename.startsWith("http://") || filename.startsWith("https://")) return filename;
  return `/events/${eventId}/${filename}`;
}
