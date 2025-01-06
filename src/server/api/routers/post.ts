import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { posts } from "@/server/db/schema";

const typeEnum = z.enum(["BLOG", "FAV"]);

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(
      // z.object({ type: typeEnum, text: z.string() }),
      z.discriminatedUnion("type", [
        z.object({ type: typeEnum.extract(["BLOG"]), text: z.string() }),
        z.object({ type: typeEnum.extract(["FAV"]), url: z.string() }),
      ]),
    )
    .query(({ input }) => {
      if (input.type === "BLOG") {
        return {
          greeting: `Hello ${input.text}`,
        };
      } else if (input.type === "FAV") {
        return {
          greeting: `Hello url ${input.url}`,
        };
      }
      return null;
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(posts).values({
        name: input.name,
        createdById: ctx.session.user.id,
      });
    }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.query.posts.findFirst({
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    });

    return post ?? null;
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
