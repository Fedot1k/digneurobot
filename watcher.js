import TelegramBot from "node-telegram-bot-api";

import { config } from "./config.js";

const watcher = new TelegramBot(config.Tokens[2], { polling: false });
const FedotID = 870204479;

export async function textData(chatId, firstName, text, userAction) {
  await watcher.sendMessage(FedotID, `<b><a href="https://t.me/digneurobot">✨</a> Нейросетивичок | Text ⚪️\n\n<a href="tg://user?id=${chatId}">${firstName}</a>  |  </b><code>${chatId}</code>\n<blockquote><i>${text} (${userAction})</i></blockquote>`, {
    parse_mode: "html",
    disable_notification: true,
    disable_web_page_preview: true,
  });
}

export async function buttonData(chatId, firstName, data) {
  await watcher.sendMessage(FedotID, `<b><a href="https://t.me/digneurobot">✨</a> Нейросетивичок | Button 🟢\n\n<a href="tg://user?id=${chatId}">${firstName}</a>  |  </b><code>${chatId}</code>\n<blockquote><b>[${data}]</b></blockquote>`, {
    parse_mode: "html",
    disable_notification: true,
    disable_web_page_preview: true,
  });
}

export async function errorData(chatId, firstName, text, userAction = ``) {
  await watcher.sendMessage(FedotID, `<b><a href="https://t.me/digneurobot">✨</a> Нейросетивичок | Error 🔴\n\n<a href="tg://user?id=${chatId}">${firstName}</a>  |  </b><code>${chatId}</code>\n<blockquote><i>${text}${userAction != `` ? ` (${userAction})` : ``}</i></blockquote>`, {
    parse_mode: "html",
    disable_notification: true,
    disable_web_page_preview: true,
  });
}

export async function databaseData(chatId, dataToSend) {
  fs.writeFile("DB.json", JSON.stringify(dataToSend), (err) => {
    if (err) throw err;
    bot.sendDocument(FedotID, "./DB.json", {
      caption: `<b><a href="https://t.me/digneurobot">✨</a> Нейросетивичок | Data ⚪️</b>`,
      parse_mode: "html",
    });
  });
}
