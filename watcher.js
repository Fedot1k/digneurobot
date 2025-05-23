import TelegramBot from "node-telegram-bot-api";
import fs from "fs";

import { config } from "./config.js";

const watcher = new TelegramBot(config.TOKEN.Watcher, { polling: false });
const FedotID = 870204479;

export async function textData(chatId, userName, login, text) {
  await watcher.sendMessage(
    FedotID,
    `<b><a href="https://t.me/digneurobot">✨</a> Нейросетивичок | Text ⚪️\n\n<a href="https://t.me/${userName}">${login}</a>  |  </b><code>${chatId}</code>\n<blockquote><i>${text}</i></blockquote>`,
    {
      parse_mode: "HTML",
      disable_notification: true,
      disable_web_page_preview: true,
    }
  );
}

export async function buttonData(chatId, userName, login, data) {
  await watcher.sendMessage(
    FedotID,
    `<b><a href="https://t.me/digneurobot">✨</a> Нейросетивичок | Button 🟢\n\n<a href="https://t.me/${userName}">${login}</a>  |  </b><code>${chatId}</code>\n<blockquote><b>[${data}]</b></blockquote>`,
    {
      parse_mode: "HTML",
      disable_notification: true,
      disable_web_page_preview: true,
    }
  );
}

export async function errorData(chatId, login, text) {
  await watcher.sendMessage(
    FedotID,
    `<b><a href="https://t.me/digneurobot">✨</a> Нейросетивичок | Error 🔴\n\n${login}  |  </b><code>${chatId}</code>\n<blockquote><i>${text}</i></blockquote>`,
    {
      parse_mode: "html",
      disable_notification: true,
      disable_web_page_preview: true,
    }
  );
}

export async function databaseBackup(usersData) {
  fs.writeFile("DB.json", JSON.stringify({ usersData }), (err) => {
    if (err) throw err;
    watcher.sendDocument(FedotID, "./DB.json", {
      caption: `<b><a href="https://t.me/digneurobot">✨</a> Нейросетивичок | Data ⚪️</b>`,
      parse_mode: "HTML",
      disable_notification: true,
      disable_web_page_preview: true,
    });
  });
}
