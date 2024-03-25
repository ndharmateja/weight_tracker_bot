import axios from "axios";
import { TELEGRAM_API_BASEURL } from "./constants.js";
import { require } from "./utils.js";
import { TELEGRAM_BOT_TOKEN } from "./config.js";

export const getFileData = async (filePath) => {
    const { data: fileData } = await axios.get(
        `${TELEGRAM_API_BASEURL}/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`,
        {
            responseType: "arraybuffer",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/x-msexcel",
            },
        }
    );
    return fileData;
};

// Reference 1: https://stackoverflow.com/a/50220546
// Reference 2: https://stackoverflow.com/a/60468824
export const getFilePath = async (fileId) => {
    const { data: filePathData } = await axios.get(
        `${TELEGRAM_API_BASEURL}/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`
    );
    if (!filePathData.ok) throw new Error("Error getting file path");
    const {
        result: { file_path: filePath },
    } = filePathData;
    return filePath;
};
