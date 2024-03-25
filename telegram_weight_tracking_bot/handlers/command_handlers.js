import { google } from "googleapis";
import { getAuthClient, getSheetName } from "../utils/google_utils.js";
import logger from "../utils/logger.js";
import { CSV_MIME_TYPE } from "../utils/constants.js";
import { getFileData, getFilePath } from "../utils/document_handler_utils.js";

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

        // Get file path
        const filePath = await getFilePath(fileId);
        console.log(`Got the file path: ${filePath}`);

        // Get file data
        const fileData = await getFileData(filePath);
        console.log("Got the file data");

        // Write to xls file
        await fs.writeFile(filename, fileData);
        console.log(`${filename} saved`);

        const replyMessage = filePath;
        ctx.reply(replyMessage);
    } catch (error) {
        ctx.reply(`Error: ${error.message}`);
    }
};
