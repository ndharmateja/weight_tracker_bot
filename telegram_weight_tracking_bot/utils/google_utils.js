import { google } from "googleapis";

export const getSheets = async () => {
    const client = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: client });
    return sheets;
};

const getAuthClient = async () => {
    const auth = new google.auth.GoogleAuth({
        keyFile: "keys.json", //the key file
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    });

    return auth.getClient();
};

export const getSheetName = async (sheets, spreadsheetId, sheetId) => {
    const {
        data: { sheets: sheetsData },
    } = await sheets.spreadsheets.get({ spreadsheetId });

    const sheetIdToTitleMap = new Map();
    sheetsData.forEach(({ properties: { sheetId: currSheetId, title } }) => {
        sheetIdToTitleMap.set(currSheetId, title);
    });

    const sheetName = sheetIdToTitleMap.get(sheetId);
    if (sheetName) return sheetName;

    throw new Error(
        `No sheet in spreadsheet ${spreadsheetId} with sheet id ${sheetId}`
    );
};
