import { Elysia } from "elysia";
import musicModule from "./music";
import { MyError } from "./commons/errors";

const app = new Elysia()
  .get("/", () => "Hello Elysia")
  .error({
    MyError,
  })
  .onError(({ error, headers }) => {
    return error;
  });
app.use(musicModule);
app.listen({
  port: process.env.PORT || 3000,
  hostname: "0.0.0.0",
});
console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
