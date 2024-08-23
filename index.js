import TelegramBot from "node-telegram-bot-api";
import OpenAI from "openai";

import { TelegramToken, OrgID, ProjectApiKey, supportImagePath } from "./config.js";
import { textData, buttonData, errorData } from "./watcher.js";

const bot = new TelegramBot(TelegramToken, { polling: true });
const FedotID = 870204479;

const openai = new OpenAI({
  organization: OrgID,
  project: ProjectApiKey,
});

let usersData = [];

let introText = `Добрo пожаловать в <b>Нейросетивичок</b>. Чтобы задать вопрос, напишите его в чате.\n\n<b>Команды:</b>\n<blockquote>/start - перезапуск\n/reset - сброс контекста\n/support - поддержка\n/about - о боте</blockquote>`;
let aboutText = `Что такое <b>Нейросетивичок?</b>\n<blockquote>Бот, разработанный компанией digfusion с использованием OpenAI API.</blockquote>`;
let supportText = `@digfusionsupport\n\nДавид | с 10:00 до 21:00\n\n@digfusion × 2024`;

bot.setMyCommands([
  { command: "/start", description: "Перезапуск" },
  { command: "/reset", description: "Сброс контекста" },
  { command: "/support", description: "Поддержка " },
  { command: "/about", description: "О боте" },
]);

async function first(chatId, stage = 1, about = false) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  try {
    switch (stage) {
      case 1:
        await bot.sendMessage(chatId, `${about ? aboutText : introText}`, {
          parse_mode: `HTML`,
          disable_web_page_preview: true,
          reply_markup: {
            inline_keyboard: [[]],
          },
        });
        break;
      case 2:
        await bot.sendPhoto(chatId, supportImagePath, { caption: supportText });
        break;
    }
  } catch (error) {
    errorData(chatId, dataAboutUser.login, `${String(error)}`);
  }
}

async function getResponse(chatId, stage = 1, userPrompt) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  console.log(`starting`);

  try {
    const response = await openai.chat.completions.create({
      Authorization: Bearer`${ProjectApiKey}`,
      messages: [{ role: "user", content: `Say this is a test` }],
      model: "gpt-4o-mini",
    });
    console.log(response.headers.get("x-request-id"));
  } catch (error) {
    errorData(chatId, dataAboutUser.login, `${String(error)}`);
  }
}

async function StartAll() {
  bot.on(`message`, async (message) => {
    if (FedotID == message.chat.id) {
      let text = message.text;
      let chatId = message.chat.id;
      let userMessage = message.message_id;

      try {
        if (!usersData.find((obj) => obj.chatId == chatId)) {
          usersData.push({ chatId: chatId, login: message.from.first_name });
        }

        const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

        switch (text) {
          case `/start`:
            first(chatId, 1);
            break;
          case `/reset`:
            first(chatId, 1);
            break;
          case `/support`:
            first(chatId, 2);
            break;
          case `/about`:
            first(chatId, 1, true);
            break;
        }
        if (Array.from(text)[0] != "/") {
          getResponse(chatId, 1, text);
        }
        textData(chatId, dataAboutUser.login, text);
      } catch (error) {
        errorData(chatId, dataAboutUser.login, `${String(error)}`);
      }
    }
  });
}

StartAll();
