import { getCollection } from "astro:content";

export type EventStatus = "planned" | "venue-pending" | "register-open" | "register-closed" | "completed" | "canceled";

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
