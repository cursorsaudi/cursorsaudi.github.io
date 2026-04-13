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
    type: z.enum(["meetup", "hackathon", "workshop", "build", "talk", "interview"]),
    status: z.enum(["backlog", "informed", "venue-pending", "register-open", "register-closed", "concluded", "canceled"]),
    speakers: z.array(z.string()).optional(),
    slides: z.array(z.string()).optional(),
    venue: z.string().optional(),
    photos: z.array(z.string()).optional(),
    videos: z.array(z.string()).optional(),
    coverPhoto: z.string().optional(),
    photographers: z.array(z.string()).optional(),
    communityPosts: z
      .array(
        z.object({
          url: z.string(),
          author: z.string(),
          authorAr: z.string().optional(),
          label: z.string().optional(),
          labelAr: z.string().optional(),
        })
      )
      .optional(),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/data/blog" }),
  schema: z.object({
    title: z.string(),
    titleAr: z.string().optional(),
    date: z.date(),
    description: z.string(),
    descriptionAr: z.string().optional(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional(),
    coverImage: z.string().optional(),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = { events, blog };
