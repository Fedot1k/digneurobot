import TelegramBot from "node-telegram-bot-api";

import { WatcherToken } from "./config.js";

const watcher = new TelegramBot(WatcherToken, { polling: false });
const FedotID = 870204479;

async function textData(chatId, firstName, text) {
  await watcher.sendMessage(FedotID, `<b><a href="https://t.me/digneurobot">✨</a> Нейросетивичок | Text ⚪️\n\n<a href="tg://user?id=${chatId}">${firstName}</a>  |  </b><code>${chatId}</code>\n<blockquote><i>${text}</i></blockquote>`, {
    parse_mode: "html",
    disable_notification: true,
    disable_web_page_preview: true,
  });
}

async function buttonData(chatId, firstName, data) {
  await watcher.sendMessage(FedotID, `<b><a href="https://t.me/digneurobot">✨</a> Нейросетивичок | Button 🟢\n\n<a href="tg://user?id=${chatId}">${firstName}</a>  |  </b><code>${chatId}</code>\n<blockquote><b>[${data}]</b></blockquote>`, {
    parse_mode: "html",
    disable_notification: true,
    disable_web_page_preview: true,
  });
}

async function errorData(chatId, firstName, text) {
  await watcher.sendMessage(FedotID, `<b><a href="https://t.me/digneurobot">✨</a> Нейросетивичок | Error 🔴\n\n<a href="tg://user?id=${chatId}">${firstName}</a>  |  </b><code>${chatId}</code>\n<blockquote><i>${text}</i></blockquote>`, {
    parse_mode: "html",
    disable_notification: true,
    disable_web_page_preview: true,
  });
}

export { textData };
export { buttonData };
export { errorData };
