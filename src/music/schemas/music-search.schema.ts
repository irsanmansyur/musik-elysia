import { Schema } from "mongoose";

export interface IMusicSearch extends Document {
  musicId: string;
  slug: string;
  title: string;
  artists: string[];
  thumbnail: string;
  duration: string;
  album: string;
  ip: string;
  userAgent: string;
  other: { jenis: "youtube" | "spotify" | "lokal"; url: string };
  search: string;
}
const musicSearchSchema = new Schema<IMusicSearch>({
  slug: { type: String, required: true },
  musicId: { type: String, required: true },
  title: { type: String, required: true },
  artists: { type: [String], required: true },
  thumbnail: { type: String, required: true },
  duration: { type: String, required: true },
  album: { type: String, required: true },
  other: { type: Object, required: true },
  search: { type: String, required: true },
  ip: { type: String, required: true },
});
export default musicSearchSchema;
