import TelegramBot from "node-telegram-bot-api";
import { Client } from "@gradio/client";

import { TelegramToken } from "./config.js";
import { textData, buttonData, errorData } from "./watcher.js";

const bot = new TelegramBot(TelegramToken, { polling: true });
const FedotID = 870204479;
const DavidID = 923690530;

let usersData = [];

let aboutText = `<b>Что такое Нейросетивичок?</b>\n<blockquote><b>Бот</b>, разработанный компанией <b>digfusion</b> с использованием <b>Hugging Face API</b>.</blockquote>\n\n<b>Модели искусственного интеллекта:</b>\n<blockquote><b>• OpenGPT 4o</b> - Текстовые запросы\n<b>• OpenGPT 4o</b> - Генерация изображений\n<b>• Instant Video</b> - Генерация видео</blockquote>\n\n<b>Отсутствие ограничений:</b>\n<blockquote><b>Главное преимущество digfusion - Открытость.</b>\n\nМы становимся лучше и не лимитируем количество запросов.</blockquote>`;

bot.setMyCommands([
  { command: "/start", description: "Перезапуск" },
  { command: "/reset", description: "Сброс контекста" },
  { command: "/mode", description: "Режим генерации" },
  { command: "/profile", description: "Профиль" },
  { command: "/about", description: "О боте" },
]);

async function intro(chatId) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  try {
    await bot.sendMessage(chatId, `Добрo пожаловать в <b>Нейросетивичок</b>. Чтобы задать вопрос, напишите его в чате.\n\n<b>Команды:</b>\n<blockquote>/start - Перезапуск\n/reset - Сброс контекста\n/mode - Режим генерации\n/profile - Профиль\n/about - О боте</blockquote>`, {
      parse_mode: `HTML`,
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [[]],
      },
    });
    dataAboutUser.userAction = `response`;
  } catch (error) {
    errorData(chatId, dataAboutUser.login, `${String(error)}`);
  }
}

async function profile(chatId) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  try {
    await bot.sendMessage(chatId, `👤 <b><i>Профиль</i> • </b><code>${dataAboutUser.chatId}</code>\n\n<b>Статистика запросов:</b><blockquote>Текст: <b>${175} шт</b>\nИзображения: <b>${21} шт</b>\nВидео: <b>${7} шт</b></blockquote>`, {
      parse_mode: `HTML`,
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: `Поддержка 💭`,
              url: `https://t.me/digfusionsupport`,
            },
          ],
        ],
      },
    });
  } catch (error) {
    errorData(chatId, dataAboutUser.login, `${String(error)}`);
  }
}

async function about(chatId) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  try {
    await bot
      .sendMessage(chatId, aboutText, {
        parse_mode: `HTML`,
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: [[{ text: `digfusion ❔`, callback_data: `digfusion` }]],
        },
      })
      .then((message) => {
        dataAboutUser.messageId = message.message_id;
      });
  } catch (error) {
    errorData(chatId, dataAboutUser.login, `${String(error)}`);
  }
}

async function digfusion(chatId) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  try {
    await bot.editMessageText(`<b><i>❔digfusion • О нас</i></b><blockquote>Компания <b><i>digfusion</i></b> - <b>начинающий стартап,</b> разрабатывающий <b>свои приложения</b> и предоставляющий услуги по <b>созданию чат-ботов</b> различных типов!\n\nПросмотреть все <b>наши проекты, реальные отзывы, каталог услуг</b> и <b>прочую информацию о компании</b> можно в нашем <b>Telegram канале</b> и <b>боте-консультанте!</b></blockquote>\n\n<b><a href="https://t.me/digfusion">digfusion | инфо</a> • <a href="https://t.me/digfusionbot">digfusion | услуги</a></b>`, {
      parse_mode: "html",
      chat_id: chatId,
      message_id: dataAboutUser.messageId,
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [
          [
            { text: "⬅️Назад", callback_data: "about" },
            {
              text: "Поддержка 💭",
              url: "https://t.me/digfusionsupport",
            },
          ],
        ],
      },
    });
  } catch (error) {
    errorData(chatId, `dataAboutUser.login`, `${String(error)}`);
  }
}

async function getResponse(chatId, userPrompt) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  bot.sendChatAction(chatId, "typing");

  try {
    const space = await Client.connect("emeeran/ChatGPT-4o");
    const result = await space.predict("/chat", {
      message: userPrompt,
      request: "You are a helpful and powerful Chatbot.",
      param_3: 1024,
      param_4: 0.7,
      param_5: 0.95,
    });

    bot.sendChatAction(chatId, "typing");

    await bot.sendMessage(chatId, `${result.data[0]}`, {
      parse_mode: `HTML`,
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [[]],
      },
    });
  } catch (error) {
    console.log(error);
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

async function resetTextChat(chatId) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  try {
    await bot.sendMessage(chatId, `Контекст успешно сброшен ✅<blockquote><b>Напишите свой вопрос в чате.</b></blockquote>`, {
      parse_mode: `HTML`,
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [[]],
      },
    });
    dataAboutUser.userAction = `response`;
  } catch (error) {
    errorData(chatId, dataAboutUser.login, `${String(error)}`);
  }
}

async function changeMode(chatId, mode = `changeTo`) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  try {
    switch (mode) {
      case `changeTo`:
        await bot
          .sendMessage(chatId, `Выберите режим генерации ✅`, {
            parse_mode: `HTML`,
            disable_web_page_preview: true,
            reply_markup: {
              inline_keyboard: [[{ text: `Текст`, callback_data: `changeModeResponse` }], [{ text: `Изображения`, callback_data: `changeModeImage` }], [{ text: `Видео`, callback_data: `changeModeVideo` }]],
            },
          })
          .then((message) => {
            dataAboutUser.messageId = message.message_id;
          });
        break;
      case `changeModeResponse`:
        await bot.editMessageText(`Генерация текста ✅`, {
          parse_mode: `HTML`,
          chat_id: chatId,
          message_id: dataAboutUser.messageId,
          disable_web_page_preview: true,
          reply_markup: {
            inline_keyboard: [[]],
          },
        });
        dataAboutUser.userAction = `response`;
        break;
      case `changeModeImage`:
        await bot.editMessageText(`Генерация изображений ✅`, {
          parse_mode: `HTML`,
          chat_id: chatId,
          message_id: dataAboutUser.messageId,
          disable_web_page_preview: true,
          reply_markup: {
            inline_keyboard: [[]],
          },
        });
        dataAboutUser.userAction = `image`;
        break;
      case `changeModeVideo`:
        await bot.editMessageText(`Генерация видео ✅`, {
          parse_mode: `HTML`,
          chat_id: chatId,
          message_id: dataAboutUser.messageId,
          disable_web_page_preview: true,
          reply_markup: {
            inline_keyboard: [[]],
          },
        });
        dataAboutUser.userAction = `video`;
        break;
    }
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
          usersData.push({
            chatId: chatId,
            login: message.from.first_name,
            messageId: null,
            userAction: `response`,

            statistic: { text: 0, image: 0, video: 0 },
          });
        }

        const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

        switch (text) {
          case `/start`:
            intro(chatId);
            break;
          case `/reset`:
            resetTextChat(chatId);
            break;
          case `/mode`:
            changeMode(chatId);
            break;
          case `/profile`:
            profile(chatId);
            break;
          case `/about`:
            about(chatId, `send`);
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

  bot.on(`callback_query`, async (query) => {
    let chatId = query.message.chat.id;
    let data = query.data;

    const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

    try {
      switch (data) {
        case `changeModeResponse`:
          changeMode(chatId, data);
          break;
        case `changeModeImage`:
          changeMode(chatId, data);
          break;
        case `changeModeVideo`:
          changeMode(chatId, data);
          break;
        case `digfusion`:
          digfusion(chatId);
          break;
        case `about`:
          bot.deleteMessage(chatId, dataAboutUser.messageId);
          about(chatId);
          break;
      }

      buttonData(chatId, dataAboutUser.login, data);
    } catch (error) {
      errorData(chatId, `dataAboutUser.login`, `${String(error)}`);
    }
  });
}

StartAll();
