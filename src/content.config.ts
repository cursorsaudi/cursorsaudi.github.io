import { z, defineCollection } from "astro:content";
import { glob } from "astro/loaders";

const events = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/data/events" }),
  schema: z.object({
    title: z.string(),
    titleAr: z.string().optional(),
    date: z.date(),
    location: z.string(),
    locationAr: z.string().optional(),
    lumaUrl: z.string().optional(),
    description: z.string(),
    descriptionAr: z.string().optional(),
    type: z.enum(["meetup", "hackathon", "workshop"]),
    status: z.enum(["planned", "venue-pending", "register-open", "register-closed", "completed", "canceled"]),
    speakers: z.array(z.string()).optional(),
    slides: z.array(z.string()).optional(),
    place: z.string().optional(),
  }),
});

export const collections = { events };
