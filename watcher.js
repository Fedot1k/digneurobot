import TelegramBot from "node-telegram-bot-api";
import fs from "fs";

import { config } from "./config.js";

const watcher = new TelegramBot(config.TOKEN.Watcher, { polling: false });
const FedotID = 870204479;

// debugging (text sent by user)
export async function textData(chatId, firstName, text) {
  await watcher.sendMessage(FedotID, `<b><a href="https://t.me/digneurobot">✨</a> Нейросетивичок | Text ⚪️\n\n<a href="tg://user?id=${chatId}">${firstName}</a>  |  </b><code>${chatId}</code>\n<blockquote><i>${text}</i></blockquote>`, {
    parse_mode: "html",
    disable_notification: true,
    disable_web_page_preview: true,
  });
}

// debugging (buttons pressed)
export async function buttonData(chatId, firstName, data) {
  await watcher.sendMessage(FedotID, `<b><a href="https://t.me/digneurobot">✨</a> Нейросетивичок | Button 🟢\n\n<a href="tg://user?id=${chatId}">${firstName}</a>  |  </b><code>${chatId}</code>\n<blockquote><b>[${data}]</b></blockquote>`, {
    parse_mode: "html",
    disable_notification: true,
    disable_web_page_preview: true,
  });
}

// debugging (errors)
export async function errorData(chatId, firstName, text) {
  await watcher.sendMessage(FedotID, `<b><a href="https://t.me/digneurobot">✨</a> Нейросетивичок | Error 🔴\n\n<a href="tg://user?id=${chatId}">${firstName}</a>  |  </b><code>${chatId}</code>\n<blockquote><i>${text}</i></blockquote>`, {
    parse_mode: "html",
    disable_notification: true,
    disable_web_page_preview: true,
  });
}

// backing up (data safety)
export async function databaseBackup(usersData) {
  fs.writeFile("DB.json", JSON.stringify({ usersData }), (err) => {
    if (err) throw err;
    watcher.sendDocument(FedotID, "./DB.json", {
      caption: `<b><a href="https://t.me/digneurobot">✨</a> Нейросетивичок | Data ⚪️</b>`,
      parse_mode: "html",
    });
  });
}
