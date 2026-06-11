import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const docs = defineCollection({
  loader: glob({ base: './src/content/docs', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    level: z.string(), // e.g. "Matematik C"
    order: z.number(),
    description: z.string().optional(),
    overview: z.string().optional(), // Short learning summary shown at top of page
    goals: z.array(z.string()).optional(), // List of 3-4 learning goals
    intuition: z.string().optional(), // One-liner intuition / the "why"
  }),
});

export const collections = { docs };
