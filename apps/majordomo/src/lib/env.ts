/**
 * Usually these would be environment variables, but in the context of a browser
 * extension, everything is public
 */

export const SERVER_URL =
  false && process.env.NODE_ENV !== "development"
    ? "https://majordomo-web.vercel.app"
    : "http://localhost:3000";

console.log("server:", SERVER_URL);

export const USE_RIVE = false;

export const INCLUDE_ID_IN_QUERY_SELECTOR = false;
