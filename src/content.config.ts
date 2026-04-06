import {defineCollection, z} from "astro:content";

const posts = defineCollection({
    type: "content",
    schema: z.object({
        title: z.string(),
        description: z.string(),
        author: z.string().default("Junior Dev"),
        publishedAt: z.coerce.date(),
        updatedAt: z.coerce.date().optional(),
        tags: z.array(z.string()).default([]),
        draft: z.boolean().default(false),
        featured: z.boolean().default(false),
        readingTime: z.string().optional(),
        heroImage: z.string().optional()
    })
});

export const collections = {posts};
