import { LRUCache } from "lru-cache";
import mongodb from "../database/mongoose";
import musicSchema, { ISite } from "./music.schema";

let mymongo: typeof import("mongoose") | null = null;
export async function MusicService() {
  if (!mymongo) mymongo = await mongodb();
  const cache = new LRUCache({
    ttl: 1000 * 60,
    ttlAutopurge: true,
  });

  const Music = mymongo.model("musics", musicSchema);
  return {
    getMusic: async (site?: string) => {
      let musics = cache.get(`musics_musicsDoc_${site}`);
      if (!musics) {
        const musicsDoc = await Music.find(
          { "sites.url": site },
          { thumbnail: 0, _id: 0 },
          { limit: 10, sort: { createdAt: -1 } }
        ).exec();
        let siteNew: ISite;
        musics = musicsDoc.map((msc) => {
          const { sites, ...music } = msc.toJSON();
          if (!siteNew) siteNew = sites.find((s) => s.url === site) as ISite;
          music["slug"] = siteNew.slug;
          music["status"] = siteNew.status;
          return music;
        });
        cache.set(`musics_musicsDoc_${site}`, musics);
      }
      return musics;
    },
  };
}
