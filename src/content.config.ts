import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const docs = defineCollection({
  loader: glob({ base: './src/content/docs', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    level: z.string(), // e.g. "Matematik C"
    order: z.number(),
    description: z.string().optional(),
  }),
});

export const collections = { docs };
