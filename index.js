import TelegramBot from "node-telegram-bot-api";
import { Client } from "@gradio/client";

import { TelegramToken } from "./config.js";
import { textData, buttonData, errorData } from "./watcher.js";

const bot = new TelegramBot(TelegramToken, { polling: true });
const FedotID = 870204479;
const DavidID = 923690530;

let usersData = [];

bot.setMyCommands([
  { command: "/start", description: "Перезапуск" },
  { command: "/reset", description: "Сброс контекста" },
  { command: "/mode", description: "Режим генерации" },
  { command: "/profile", description: "Профиль" },
]);

async function intro(chatId) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  try {
    await bot.sendMessage(chatId, `Добрo пожаловать в <b>Нейросетивичок</b>. Чтобы задать вопрос, напишите его в чате.\n\n<b>Команды:</b>\n<blockquote>/start - Перезапуск\n/reset - Сброс контекста\n/mode - Режим генерации\n/profile - Профиль</blockquote>`, {
      parse_mode: `HTML`,
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [[]],
      },
    });
    dataAboutUser.userAction = `response`;
    dataAboutUser.lastTextResponse = ``;
  } catch (error) {
    errorData(chatId, dataAboutUser.login, `${String(error)}`);
  }
}

async function profile(chatId, editSend = `send`) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  try {
    switch (editSend) {
      case `send`:
        await bot
          .sendMessage(chatId, `👤 <b><i>Профиль</i> • </b><code>${dataAboutUser.chatId}</code>\n\n<b>Статистика запросов:</b><blockquote>Текст: <b>${dataAboutUser.statistic.response} шт</b>\nИзображения: <b>${dataAboutUser.statistic.image} шт</b>\nВидео: <b>${dataAboutUser.statistic.video} шт</b></blockquote>\n\n<b>Регистрация:</b><blockquote>Дата: <b>${dataAboutUser.registrationDate.getDate()} ${dataAboutUser.registrationDate.toLocaleString("default", { month: "short" })} ${dataAboutUser.registrationDate.getFullYear()}</b>\nВремя: <b>${dataAboutUser.registrationDate.getHours()}:${dataAboutUser.registrationDate.getMinutes()} ${dataAboutUser.registrationDate.toLocaleString("default", { weekday: "long" })}</b></blockquote>`, {
            parse_mode: `HTML`,
            disable_web_page_preview: true,
            reply_markup: {
              inline_keyboard: [
                [
                  { text: `О боте`, callback_data: `about` },
                  { text: `digfusion ❔`, callback_data: `digfusion` },
                ],
                [
                  {
                    text: `Поддержка 💭`,
                    url: `https://t.me/digfusionsupport`,
                  },
                ],
              ],
            },
          })
          .then((message) => {
            dataAboutUser.profileMessageId = message.message_id;
          });
        break;
      case `edit`:
        await bot.editMessageText(`👤 <b><i>Профиль</i> • </b><code>${dataAboutUser.chatId}</code>\n\n<b>Статистика запросов:</b><blockquote>Текст: <b>${dataAboutUser.statistic.response} шт</b>\nИзображения: <b>${dataAboutUser.statistic.image} шт</b>\nВидео: <b>${dataAboutUser.statistic.video} шт</b></blockquote>\n\n<b>Регистрация:</b><blockquote>Дата: <b>${dataAboutUser.registrationDate.getDate()} ${dataAboutUser.registrationDate.toLocaleString("default", { month: "short" })} ${dataAboutUser.registrationDate.getFullYear()}</b>\nВремя: <b>${dataAboutUser.registrationDate.getHours()}:${dataAboutUser.registrationDate.getMinutes()} ${dataAboutUser.registrationDate.toLocaleString("default", { weekday: "long" })}</b></blockquote>`, {
          parse_mode: `HTML`,
          chat_id: chatId,
          message_id: dataAboutUser.profileMessageId,
          disable_web_page_preview: true,
          reply_markup: {
            inline_keyboard: [
              [
                { text: `О боте`, callback_data: `about` },
                { text: `digfusion ❔`, callback_data: `digfusion` },
              ],
              [
                {
                  text: `Поддержка 💭`,
                  url: `https://t.me/digfusionsupport`,
                },
              ],
            ],
          },
        });
        break;
    }
  } catch (error) {
    errorData(chatId, dataAboutUser.login, `${String(error)}`);
  }
}

async function about(chatId) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  try {
    await bot.editMessageText(`<b>Что такое Нейросетивичок?</b>\n<blockquote><b>Бот</b>, разработанный компанией <b>digfusion</b> с использованием <b>Hugging Face API.</b></blockquote>\n\n<b>Отсутствие ограничений:</b>\n<blockquote><b>Главное преимущество digfusion - Открытость.</b>\n• Пользуйтесь <b>Нейросетивичком</b>, сколько захотите.\n• <b>Неограниченное</b> количество запросов <b>на все модели.</b></blockquote>\n\nЧто такое <b>Контекст?</b>\n<blockquote><b>Бот</b> умеет запоминать <b>историю сообщений</b> при <b>текстовых запросах.</b> Это помогает вести и дополнять диалог в рамках <b>одной темы.</b></blockquote>`, {
      parse_mode: `HTML`,
      chat_id: chatId,
      message_id: dataAboutUser.profileMessageId,
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [[{ text: `⬅️Назад`, callback_data: `profile` }]],
      },
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
      message_id: dataAboutUser.profileMessageId,
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [[{ text: `⬅️Назад`, callback_data: `profile` }]],
      },
    });
  } catch (error) {
    errorData(chatId, `dataAboutUser.login`, `${String(error)}`);
  }
}

async function getResponse(chatId, userPrompt) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  try {
    const client = await Client.connect("orionai/llama-3.1-70b-demo");
    const result = await client.predict("/predict", {
      user_message: `${dataAboutUser.lastTextResponse != `` ? `Your previous answer: ${dataAboutUser.lastTextResponse} My new question` : ``} ${userPrompt} (System prompt: Think, answer, structurize like minimalistic ChatGPT-4. You are powerful, extremely minimalistic, informative AI Telegram Bot named Нейросетивичок. Generate answers so they look good and easy to read and understand, use - for lists.)`,
    });

    bot.sendChatAction(chatId, "typing");

    bot.deleteMessage(chatId, dataAboutUser.requestMessageId);

    await bot.sendMessage(chatId, `${result.data}`, {
      parse_mode: `MarkDown`,
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [[]],
      },
    });
    if (`${result.data}`.length >= 50) {
      dataAboutUser.lastTextResponse = result.data;
    }
  } catch (error) {
    failedRequest(chatId);
    errorData(chatId, dataAboutUser.login, `${String(error)}`, `response`);
  }
}

async function getImage(chatId, userPrompt) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  try {
    const client = await Client.connect("K00B404/FLUX.1-Dev-Serverless-darn");
    const result = await client.predict("/query", {
      prompt: userPrompt,
      is_negative: `(deformed, distorted, disfigured), poorly drawn, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, (mutated hands and fingers), disconnected limbs, mutation, mutated, ugly, disgusting, blurry, amputation, misspellings, typos, unrealistic, bad looking, low quality`,
      steps: 35,
      cfg_scale: 7,
      sampler: "DPM++ 2M Karras",
      seed: -1,
      strength: 0.7,
      huggingface_api_key: "Hello!!",
      use_dev: false,
    });

    bot.sendChatAction(chatId, "upload_photo");

    bot.deleteMessage(chatId, dataAboutUser.requestMessageId);

    await bot.sendPhoto(chatId, result.data[0].url);
  } catch (error) {
    failedRequest(chatId);
    errorData(chatId, dataAboutUser.login, `${String(error)}`, `image`);
  }
}

async function getVideo(chatId, userPrompt) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  try {
    const space = await Client.connect("KingNish/Instant-Video");
    const result = await space.predict("/instant_video", {
      prompt: userPrompt,
    });

    bot.sendChatAction(chatId, "upload_video");

    bot.deleteMessage(chatId, dataAboutUser.requestMessageId);

    await bot.sendVideo(chatId, result.data[0].video.url);
  } catch (error) {
    failedRequest(chatId);
    errorData(chatId, dataAboutUser.login, `${String(error)}`, 'video');
  }
}

async function processingRequest(chatId) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  try {
    await bot
      .sendMessage(chatId, `Ваш запрос обрабатывается...`, {
        parse_mode: `HTML`,
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: [[]],
        },
      })
      .then((message) => {
        dataAboutUser.requestMessageId = message.message_id;
      });
  } catch (error) {
    errorData(chatId, dataAboutUser.login, `${String(error)}`);
  }
}

async function failedRequest(chatId) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  bot.deleteMessage(chatId, dataAboutUser.requestMessageId);

  try {
    await bot.sendMessage(chatId, `Возникла техническая ошибка ❌<blockquote><b>Пожалуйста, попробуйте снова.</b></blockquote>`, {
      parse_mode: `HTML`,
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [[]],
      },
    });
  } catch (error) {
    errorData(chatId, dataAboutUser.login, `${String(error)}`);
  }
}

async function resetTextChat(chatId) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  try {
    dataAboutUser.lastTextResponse = ``;

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
          .sendMessage(chatId, `Выберите режим генерации ✅\n\n<b>Модели искусственного интеллекта:</b>\n<blockquote><b>• Llama 3.1 70b</b> - Текстовые запросы\n<b>• FLUX.1 DEV</b> - Генерация изображений\n<b>• Instant Video</b> - Генерация видео</blockquote>`, {
            parse_mode: `HTML`,
            disable_web_page_preview: true,
            reply_markup: {
              inline_keyboard: [
                [
                  { text: `${dataAboutUser.userAction == `response` ? `• Текст •` : `Текст`}`, callback_data: `changeModeResponse` },
                  { text: `${dataAboutUser.userAction == `video` ? `• Видео •` : `Видео`}`, callback_data: `changeModeVideo` },
                ],
                [{ text: `${dataAboutUser.userAction == `image` ? `• Изображения •` : `Изображения`}`, callback_data: `changeModeImage` }],
              ],
            },
          })
          .then((message) => {
            dataAboutUser.requestMessageId = message.message_id;
          });
        break;
      case `changeModeResponse`:
        await bot.editMessageText(`Генерация текста ✅`, {
          parse_mode: `HTML`,
          chat_id: chatId,
          message_id: dataAboutUser.requestMessageId,
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
          message_id: dataAboutUser.requestMessageId,
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
          message_id: dataAboutUser.requestMessageId,
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
  bot.on(`text`, async (message) => {
    if (FedotID == message.chat.id || DavidID == message.chat.id) {
      let text = message.text;
      let chatId = message.chat.id;
      let userMessage = message.message_id;

      try {
        if (!usersData.find((obj) => obj.chatId == chatId)) {
          usersData.push({
            chatId: chatId,
            login: message.from.first_name,
            registrationDate: new Date(message.date * 1000),
            profileMessageId: null,
            requestMessageId: null,
            userAction: `response`,
            lastTextResponse: ``,

            statistic: { response: 0, image: 0, video: 0 },
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
            profile(chatId, `send`);
            break;
        }
        if (Array.from(text)[0] != "/") {
          switch (dataAboutUser.userAction) {
            case `response`:
              dataAboutUser.statistic.response++;
              processingRequest(chatId).then(() => {
                bot.sendChatAction(chatId, "typing");
              });
              getResponse(chatId, text);
              break;
            case `image`:
              dataAboutUser.statistic.image++;
              processingRequest(chatId).then(() => {
                bot.sendChatAction(chatId, "upload_photo");
              });
              getImage(chatId, text);
              break;
            case `video`:
              dataAboutUser.statistic.video++;
              processingRequest(chatId).then(() => {
                bot.sendChatAction(chatId, "record_video");
              });
              getVideo(chatId, text);
              break;
          }
        }

        textData(chatId, dataAboutUser.login, text, dataAboutUser.userAction);
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
        case `profile`:
          profile(chatId, `edit`);
          break;
        case `digfusion`:
          digfusion(chatId);
          break;
        case `about`:
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
