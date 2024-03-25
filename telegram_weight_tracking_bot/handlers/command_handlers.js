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

        // retrieve and parse csv file
        const records = await parseRecordsFromCsv(fileId);
        logger.info(`parsed ${records.length} records from the csv file`);

        // Initial messages
        ctx.reply(
            "Initialized adding table. Might take a few seconds. Wait for confirmation."
        );

        // Write to google sheets
        const spreadsheetId = "1BeAeCtDqXRzsu2RbI4ITsjuTZ8YyGTqlsTSZDPLWuF4";
        const sheetId = 405710534; // 405710534 - 'Data' sheet & 144983074 - 'Copy of Data' sheet
        const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=${sheetId}`;
        await writeDataToGoogleSheets(spreadsheetId, sheetId, records);

        // Reply message
        ctx.reply(
            `Successfully added data\n\nClick [link](${spreadsheetUrl}) to open`
        );
    } catch (error) {
        logger.error(error);
        ctx.reply(`Error: ${error.message}`);
    }
};

const writeDataToGoogleSheets = async (spreadsheetId, sheetId, values) => {
    // Sheets
    const client = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: client });
    const sheetName = await getSheetName(sheets, spreadsheetId, sheetId);
    logger.info(sheetName);

    // Write data
    const numRows = values.length;
    const result = await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1:B${numRows}`,
        requestBody: {
            majorDimension: "ROWS",
            values,
        },
        valueInputOption: "USER_ENTERED",
    });
    logger.info(result.data);
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
