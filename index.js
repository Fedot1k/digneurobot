import TelegramBot from "node-telegram-bot-api";
import { Client } from "@gradio/client";

import { TelegramToken, supportImagePath } from "./config.js";
import { textData, buttonData, errorData } from "./watcher.js";

const bot = new TelegramBot(TelegramToken, { polling: true });
const FedotID = 870204479;
const DavidID = 923690530;

let usersData = [];

let introText = `Добрo пожаловать в <b>Нейросетивичок</b>. Чтобы задать вопрос, напишите его в чате.\n\n<b>Команды:</b>\n<blockquote>/start - перезапуск\n/reset - сброс контекста\n/support - поддержка\n/about - о боте</blockquote>`;

let aboutText = `<b>Что такое Нейросетивичок?</b>\n<blockquote><b>Бот</b>, разработанный компанией <b>digfusion</b> с использованием <b>Hugging Face API</b>.</blockquote>\n\n<b>Модели искусственного интеллекта:</b>\n<blockquote><b>• OpenGPT 4o</b> - Текстовые запросы\n<b>• OpenGPT 4o</b> - Генерация изображений\n<b>• Instant Video</b> - Генерация видео</blockquote>\n\n<b>Отсутствие ограничений:</b>\n<blockquote><b>Главное преимущество digfusion - Открытость.</b>\n\nМы становимся лучше и не лимитируем количество запросов.</blockquote>`;

let supportText = `@digfusionsupport\n\nДавид | с 10:00 до 21:00\n\n@digfusion × 2024`;

bot.setMyCommands([
  { command: "/start", description: "Перезапуск" },
  { command: "/reset", description: "Сброс контекста" },
  { command: "/text", description: "Текст" },
  { command: "/image", description: "Изображение" },
  { command: "/video", description: "Видео" },
  { command: "/support", description: "Поддержка " },
  { command: "/about", description: "О боте" },
]);

async function changeMode(chatId, mode) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  try {
    switch (mode) {
      case `response`:
        await bot
          .sendMessage(chatId, `Генерация текста ✅`, {
            parse_mode: `HTML`,
            disable_web_page_preview: true,
            reply_markup: {
              inline_keyboard: [[]],
            },
          })
          .then((message) => {
            dataAboutUser.userAction = `response`;
          });
        break;
      case `image`:
        await bot
          .sendMessage(chatId, `Генерация изображений ✅`, {
            parse_mode: `HTML`,
            disable_web_page_preview: true,
            reply_markup: {
              inline_keyboard: [[]],
            },
          })
          .then((message) => {
            dataAboutUser.userAction = `image`;
          });
        break;
      case `video`:
        await bot
          .sendMessage(chatId, `Генерация видео ✅`, {
            parse_mode: `HTML`,
            disable_web_page_preview: true,
            reply_markup: {
              inline_keyboard: [[]],
            },
          })
          .then((message) => {
            dataAboutUser.userAction = `video`;
          });
        break;
    }
  } catch (error) {
    errorData(chatId, dataAboutUser.login, `${String(error)}`);
  }
}

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

async function getResponse(chatId, userPrompt) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  bot.sendChatAction(chatId, "typing");

  try {
    const space = await Client.connect("KingNish/OpenGPT-4o");
    const result = await space.predict("/chat", {
      user_prompt: userPrompt,
    });

    console.log(result);
  } catch (error) {
    errorData(chatId, dataAboutUser.login, `${String(error)}`);
  }
}

async function getImage(chatId, userPrompt) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  bot.sendChatAction(chatId, "upload_photo");

  try {
    const space = await Client.connect("KingNish/Image-Gen-Pro");
    const result = await space.predict("/image_gen_pro", {
      instruction: userPrompt,
      input_image: null,
    });

    bot.sendChatAction(chatId, "upload_photo");

    await bot.sendPhoto(chatId, result.data[1].url);
  } catch (error) {
    errorData(chatId, dataAboutUser.login, `${String(error)}`);
  }
}

async function getVideo(chatId, userPrompt) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  bot.sendChatAction(chatId, "record_video");

  try {
    const space = await Client.connect("KingNish/Instant-Video");
    const result = await space.predict("/instant_video", {
      prompt: userPrompt,
    });

    bot.sendChatAction(chatId, "upload_video");

    await bot.sendVideo(chatId, result.data[0].video.url);
  } catch (error) {
    errorData(chatId, dataAboutUser.login, `${String(error)}`);
  }
}

async function StartAll() {
  bot.on(`message`, async (message) => {
    if (FedotID == message.chat.id || DavidID == message.chat.id) {
      let text = message.text;
      let chatId = message.chat.id;
      let userMessage = message.message_id;

      try {
        if (!usersData.find((obj) => obj.chatId == chatId)) {
          usersData.push({ chatId: chatId, login: message.from.first_name, userAction: `response` });
        }

        const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

        switch (text) {
          case `/start`:
            first(chatId, 1);
            break;
          case `/text`:
            changeMode(chatId, `response`);
            break;
          case `/image`:
            changeMode(chatId, `image`);
            break;
          case `/video`:
            changeMode(chatId, `video`);
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
          switch (dataAboutUser.userAction) {
            case `response`:
              getResponse(chatId, text);
              break;
            case `image`:
              getImage(chatId, text);
              break;
            case `video`:
              getVideo(chatId, text);
              break;
          }
        }

        textData(chatId, dataAboutUser.login, text);
      } catch (error) {
        errorData(chatId, dataAboutUser.login, `${String(error)}`);
      }
    }
  });
}

StartAll();
