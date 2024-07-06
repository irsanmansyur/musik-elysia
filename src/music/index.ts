import { Elysia, t } from "elysia";
import { MusicService } from "./music.service";

const musicModule = new Elysia()
  .state({ musicService: await MusicService() })
  .group("/music", (app) =>
    app.get(
      "/",
      ({ store, query }) => {
        return store.musicService.getMusic(query.site);
      },
      {
        query: t.Object({ site: t.String() }),
      }
    )
  );

export default musicModule;
