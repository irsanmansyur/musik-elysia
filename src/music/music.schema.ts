import { Document, Schema } from "mongoose";

export enum EStatus {
  active = "active",
  inactive = "inactive",
  pending = "pending",
  deleted = "deleted",
}
export interface IOther {
  jenis: "youtube" | "spotify" | "lokal";
  url: string;
}
export interface ISite {
  url: string;
  slug: string;
  status: EStatus;
}

export interface IMusic extends Document {
  slug: string;
  musicId: string;
  title: string;
  artists: string[];
  thumbnail: string;
  duration: string;
  album: string;
  other: IOther;
  genres: string[];
  search: string;
  status: EStatus;
  sites: ISite[];
  year: string;
  fileSize: string;
  views: { ip: string; date: Date; userAgent: string }[];
  updatedAt: Date;
  createdAt: Date;
}

const musicSchema = new Schema<IMusic>({
  slug: { type: String, required: true },
  musicId: { type: String, required: true },
  title: { type: String, required: true },
  artists: { type: [String], required: true },
  thumbnail: { type: String, required: true },
  duration: { type: String, required: true },
  album: { type: String, required: true },
  other: { type: Object, required: true },
  genres: { type: [String], required: true },
  search: { type: String, required: true },
  sites: {
    type: [
      {
        url: String,
        slug: String,
        status: String,
      },
    ],
  },
  year: { type: String, required: true },
  fileSize: { type: String, required: true },
  status: { type: String },
  views: { type: [{ ip: String, date: Date, userAgent: String }], default: [] },
  updatedAt: { type: Date, required: true },
  createdAt: { type: Date, required: true },
});

export default musicSchema;
