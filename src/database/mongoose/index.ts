import mongoose from "mongoose";

export default async function mongodb() {
  await mongoose.connect(Bun.env.MONGODB_URL + "", {
    user: "root",
    pass: "changeme",
    dbName: "azmusik",
  });
  return mongoose;
}
