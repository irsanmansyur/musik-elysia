import { Document, Schema, model } from "mongoose";

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
  status: IStatus;
  sites: ISite[];
  year: string;
  fileSize: string;
  updatedAt: Date;
  createdAt: Date;
}

export type IStatus = "active" | "inactive" | "pending" | "deleted";
export interface IOther {
  jenis: "youtube" | "spotify" | "lokal";
  url: string;
}
export interface ISite {
  url: string;
  slug: string;
  status: IStatus;
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
  updatedAt: { type: Date, required: true },
  createdAt: { type: Date, required: true },
});
export default musicSchema;
