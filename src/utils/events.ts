import { getCollection } from "astro:content";

export type EventStatus = "backlog" | "informed" | "venue-pending" | "register-open" | "register-closed" | "concluded" | "canceled";

export async function getSortedEvents() {
  const events = await getCollection("events");
  return events.sort((a, b) => a.data.date.getTime() - b.data.date.getTime());
}

export async function getUpcomingEvents() {
  const now = new Date();
  return (await getSortedEvents()).filter((event) => event.data.date >= now);
}

export async function getPastEvents() {
  const now = new Date();
  return (await getSortedEvents())
    .filter((event) => event.data.date < now)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export async function getEventsByStatus(status: EventStatus) {
  return (await getSortedEvents()).filter((event) => event.data.status === status);
}

export async function getEventsWithAlbums() {
  return (await getPastEvents()).filter(
    (event) =>
      (event.data.photos && event.data.photos.length > 0) ||
      (event.data.videos && event.data.videos.length > 0)
  );
}

const VIDEO_EXTS = new Set([".mp4", ".webm", ".mov", ".ogg"]);

export function isVideo(filename: string) {
  const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  return VIDEO_EXTS.has(ext);
}

export function getEventCoverUrl(event: { id: string; data: { coverPhoto?: string; photos?: string[] } }) {
  const filename = event.data.coverPhoto || event.data.photos?.[0];
  return filename ? `/events/${event.id}/${filename}` : null;
}

/**
 * First image suitable for a card thumbnail (skips video filenames in coverPhoto / photos).
 */
export function getEventThumbnailUrl(event: { id: string; data: { coverPhoto?: string; photos?: string[] } }): string | null {
  const ordered: string[] = [];
  if (event.data.coverPhoto) ordered.push(event.data.coverPhoto);
  for (const p of event.data.photos ?? []) ordered.push(p);
  for (const filename of ordered) {
    if (!isVideo(filename)) return `/events/${event.id}/${filename}`;
  }
  return null;
}

export function getEventImageUrl(eventId: string, filename: string) {
  return `/events/${eventId}/${filename}`;
}
