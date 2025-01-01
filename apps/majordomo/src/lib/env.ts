/**
 * Usually these would be environment variables, but in the context of a browser
 * extension, everything is public
 */

export const SERVER_URL =
  process.env.NODE_ENV !== "development" || true
    ? "https://majordomo-web.vercel.app"
    : "http://localhost:3000";

console.log("server:", SERVER_URL);
