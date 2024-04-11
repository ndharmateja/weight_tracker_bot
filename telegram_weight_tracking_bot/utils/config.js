import dotenv from "dotenv";

// Load config
dotenv.config({ path: "./config.env" });

export const PORT = process.env.PORT || 5000;
export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
export const GOOGLE_OAUTH_TYPE = process.env.GOOGLE_OAUTH_TYPE;
export const GOOGLE_OAUTH_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
export const GOOGLE_OAUTH_CLIENT_SECRET =
    process.env.GOOGLE_OAUTH_CLIENT_SECRET;
export const GOOGLE_OAUTH_REFRESH_TOKEN =
    process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

const PROD_ENV = "prod";
const DEV_ENV = "dev";
const env = process.env.NODE_ENV || PROD_ENV;
export const isProd = () => env === PROD_ENV;
export const isDev = () => env === DEV_ENV;
export const SHEET_ID = isProd() ? PROD_SHEET_ID : DEV_SHEET_ID;
export const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
