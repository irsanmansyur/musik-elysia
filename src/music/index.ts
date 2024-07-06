import { Elysia, t } from "elysia";
import { MusicService } from "./music.service";

const musicModule = new Elysia()
  .state({ musicService: await MusicService() })
  .group("/music", (app) => {
    app.get(
      "/",
      ({ store, query }) => {
        return store.musicService.getMusic(query);
      },
      {
        query: t.Object({
          site: t.String(),
          page: t.Number(),
          limit: t.Number(),
        }),
      }
    );
    app.get(
      "/:slug",
      ({ store, params, query, headers }) => {
        const ip = (headers["x-forwarded-for"] ||
          headers["x-real-ip"]) as string;
        const userAgent = headers["user-agent"] as string;
        return store.musicService.musicDetails({
          slug: params.slug,
          ip,
          userAgent,
          ...query,
        });
      },
      {
        query: t.Object({
          site: t.String(),
          from: t.Optional(t.String()),
        }),
      }
    );
    return app;
  });

export default musicModule;
