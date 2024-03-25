import { google } from "googleapis";
import { getAuthClient, getSheetName } from "../utils/google_utils.js";
import logger from "../utils/logger.js";
import { CSV_MIME_TYPE } from "../utils/constants.js";
import { getFileData, getFilePath } from "../utils/document_handler_utils.js";
import { require } from "../utils/utils.js";
const fs = require("fs").promises;

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

        // Check mime type
        if (mimeType !== CSV_MIME_TYPE) {
            throw new Error("Only csv documents accepted for now.");
        }

        // save file locally
        const records = await parseRecordsFromCsv(fileId);
        logger.info(records);

        ctx.reply("received 👍🏽");
    } catch (error) {
        ctx.reply(`Error: ${error.message}`);
    }
};

/**
 * retrieves csv data from telegram and parses the csv file
 * to create a 2d array of strings
 * @param {*} fileId
 * @returns: [
 *  [ 'Date', 'Weight' ],
 *  [ '2022-09-25', '105.5' ],
 *  [ '2022-09-26', '105.7' ],
 *  ...
 * ]
 */
const parseRecordsFromCsv = async (fileId) => {
    // Get file path
    const filePath = await getFilePath(fileId);
    logger.info(`Got the file path: ${filePath}`);

    // Get file data
    const fileData = await getFileData(filePath);
    logger.info("Got the file data");

    // parse csv
    return fileData
        .toString()
        .split("\n")
        .map((line) => line.split(","));
};
