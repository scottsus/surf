/**
 * Usually these would be environment variables, but in the context of a browser
 * extension, everything is public
 */

const { DEV, VITE_DEV_NAME } = import.meta.env;

/**
 * Just for @chrispy on his local machine, default to remote server
 */
export const SERVER_URL =
  DEV && VITE_DEV_NAME === "scottsus"
    ? "http://localhost:3000"
    : "https://majordomo-web.vercel.app";

if (DEV) {
  console.log("Surf server:", SERVER_URL);
}

export const IS_DEBUGGING = DEV && false;

export const USE_AI_EVALS_FOR_PREV_ACTIONS = false;

export const USE_RIVE = false;

export const USE_VOICE_MODE = false;

export const USE_DOUBLE_CLICK = false;
