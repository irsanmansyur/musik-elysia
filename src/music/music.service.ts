import { LRUCache } from "lru-cache";
import mongodb from "../database/mongoose";
import musicSchema, { EStatus, IMusic, ISite } from "./music.schema";
import { paginate, TPaginate } from "../commons/helpers/paginate";
import { TMusicDetails } from "./type";
import { error } from "elysia";
import { Document } from "mongoose";
import musicSearchSchema, { IMusicSearch } from "./schemas/music-search.schema";

const mymongo: typeof import("mongoose") | null = await mongodb();
const Music = mymongo.model<IMusic>("musics", musicSchema);
type TMusic = Document<unknown, {}, IMusic> &
  IMusic &
  Required<{
    _id: unknown;
  }>;

const MusicSearch = mymongo.model<IMusicSearch>(
  "musicsSearch",
  musicSearchSchema
);
type TMusicSearch = Document<unknown, {}, IMusic> & IMusicSearch;

type TgetMusic = TPaginate & {
  site: string;
};
const cache = new LRUCache({
  ttl: 1000 * 60,
  ttlAutopurge: true,
});
export async function MusicService() {
  return {
    getMusic: async ({ site, ...tGet }: TgetMusic) => {
      const { page, limit, offset } = paginate({
        page: +(tGet?.page || "1"),
        limit: +(tGet?.limit || "10"),
      });
      let data = cache.get(`musics_musicsDoc_${site}_${page}`);
      if (!data) {
        console.log(`musics_musicsDoc_${site}_${page}`, data);
        const filter = { "sites.url": site };
        const musicsDoc = await Music.find(
          filter,
          { thumbnail: 0, _id: 0 },
          { limit: 10, skip: offset, sort: { createdAt: -1 } }
        ).exec();
        let siteNew: ISite;

        const musics = musicsDoc.map((msc) => {
          return musicClearBySite(msc, site);
        });
        const total = await Music.countDocuments(filter).exec();
        data = {
          data: musics,
          meta: {
            totalPages: Math.ceil(total / limit),
            page,
            limit,
            count: total,
          },
        };
        cache.set(`musics_musicsDoc_${site}_${page}`, data);
      }
      return data;
    },

    musicDetails: async ({ slug, site, ip, userAgent }: TMusicDetails) => {
      const dataExist = cache.get(`musics_musicsDoc_${site}_${slug}`);
      if (dataExist) return dataExist;

      let music = await Music.findOne({
        "sites.slug": slug,
        "sites.url": site,
        "sites.status": EStatus.active,
      }).exec();
      if (!music) return error(401, { message: "Musik not found" });
      updateViews(music, ip, userAgent);
      const musicClear = musicClearBySite(music, site);

      const data = {
        data: musicClear,
        related: await related(slug, site, music),
        latest: await latest(site, music),
      };
      cache.set(`musics_musicsDoc_${site}_${slug}`, data);
      return data;
    },
  };
}

const related = async (slug: string, site: string, music: TMusic) => {
  const musics = await Music.find(
    {
      "sites.slug": slug,
      "sites.url": site,
      "sites.status": EStatus.active,
      musicId: { $ne: music.musicId },
    },
    { thumbnail: 0, _id: 0, views: 0 },
    {
      limit: 20,
      sort: { title: -1 },
    }
  ).exec();
  return musics.map((msc) => musicClearBySite(msc, site));
};
function musicClearBySite(msc: TMusic, url: string) {
  const { sites, ...music } = msc.toJSON();
  const site = sites.find((s) => s.url === url) as ISite;
  music["slug"] = site.slug;
  music["status"] = site.status;
  return music;
}
async function latest(url: string, music?: TMusic) {
  const musics = await Music.find(
    {
      "sites.url": url,
      "sites.status": EStatus.active,
      ...(music && {
        musicId: { $ne: music.musicId },
      }),
    },
    {
      views: 0,
      _id: 0,
    }
  )
    .sort({ createdAt: -1 })
    .exec();
  return musics.map((msc) => musicClearBySite(msc, url));
}

function updateViews(
  music: TMusic,
  ip: string,
  userAgent: string,
  from?: string
) {
  const viewed = music.views.find(
    (v) =>
      v.ip === ip &&
      v.userAgent === userAgent &&
      new Date(v.date).getMilliseconds() >
        new Date().getMilliseconds() - 1000 * 60 * 60
  );
  if (from) createMusikSearchLatest(music, userAgent, ip);
  if (viewed) return;

  const views = [...music.views, { ip, userAgent, date: new Date() }];
  Music.updateOne({ musicId: music.musicId }, { views }).exec();
}

async function createMusikSearchLatest(
  musik: TMusic,
  userAgent: string,
  ip: string
) {
  /** cek dulu sudah ada sejam terakhir dengan id dan userAgent yang sama */
  const musikSearch = await MusicSearch.findOne({
    musicId: musik.musicId,
    userAgent,
    ip,
    createdAt: { $gte: new Date(Date.now() - 1000 * 60 * 60 * 1) },
  }).exec();
  if (musikSearch) return;

  MusicSearch.create({
    userAgent,
    ip,
    createdAt: new Date(),
    search: musik.title + " " + musik.artists.join(" ") + " " + musik.album,
    other: musik.other,
    title: musik.title,
    artists: musik.artists,
    slug: musik.slug,
    album: musik.album,
    musicId: musik.musicId,
    thumbnail: musik.thumbnail,
    duration: musik.duration,
    genres: musik.genres,
  });
}
