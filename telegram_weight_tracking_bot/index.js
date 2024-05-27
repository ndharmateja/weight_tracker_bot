import { Telegraf } from "telegraf";
import { require } from "./utils/utils.js";
import {
    addHandler,
    helpHandler,
    settingsHandler,
    startHandler,
    documentHandler,
    textHandler,
} from "./handlers/command_handlers.js";
import { PORT, TELEGRAM_BOT_TOKEN, isDev, isProd } from "./utils/config.js";
import logger from "./utils/logger.js";

const { message } = require("telegraf/filters");

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

// Default commands
bot.start(startHandler);
bot.help(helpHandler);
bot.settings(settingsHandler);

// Custom commands
bot.command("add", addHandler);

// Stickers
bot.on(message("sticker"), (ctx) => ctx.reply("👍"));

// Text messages
bot.on(message("text"), textHandler);

// Handle document messages
bot.on(message("document"), documentHandler);

// Launch bot
if (isProd()) {
    logger.info("launching bot in prod mode");
    const webhookDomain = "https://weight-tracker-telegram-bot.onrender.com";
    bot.launch({ webhook: { domain: webhookDomain, port: PORT } })
        .then(() => logger.info("Webhook bot listening on port", PORT))
        .catch((e) => logger.error("Error: ", e.message));
} else if (isDev()) {
    logger.info("launching bot in dev mode (polling)");
    await bot.launch();
}
