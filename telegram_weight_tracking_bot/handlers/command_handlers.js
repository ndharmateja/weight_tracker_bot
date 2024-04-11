import { getSheets, getSheetName } from "../utils/google_utils.js";
import logger from "../utils/logger.js";
import { CSV_MIME_TYPE } from "../utils/constants.js";
import { getFileData, getFilePath } from "../utils/document_handler_utils.js";
import { require } from "../utils/utils.js";
const fs = require("fs").promises;
import axios from "axios";
import { SHEET_ID, SPREADSHEET_ID } from "../utils/config.js";

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

export const textHandler = async (ctx) => {
    logger.info("text handler");
    ctx.reply(`You sent '${ctx.message.text}'`);
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
        let records = await parseRecordsFromCsv(fileId);
        records = addReversedRecords(records);
        logger.info(
            `parsed ${records.length - 1} weight records from the csv file`
        );

        // Initial messages
        ctx.reply(
            `Parsed ${
                records.length - 1
            } weight entries.\n\nInitialized adding data. Might take a few seconds. Wait for confirmation.`
        );

        // Write to google sheets
        const sheets = await getSheets();
        const spreadsheetId = SPREADSHEET_ID;
        const sheetId = SHEET_ID;
        const sheetName = await getSheetName(sheets, spreadsheetId, sheetId);
        const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=${sheetId}`;
        await writeDataToGoogleSheets(
            sheets,
            spreadsheetId,
            sheetName,
            records
        );

        // reply with chart
        await replyWeightChart(ctx);

        // Reply message
        ctx.replyWithMarkdownV2(
            `Successfully added data\n\nClick [link](${spreadsheetUrl}) to open`
        );
    } catch (error) {
        logger.error(error);
        ctx.reply(`Error: ${error.message}`);
    }
};

/**
 *
 * @param {*} records
 * [
 *  ["Date", "Weight"],
 *  ["2022-08-13", "108"],
 *  ["2022-08-14", "107"],
 *  ["2022-08-15", "105"],
 * ]
 *
 * @returns
 * [
 *  ["Date", "Weight", "Date", "Weight"],
 *  ["2022-08-15", "105", "2022-08-13", "108"],
 *  ["2022-08-14", "107", "2022-08-14", "107"],
 *  ["2022-08-13", "108", "2022-08-15", "105"],
 * ]
 *
 */
const addReversedRecords = (records) => {
    const [headers, ...recordsValues] = records;
    recordsValues.reverse();
    const reverseRecords = [headers, ...recordsValues];

    const newRecords = [];
    for (let i in records) {
        newRecords.push([...reverseRecords[i], ...records[i]]);
    }

    return newRecords;
};

const replyWeightChart = async (ctx) => {
    // get image data
    const chartUrl =
        "https://docs.google.com/spreadsheets/u/1/d/e/2PACX-1vS-NDZWOuVqFAeDe0vozWjzJvvaW23Psmx0wVCgVOTpOh6U0ohhkDY6vtHPEye6YeCXFw0KRX1c_HuW/pubchart?oid=749230327&format=image";

    // save to file
    const { data: imageData } = await axios.get(chartUrl, {
        responseType: "arraybuffer",
    });
    const imageFilename = "image.png";
    await fs.writeFile(imageFilename, imageData);

    // send photo as reply
    await ctx.replyWithPhoto(
        { source: imageFilename },
        { caption: "Weight timeline" }
    );

    // delete image file
    await fs.unlink(imageFilename);
};

const writeDataToGoogleSheets = async (
    sheets,
    spreadsheetId,
    sheetName,
    values
) => {
    // Write data
    const numRows = values.length;
    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1:D${numRows}`,
        requestBody: {
            majorDimension: "ROWS",
            values,
        },
        valueInputOption: "USER_ENTERED",
    });
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

    // parse csv string
    // 1. trims to remove space at end
    // 2. splits by new line
    // 3. maps each line to list of strings split by "," (each of those
    // list of strings are also trimmed)
    const records = fileData
        .toString()
        .trim()
        .split("\n")
        .map((line) => line.split(",").map((item) => item.trim()));
    return records;
};
