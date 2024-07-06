export class MyError extends Error {
  constructor(public message: string, public code: number) {
    super(message);
  }
}
