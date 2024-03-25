import { google } from "googleapis";
import { getAuthClient, getSheetName } from "../utils/google_utils.js";
import logger from "../utils/logger.js";

export const startHandler = (ctx) => {
    const {
        from: { first_name: firstName },
    } = ctx;
    ctx.reply(`You (${firstName}) entered /start`);
};

export const helpHandler = (ctx) => {
    const {
        from: { first_name: firstName },
    } = ctx;
    ctx.reply(`You (${firstName}) entered /help`);
};

export const settingsHandler = (ctx) => {
    const {
        from: { first_name: firstName },
    } = ctx;
    ctx.reply(`You (${firstName}) entered /settings`);
};

export const addHandler = async (ctx) => {
    logger.info("add handler");
    const {
        from: { first_name: firstName },
    } = ctx;
    ctx.reply(`You (${firstName}) entered /add`);
};
