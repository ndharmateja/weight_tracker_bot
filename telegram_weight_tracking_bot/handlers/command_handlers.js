import { google } from "googleapis";
import { getAuthClient, getSheetName } from "../utils/google_utils.js";
import logger from "../utils/logger.js";
import { CSV_MIME_TYPE } from "../utils/constants.js";
import { getFileData, getFilePath } from "../utils/document_handler_utils.js";
import { require } from "../utils/utils.js";
const fs = require("fs").promises;
import { parse } from "csv-parse/sync";

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

export const documentHandler = async (ctx) => {
    try {
        // Parse message
        const {
            document: { mime_type: mimeType, file_id: fileId },
        } = ctx.message;

        // save file locally
        const records = await getRecordsFromCsv(mimeType, fileId);
        logger.info(records);

        ctx.reply("received 👍🏽");
    } catch (error) {
        ctx.reply(`Error: ${error.message}`);
    }
};

const getRecordsFromCsv = async (mimeType, fileId) => {
    // Check mime type
    if (mimeType !== CSV_MIME_TYPE) {
        throw new Error("Only csv documents accepted for now.");
    }

    // Get file path
    const filePath = await getFilePath(fileId);
    logger.info(`Got the file path: ${filePath}`);

    // Get file data
    const fileData = await getFileData(filePath);
    logger.info("Got the file data");

    // Parse csv
    const records = parse(fileData, {
        columns: true,
        skip_empty_lines: true,
    });

    // convert list of objects into a 2d array
    // to add to google sheets
    return [
        ["Date", "Weight"],
        ...records.map((record) => [record.Date, record.Weight]),
    ];
};
