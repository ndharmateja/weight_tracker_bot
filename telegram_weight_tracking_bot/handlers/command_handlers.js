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
            document: {
                file_name: filename,
                mime_type: mimeType,
                file_id: fileId,
            },
        } = ctx.message;

        // save file locally
        await saveFile(filename, mimeType, fileId);

        // delete file
        await fs.unlink(filename);
        logger.info(`Deleted ${filename}`);

        const replyMessage = filename;
        ctx.reply(replyMessage);
    } catch (error) {
        ctx.reply(`Error: ${error.message}`);
    }
};

const saveFile = async (filename, mimeType, fileId) => {
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

    // Write to csv file
    await fs.writeFile(filename, fileData);
    logger.info(`${filename} saved`);
};
