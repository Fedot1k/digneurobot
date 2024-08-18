import TelegramBot from "node-telegram-bot-api";

import { TelegramToken } from "./config.js";

const bot = new TelegramBot(TelegramToken, { polling: true });
const devs = [870204479];

let usersData = [];

bot.setMyCommands([{ command: "/start", description: "Запуск ⚡️" }]);

async function first(chatId, stage = 1) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  try {
    switch (stage) {
      case 1:
        await bot.sendMessage(chatId, `sup man`, {
          parse_mode: `HTML`,
          disable_web_page_preview: true,
          reply_markup: {
            inline_keyboard: [[{ text: `Начать ⚡️`, callback_data: `lets go` }]],
          },
        });
        break;
      case 2:
        break;
    }
  } catch (error) {}
}

async function StartAll() {
  bot.on(`message`, async (message) => {
    if (devs.includes(message.chat.id)) {
      let text = message.text;
      let chatId = message.chat.id;
      let userMessage = message.message_id;

      try {
        if (!usersData.find((obj) => obj.chatId == chatId)) {
          usersData.push({});
        }

        const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

        switch (text) {
          case `/start`:
            first(chatId);
            break;
        }
      } catch (error) {}
    }
  });
}

StartAll();
