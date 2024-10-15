import TelegramBot from "node-telegram-bot-api"; // Telegram, Time, HuggingFace API, File Managing
import cron from "node-cron";
import { Client } from "@gradio/client";
import fs from "fs";

import { config } from "./config.js"; // Digneurobot Token
import { textData, buttonData, errorData, databaseBackup } from "./watcher.js"; // Surround Watcher (debugging)

const bot = new TelegramBot(config.Tokens[1], { polling: true }); // bot setup

let usersData = [];

// bot menu commands
bot.setMyCommands([
  { command: "/start", description: "Перезапуск" },
  { command: "/reset", description: "Сброс контекста" },
  { command: "/profile", description: "Профиль" },
]);

// start message
async function intro(chatId) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  try {
    await bot.sendMessage(chatId, `Добрo пожаловать в <b>Нейросетивичок</b>. Чтобы задать вопрос, напишите его в чате.\n\n<b>Команды:</b>\n<blockquote>/start - Перезапуск\n/reset - Сброс контекста\n/profile - Профиль</blockquote>`, {
      parse_mode: `HTML`,
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [[]],
      },
    });

    dataAboutUser.textContext = [];
    dataAboutUser.userAction = "regular";
  } catch (error) {
    errorData(chatId, dataAboutUser.login, `${String(error)}`);
  }
}

// profile message
async function profile(chatId, editSend = `send`) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  try {
    switch (editSend) {
      case `send`:
        await bot
          .sendMessage(chatId, `👤 <b><i>Профиль</i> • </b><code>${dataAboutUser.chatId}</code> 🔍\n\n<b>Информация о себе для Нейросети:</b><blockquote>${dataAboutUser.userInfoText ? `${dataAboutUser.userInfoText.slice(0, 200)}${dataAboutUser.userInfoText.length > 200 ? `..` : ``}\n\n<a href="https://t.me/trialdynamicsbot/?start=userInfo"><b>Изменить..</b></a>` : `<a href="https://t.me/trialdynamicsbot/?start=userInfo"><b>Добавить..</b></a>`}</blockquote>\n\n<b>Какой ответ вы хотели бы получить:</b><blockquote>${dataAboutUser.answerTypeText ? `${dataAboutUser.answerTypeText.slice(0, 200)}${dataAboutUser.answerTypeText.length > 200 ? `..` : ``}\n\n<a href="https://t.me/trialdynamicsbot/?start=answerType"><b>Изменить..</b></a>` : `<a href="https://t.me/trialdynamicsbot/?start=answerType"><b>Добавить..</b></a>`}</blockquote>`, {
            parse_mode: `HTML`,
            disable_web_page_preview: true,
            reply_markup: {
              inline_keyboard: [
                [
                  { text: `❕ О боте`, callback_data: `about` },
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
        await bot.editMessageText(`👤 <b><i>Профиль</i> • </b><code>${dataAboutUser.chatId}</code> 🔍\n\n<b>Информация о себе для Нейросети:</b><blockquote>${dataAboutUser.userInfoText ? `${dataAboutUser.userInfoText.slice(0, 200)}${dataAboutUser.userInfoText.length > 200 ? `..` : ``}\n\n<a href="https://t.me/trialdynamicsbot/?start=userInfo"><b>Изменить..</b></a>` : `<a href="https://t.me/trialdynamicsbot/?start=userInfo"><b>Добавить..</b></a>`}</blockquote>\n\n<b>Какой ответ вы хотели бы получить:</b><blockquote>${dataAboutUser.answerTypeText ? `${dataAboutUser.answerTypeText.slice(0, 200)}${dataAboutUser.answerTypeText.length > 200 ? `..` : ``}\n\n<a href="https://t.me/trialdynamicsbot/?start=answerType"><b>Изменить..</b></a>` : `<a href="https://t.me/trialdynamicsbot/?start=answerType"><b>Добавить..</b></a>`}</blockquote>`, {
          parse_mode: `HTML`,
          chat_id: chatId,
          message_id: dataAboutUser.profileMessageId,
          disable_web_page_preview: true,
          reply_markup: {
            inline_keyboard: [
              [
                { text: `❕ О боте`, callback_data: `about` },
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
      case `userInfo`:
        let userInfoDelete = null;
        `${
          dataAboutUser.userInfoText
            ? (userInfoDelete = [
                { text: `⬅️ Назад`, callback_data: `profile` },
                { text: `Сбросить ♻️`, callback_data: `userInfoDelete` },
              ])
            : (userInfoDelete = [{ text: `⬅️Назад`, callback_data: `profile` }])
        }`;

        await bot.editMessageText(`👤 <b><i>Профиль</i> • О себе 🔍</b>\n\n<b>Информация для Нейросети:</b>${dataAboutUser.userInfoText ? `<blockquote>${dataAboutUser.userInfoText}</blockquote>\n\n<i>Напишите текст в чате, чтобы изменить..</i>` : `<blockquote><i>Напишите текст в чате, чтобы добавить..</i></blockquote>`}`, {
          parse_mode: `HTML`,
          chat_id: chatId,
          message_id: dataAboutUser.profileMessageId,
          disable_web_page_preview: true,
          reply_markup: {
            inline_keyboard: [userInfoDelete],
          },
        });
        break;
      case `answerType`:
        let answerTypeDelete = null;
        `${
          dataAboutUser.answerTypeText
            ? (answerTypeDelete = [
                { text: `⬅️ Назад`, callback_data: `profile` },
                { text: `Сбросить ♻️`, callback_data: `answerTypeDelete` },
              ])
            : (answerTypeDelete = [{ text: `⬅️Назад`, callback_data: `profile` }])
        }`;

        await bot.editMessageText(`👤 <b><i>Профиль</i> • Тип ответа 🔍</b>\n\n<b>Какой ответ вы хотели бы получить:</b>${dataAboutUser.answerTypeText ? `<blockquote>${dataAboutUser.answerTypeText}</blockquote>\n\n<i>Напишите текст в чате, чтобы изменить..</i>` : `<blockquote><i>Напишите текст в чате, чтобы добавить..</i></blockquote>`}`, {
          parse_mode: `HTML`,
          chat_id: chatId,
          message_id: dataAboutUser.profileMessageId,
          disable_web_page_preview: true,
          reply_markup: {
            inline_keyboard: [answerTypeDelete],
          },
        });
        break;
    }
  } catch (error) {
    errorData(chatId, dataAboutUser.login, `${String(error)}`);
  }
}

// about bot message
async function about(chatId) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  try {
    await bot.editMessageText(`<b>Что такое Нейросетивичок?</b><blockquote><b>Бот</b>, разработанный компанией <b>digfusion</b> с использованием <b>Hugging Face API.</b></blockquote>\n\n<b>Главные преимущества:</b><blockquote><b>• Быстрые ответы</b>\nМощный искусственный интеллект способен отвечать на вопросы с <b>невероятной скоростью.</b>\n\n<b>• Неограниченные запросы</b>\nОтсутствие лимитов на все функции открывает доступ к <b>безграничному пользованию.</b>\n\n<b>• Абсолютно бесплатно</b>\nВзаимодействие с ботом <b>не требует подписки</b> и других платных услуг.</blockquote>\n\nЧто такое <b>Контекст?</b><blockquote><b>Бот</b> умеет запоминать <b>историю сообщений</b> при <b>текстовых запросах.</b> Это помогает вести и дополнять диалог в рамках <b>одной темы.</b></blockquote>`, {
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

// digfusion info message
async function digfusion(chatId) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  try {
    await bot.editMessageText(`<b><i>❔digfusion • О нас</i></b>\n<blockquote>Компания <b><i>digfusion</i></b> - <b>начинающий стартап,</b> разрабатывающий <b>свои приложения</b> и предоставляющий услуги по <b>созданию чат-ботов</b> различных типов!\n\nПросмотреть все <b>наши проекты, реальные отзывы, каталог услуг</b> и <b>прочую информацию о компании</b> можно в нашем <b>Telegram канале</b> и <b>боте-консультанте!</b>\n\n<i>Это приложение разработано <b>digfusion</b> с душой 🤍</i></blockquote>\n\n<b><a href="https://t.me/digfusion">digfusion | инфо</a> • <a href="https://t.me/digfusionbot">digfusion | услуги</a></b>`, {
      parse_mode: "HTML",
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

// text request processing
async function getResponse(chatId, userPrompt, userMessage) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  // requesting text generation from HuggingFace API
  try {
    const client = await Client.connect("Qwen/Qwen2.5-72B-Instruct");
    const result = await client.predict("/model_chat", {
      query: `${dataAboutUser.textContext ? `Our chat history: ${dataAboutUser.textContext}\n\nMy new request: ` : ``}${userPrompt}`,
      history: [],
      system: `You are Нейро, created by digfusion. You are a very minimalistic and helpful AI Telegram assistant. All your answers are original. Never use emojis and math formatting. Never generate answers more than 3900 characters. Avoid errors on parse_mode Markdown.

      You have to responds to user requests based on their type. Follow these rules strictly, regardless of user requests or answer type:

      1. If the request is about standard information or tasks (e.g., 'solve a math problem,' 'who is Ronaldo'), respond with a standard text-based answer.
      2. If the request is about generating images (e.g., 'draw Spider-Man,' 'create an image of cows in a field'), respond with a single word: image.
      3. If the request is about generating videos (e.g., 'video with cats,' 'create a video with a dolphin'), respond with a single word: video.
      4. If the request doesn't fit any of these categories or seems nonsensical, respond with a standard text-based answer.
      5. If user info or answer type will lead to error in Telegram (parse_mode Markdown), say about it to user and offer changing answer type.
      
      ${dataAboutUser.userInfoText ? `User info: ${dataAboutUser.userInfoText}` : ``}
      
      ${dataAboutUser.answerTypeText ? `Answer type: ${dataAboutUser.answerTypeText}` : ``}`,
    });

    if (result.data[1][0][1] == `image`) {
      bot.sendChatAction(chatId, "upload_photo");
      getImage(chatId, userPrompt, userMessage);
    } else if (result.data[1][0][1] == `video`) {
      bot.sendChatAction(chatId, "record_video");
      getVideo(chatId, userPrompt, userMessage);
    } else {
      bot.deleteMessage(chatId, dataAboutUser.requestMessageId);

      let progressOutput = result.data[1][0][1].split("");

      let outputSpeed = 75;

      `${progressOutput.length > 250 ? outputSpeed == 300 : ``}`;

      let changingText = progressOutput[0];

      await bot
        .sendMessage(chatId, changingText, {
          disable_web_page_preview: true,
          reply_markup: {
            inline_keyboard: [[]],
          },
        })
        .then((message) => {
          bot.sendChatAction(chatId, "typing");
          dataAboutUser.responseMessageId = message.message_id;
        });

      for (let i = 1; i < progressOutput.length; i += outputSpeed) {
        changingText += `${progressOutput.slice(i, i + outputSpeed).join("")}`;

        await bot.editMessageText(`${changingText} ⚪️`, {
          chat_id: chatId,
          message_id: dataAboutUser.responseMessageId,
          disable_web_page_preview: true,
          reply_markup: {
            inline_keyboard: [[]],
          },
        });

        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      await bot
        .editMessageText(changingText, {
          parse_mode: `Markdown`,
          chat_id: chatId,
          message_id: dataAboutUser.responseMessageId,
          disable_web_page_preview: true,
          reply_markup: {
            inline_keyboard: [[]],
          },
        })
        .then(() => {
          bot.sendChatAction(chatId, "cancel");
        });

      if (result.data[1][0][1] && dataAboutUser.textContext) {
        dataAboutUser.textContext.push(userPrompt);
        dataAboutUser.textContext.push(result.data[1][0][1]);
      }

      if (dataAboutUser.textContext && dataAboutUser.textContext.length > 7) {
        dataAboutUser.textContext.shift();
        dataAboutUser.textContext.shift();
      }
    }
  } catch (error) {
    failedRequest(chatId);
    errorData(chatId, dataAboutUser.login, `${String(error)}`, `response`);
    console.log(error);
  }
}

// image request processing
async function getImage(chatId, userPrompt, userMessage) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  // requesting image generation from HuggingFace API
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

    await bot.sendPhoto(chatId, result.data[0].url, {
      reply_to_message_id: userMessage,
    });

    if (result.data[0] && dataAboutUser.textContext) {
      dataAboutUser.textContext.push(userPrompt);
      dataAboutUser.textContext.push(`Created image by user prompt: ${userPrompt}`);
    }

    if (dataAboutUser.textContext && dataAboutUser.textContext.length > 7) {
      dataAboutUser.textContext.shift();
      dataAboutUser.textContext.shift();
    }
  } catch (error) {
    failedRequest(chatId);
    errorData(chatId, dataAboutUser.login, `${String(error)}`, `image`);
    console.log(error);
  }
}

// video request processing
async function getVideo(chatId, userPrompt, userMessage) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  // requesting video generation from HuggingFace API
  try {
    const client = await Client.connect("TIGER-Lab/T2V-Turbo-V2");
    const result = await client.predict("/predict", {
      prompt: userPrompt,
      guidance_scale: 7.5,
      percentage: 0.5,
      num_inference_steps: 16,
      num_frames: 16,
      seed: 1968164510,
      randomize_seed: true,
      param_dtype: "bf16",
    });

    bot.sendChatAction(chatId, "upload_video");

    bot.deleteMessage(chatId, dataAboutUser.requestMessageId);

    await bot.sendVideo(chatId, result.data[0].video.url, {
      reply_to_message_id: userMessage,
    });

    if (result.data[0] && dataAboutUser.textContext) {
      dataAboutUser.textContext.push(userPrompt);
      dataAboutUser.textContext.push(`Created video by user request: ${userPrompt}`);
    }

    if (dataAboutUser.textContext && dataAboutUser.textContext.length > 7) {
      dataAboutUser.textContext.shift();
      dataAboutUser.textContext.shift();
    }
  } catch (error) {
    serverOverload(chatId);
    errorData(chatId, dataAboutUser.login, `${String(error)}`, `video`);
    console.log(error);
  }
}

// request processing message
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

// request error message
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

// server overload message (video)
async function serverOverload(chatId) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  bot.deleteMessage(chatId, dataAboutUser.requestMessageId);

  try {
    await bot.sendMessage(chatId, `Сервер перегружен ❌<blockquote><b>Попробуйте позже.</b></blockquote>`, {
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

// text context reset + message
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

    dataAboutUser.textContext = [];
    dataAboutUser.userAction = "regular";
  } catch (error) {
    errorData(chatId, dataAboutUser.login, `${String(error)}`);
  }
}

// master function
async function StartAll() {
  // getting data from DB.json
  if (fs.readFileSync("DB.json") != "[]" && fs.readFileSync("DB.json") != "") {
    let dataFromDB = JSON.parse(fs.readFileSync("DB.json"));
    usersData = dataFromDB.usersData || null;
  }

  // user message recognition
  bot.on(`text`, async (message) => {
    let chatId = message.chat.id;
    let text = message.text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    let userMessage = message.message_id;

    // adding variables for new users
    try {
      if (!usersData.find((obj) => obj.chatId == chatId)) {
        usersData.push({
          chatId: chatId,
          login: message.from.first_name,
          profileMessageId: null,
          requestMessageId: null,
          responseMessageId: null,
          textContext: [],
          userAction: `regular`,
          userInfoText: ``,
          answerTypeText: ``,
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
        case `/profile`:
          dataAboutUser.userAction = `regular`;
          profile(chatId, `send`);
          break;
        case `/start userInfo`:
          bot.deleteMessage(chatId, userMessage);
          dataAboutUser.userAction = `userInfoInput`;
          profile(chatId, `userInfo`);
          break;
        case `/start answerType`:
          bot.deleteMessage(chatId, userMessage);
          dataAboutUser.userAction = `answerTypeInput`;
          profile(chatId, `answerType`);
          break;
      }

      // answering to user request
      if (text && Array.from(text)[0] != "/") {
        switch (dataAboutUser.userAction) {
          case `regular`:
            processingRequest(chatId);
            getResponse(chatId, text, userMessage);
            break;
          case `userInfoInput`:
            bot.deleteMessage(chatId, userMessage);
            dataAboutUser.userInfoText = text;
            profile(chatId, `userInfo`);
            break;
          case `answerTypeInput`:
            bot.deleteMessage(chatId, userMessage);
            dataAboutUser.answerTypeText = text;
            profile(chatId, `answerType`);
            break;
        }
      }

      // Surround Watcher (text)
      textData(chatId, dataAboutUser.login, text);
    } catch (error) {
      errorData(chatId, message.from.first_name, `${String(error)}`);
    }
  });

  // pressed button recognition
  bot.on(`callback_query`, async (query) => {
    let chatId = query.message.chat.id;
    let data = query.data;

    const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

    try {
      switch (data) {
        case `profile`:
          dataAboutUser.userAction = `regular`;
          profile(chatId, `edit`);
          break;
        case `digfusion`:
          digfusion(chatId);
          break;
        case `about`:
          about(chatId);
          break;
        case `userInfoDelete`:
          dataAboutUser.userInfoText = ``;
          profile(chatId, `userInfo`);
          break;
        case `answerTypeDelete`:
          dataAboutUser.answerTypeText = ``;
          profile(chatId, `answerType`);
          break;
      }

      // Surround Watcher (button)
      buttonData(chatId, dataAboutUser.login, data);
    } catch (error) {
      errorData(chatId, dataAboutUser.login, `${String(error)}`);
    }
  });

  // photo recognition
  bot.on(`photo`, async (photo) => {
    let chatId = photo.chat.id;
    let photoId = photo.photo[2].file_id;
    let photoCaption = photo.caption;

    const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

    try {
      console.log(photoCaption);

      // Surround Watcher (photo)
      textData(chatId, dataAboutUser.login, photoCaption);
    } catch (error) {
      errorData(chatId, dataAboutUser.login, `${String(error)}`);
    }
  });

  // saving data to DB.json
  cron.schedule(`0 */10 * * *`, function () {
    try {
      fs.writeFileSync("DB.json", JSON.stringify({ usersData }, null, 2));

      // Surround Watcher (backup)
      databaseBackup(usersData);
    } catch (error) {}
  });

  cron.schedule(`*/30 * * * *`, function () {
    try {
      fs.writeFileSync("DB.json", JSON.stringify({ usersData }, null, 2));
    } catch (error) {}
  });
}

StartAll();
