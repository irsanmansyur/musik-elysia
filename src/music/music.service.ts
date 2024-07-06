import mongodb from "../database/mongoose";
import musicSchema, { ISite } from "./music.schema";

let mymongo: typeof import("mongoose") | null = null;
export async function MusicService() {
  if (!mymongo) mymongo = await mongodb();
  const Music = mymongo.model("musics", musicSchema);
  return {
    getMusic: async (site?: string) => {
      const musics = await Music.find(
        { "sites.url": site },
        { thumbnail: 0, _id: 0 },
        { limit: 10, sort: { createdAt: -1 } }
      ).exec();

      let siteNew: ISite;
      return musics.map((msc) => {
        const { sites, ...music } = msc.toJSON();
        if (!siteNew) siteNew = sites.find((s) => s.url === site) as ISite;
        music["slug"] = siteNew.slug;
        music["status"] = siteNew.status;
        return music;
      });
    },
  };
}
