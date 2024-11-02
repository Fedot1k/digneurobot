import TelegramBot from "node-telegram-bot-api"; // Telegram, Time, HuggingFace API, File Managing
import cron from "node-cron";
import { Client } from "@gradio/client";
import fs from "fs";

import { config } from "./config.js"; // Digneurobot Token
import { textData, buttonData, errorData, databaseBackup } from "./watcher.js"; // Surround Watcher (debugging)

const bot = new TelegramBot(config.Tokens[0], { polling: true }); // bot setup
const FedotID = 870204479; // developer ID

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
    });

    dataAboutUser.textContext = [];
    dataAboutUser.userAction = "regular";
  } catch (error) {
    errorData(chatId, dataAboutUser.login, `${String(error)}`);
  }
}

// profile message
async function profile(chatId, sectionType = `profile`) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  try {
    switch (sectionType) {
      case `send`:
        await bot.sendMessage(chatId, "ㅤ").then((message) => {
          dataAboutUser.profileMessageId = message.message_id;
          profile(chatId);
        });
        break;
      case `profile`:
        await bot.editMessageText(`👤 <b><i>Профиль</i> • </b><code>${dataAboutUser.chatId}</code> 🔍\n\n<b>Информация о себе для Нейросети:</b><blockquote>${dataAboutUser.userInfoText ? `${dataAboutUser.userInfoText.slice(0, 200)}${dataAboutUser.userInfoText.length > 200 ? `..` : ``}\n\n<a href="https://t.me/digneurobot/?start=userInfo"><b>Изменить..</b></a>` : `<a href="https://t.me/digneurobot/?start=userInfo"><b>Добавить..</b></a>`}</blockquote>\n\n<b>Какой ответ вы хотели бы получить:</b><blockquote>${dataAboutUser.answerTypeText ? `${dataAboutUser.answerTypeText.slice(0, 200)}${dataAboutUser.answerTypeText.length > 200 ? `..` : ``}\n\n<a href="https://t.me/digneurobot/?start=answerType"><b>Изменить..</b></a>` : `<a href="https://t.me/digneurobot/?start=answerType"><b>Добавить..</b></a>`}</blockquote>`, {
          parse_mode: `HTML`,
          chat_id: chatId,
          message_id: dataAboutUser.profileMessageId,
          disable_web_page_preview: true,
          reply_markup: {
            inline_keyboard: [
              [{ text: `${chatId == FedotID ? `Управление 🔥` : ``}`, callback_data: `adminStart` }],
              [
                { text: `❕ О боте`, callback_data: `about` },
                { text: `digfusion ❔`, callback_data: `digfusion` },
              ],
              [
                {
                  text: `Поддержка 💭`,
                  url: `https://t.me/digsupport`,
                },
              ],
            ],
          },
        });
        break;
      case `userInfo`:
        await bot.editMessageText(`👤 <b><i>Профиль</i> • О себе 🔍</b>\n\n<b>Информация для Нейросети:</b>${dataAboutUser.userInfoText ? `<blockquote><code>${dataAboutUser.userInfoText}</code></blockquote>\n\n<i>Напишите текст в чате, чтобы изменить..</i>` : `<blockquote><i>Напишите текст в чате, чтобы добавить..</i></blockquote>`}`, {
          parse_mode: `HTML`,
          chat_id: chatId,
          message_id: dataAboutUser.profileMessageId,
          disable_web_page_preview: true,
          reply_markup: {
            inline_keyboard: [
              [
                { text: `⬅️ Назад`, callback_data: `profile` },
                { text: `${dataAboutUser.userInfoText ? `Сбросить ♻️` : ``}`, callback_data: `userInfoDelete` },
              ],
            ],
          },
        });
        break;
      case `answerType`:
        await bot.editMessageText(`👤 <b><i>Профиль</i> • Тип ответа 🔍</b>\n\n<b>Какой ответ вы хотели бы получить:</b>${dataAboutUser.answerTypeText ? `<blockquote><code>${dataAboutUser.answerTypeText}</code></blockquote>\n\n<i>Напишите текст в чате, чтобы изменить..</i>` : `<blockquote><i>Напишите текст в чате, чтобы добавить..</i></blockquote>`}`, {
          parse_mode: `HTML`,
          chat_id: chatId,
          message_id: dataAboutUser.profileMessageId,
          disable_web_page_preview: true,
          reply_markup: {
            inline_keyboard: [
              [
                { text: `⬅️ Назад`, callback_data: `profile` },
                { text: `${dataAboutUser.answerTypeText ? `Сбросить ♻️` : ``}`, callback_data: `answerTypeDelete` },
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

// progressive text message output
async function showResponseText(chatId, progressOutput, userMessage) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  bot.sendChatAction(chatId, "typing");

  let outputSpeed = 200;
  `${progressOutput.length > 500 ? outputSpeed == 1500 : ``}`;

  // showing text by sliced chunks
  try {
    for (let i = 0; i < progressOutput.length; i += 3800) {
      let chunkMessage = progressOutput.slice(i, i + 3800);
      let changingText = chunkMessage[0];

      await bot
        .sendMessage(chatId, `${changingText} ⚪️`, {
          disable_web_page_preview: true,
          reply_to_message_id: `${i == 0 ? userMessage : null}`,
        })
        .then((message) => {
          dataAboutUser.responseMessageId = message.message_id;
        });

      // editing text message with symbols
      for (let i = 1; i < chunkMessage.length; i += outputSpeed) {
        changingText += `${chunkMessage.slice(i, i + outputSpeed).join("")}`;

        await bot.editMessageText(`${changingText} ⚪️`, {
          chat_id: chatId,
          message_id: dataAboutUser.responseMessageId,
          disable_web_page_preview: true,
        });

        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      // finishing and formatting text message output
      await bot.editMessageText(changingText, {
        parse_mode: `Markdown`,
        chat_id: chatId,
        message_id: dataAboutUser.responseMessageId,
        disable_web_page_preview: true,
      });
    }

    bot.sendChatAction(chatId, "cancel");
  } catch (error) {
    failedRequest(chatId);
    errorData(chatId, dataAboutUser.login, `${String(error)}`, `response`);
  }
}

// text request processing
async function getResponse(chatId, userPrompt, userMessage) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  // requesting text generation from HuggingFace API
  try {
    const client = await Client.connect("Qwen/Qwen2.5");
    const result = await client.predict("/model_chat_1", {
      query: `${dataAboutUser.textContext ? `Our chat history: ${dataAboutUser.textContext}\n\nMy new request: ` : ``}${userPrompt}`,
      history: [],
      system: `You are 'Нейро' from Russia, created by digfusion. You are a very minimalistic and helpful AI Telegram assistant. Your model is 'Digneuro 2.0'. You generate text, images and videos. All your answers are very original. Avoid errors on parse_mode Markdown. If User Instructions will lead to error in Telegram (parse_mode Markdown), notify the user. Check facts before answering.
      
      User Instructions:
      User info: ${dataAboutUser.userInfoText ? `${dataAboutUser.userInfoText}` : `none`}
      Answer type: ${dataAboutUser.answerTypeText ? `${dataAboutUser.answerTypeText}` : `none`}`,
      radio: `72B`,
    });

    bot.deleteMessage(chatId, dataAboutUser.requestMessageId);

    // preparing text for progressive output (symbols and speed)
    let progressOutput = result.data[1][0][1].text
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1) / ($2)")
      .replace(/\\sqrt\{([^}]+)\}/g, "sqrt($1)")
      .replace(/\\cdot/g, "*")
      .replace(/\\text\{([^}]+)\}/g, "$1")
      .replace(/\^(\{([^}]+)\}|[a-zA-Z0-9])/g, "^($2)")
      .replace(/_(\{([^}]+)\}|[a-zA-Z0-9])/g, "_($2)")
      .replace(/\\quad/g, " ")
      .replace(/\\implies/g, " => ")
      .replace(/\\rightarrow/g, " -> ")
      .replace(/\\leftarrow/g, " <- ")
      .replace(/\\geq/g, " >= ")
      .replace(/\\leq/g, " <= ")
      .replace(/\\neq/g, " != ")
      .replace(/\\approx/g, " ≈ ")
      .replace(/\\pi/g, "π")
      .replace(/\\infty/g, "∞")
      .replace(/\\sum/g, "sum")
      .replace(/\\int/g, "∫")
      .replace(/\\lim/g, "lim")
      .replace(/\\sin/g, "sin")
      .replace(/\\cos/g, "cos")
      .replace(/\\tan/g, "tan")
      .replace(/\\log/g, "log")
      .replace(/\\ln/g, "ln")
      .replace(/\\exp\{([^}]+)\}/g, "exp($1)")
      .replace(/\\overline\{([^}]+)\}/g, "($1)")
      .replace(/\\underline\{([^}]+)\}/g, "($1)")
      .replace(/\\binom\{([^}]+)\}\{([^}]+)\}/g, "($1 choose $2)")
      .replace(/\\/g, "")
      .split("");

    // saving chat history to context
    if (result.data[1][0][1].text && dataAboutUser.textContext) {
      dataAboutUser.textContext.push(userPrompt);
      dataAboutUser.textContext.push(result.data[1][0][1].text);
    }

    if (dataAboutUser.textContext && dataAboutUser.textContext.length > 7) {
      dataAboutUser.textContext.shift();
      dataAboutUser.textContext.shift();
    }

    // progressively printing out text response
    showResponseText(chatId, progressOutput, userMessage);
  } catch (error) {
    failedRequest(chatId);
    errorData(chatId, dataAboutUser.login, `${String(error)}`, `response`);
  }
}

// image request processing
async function getImage(chatId, userPrompt, userMessage) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  // requesting image generation from HuggingFace API
  try {
    const client = await Client.connect("Serg4451D/FLUX.1-Dev-Serverless-darn-enhanced-prompt");
    const result = await client.predict("/query", {
      prompt: userPrompt,
      is_negative: `(deformed, distorted, disfigured), poorly drawn, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, (mutated hands and fingers), disconnected limbs, mutation, mutated, ugly, disgusting, blurry, amputation, misspellings, typos, unrealistic, bad looking, low quality`,
      steps: 35,
      cfg_scale: 7,
      sampler: "DPM++ 2M Karras",
      seed: -1,
      strength: 0.7,
      huggingface_api_key: "",
      use_dev: false,
      enhance_prompt_style: "",
      enhance_prompt_option: false,
      nemo_enhance_prompt_style: "",
      use_mistral_nemo: false,
    });

    bot.sendChatAction(chatId, "upload_photo");

    bot.deleteMessage(chatId, dataAboutUser.requestMessageId);

    await bot.sendPhoto(chatId, result.data[0].url, {
      reply_to_message_id: userMessage,
    });

    // saving chat history to context
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

    // saving chat history to context
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
    });

    dataAboutUser.textContext = [];
    dataAboutUser.userAction = "regular";
  } catch (error) {
    errorData(chatId, dataAboutUser.login, `${String(error)}`);
  }
}

// processing and reformatting user request
async function changeMode(chatId, userPrompt, userMessage) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  // requesting text generation from HuggingFace API
  try {
    const client = await Client.connect("Qwen/Qwen2.5");
    const result = await client.predict("/model_chat_1", {
      query: `${dataAboutUser.textContext ? `Our chat history: ${dataAboutUser.textContext}\n\nMy new request: ` : ``}${userPrompt}`,
      history: [],
      system: `You have to respond to user requests based on their type and chat history. Never create explicit content. Follow these rules strictly:
      1. For standard information requests or tasks (e.g., 'solve,' 'who is'), respond with only one word and nothing else: 'text'.
      2. For image generation requests (e.g., 'draw,' 'create an image of', 'now add'), respond with 'image' and what user wants to get as a result (divide with '@').
      3. For video generation requests (e.g., 'video with,' 'create a video', 'change'), respond with 'video' and what user wants to get as a result in english translated (divide with '@').
      4. If the request doesn't fit any of these categories or seems nonsensical, respond with: text.`,
      radio: `72B`,
    });

    let promptDecision = result.data[1][0][1].text.split("@");

    // user request recognition (text, image, video)
    if (promptDecision[0] == `text`) {
      bot.sendChatAction(chatId, "typing");
      getResponse(chatId, userPrompt, userMessage);
    } else if (promptDecision[0] == `image`) {
      bot.sendChatAction(chatId, "upload_photo");
      getImage(chatId, promptDecision[1], userMessage);
    } else if (promptDecision[0] == `video`) {
      bot.sendChatAction(chatId, "record_video");
      getVideo(chatId, promptDecision[1], userMessage);
    }
  } catch (error) {
    failedRequest(chatId);
    errorData(chatId, dataAboutUser.login, `${String(error)}`, `response`);
  }
}

// admin bot control
async function adminControl(startNextSend = `start`) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == FedotID);

  switch (startNextSend) {
    case `start`:
      await bot.editMessageText(`Введите текст общего сообщения..`, {
        parse_mode: `HTML`,
        chat_id: FedotID,
        message_id: dataAboutUser.profileMessageId,
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: [[{ text: `⬅️Назад`, callback_data: `profile` }]],
        },
      });
      break;
    case `next`:
      await bot.editMessageText(dataAboutUser.userAction, {
        parse_mode: `HTML`,
        chat_id: FedotID,
        message_id: dataAboutUser.profileMessageId,
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: [
            [
              { text: `⬅️Назад`, callback_data: `adminStart` },
              { text: `Отправить ✅`, callback_data: `adminSend` },
            ],
          ],
        },
      });
      break;
    case `send`:
      for (let i = 0; i < usersData.length; i++) {
        try {
          await bot.sendMessage(usersData[i].chatId, dataAboutUser.userAction, {
            parse_mode: "HTML",
            disable_web_page_preview: true,
          });
        } catch (error) {
          errorData(usersData[i].chatId, usersData[i].login, `${String(error)}`);
          continue;
        }
      }

      await bot.editMessageText(`Общее сообщение отправлено ✅<blockquote><b>Different Animal. The Same Beast.</b></blockquote>`, {
        parse_mode: `HTML`,
        chat_id: FedotID,
        message_id: dataAboutUser.profileMessageId,
        disable_web_page_preview: true,
      });
      dataAboutUser.userAction = `regular`;
      break;
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

      // answering to request and saving user instructions
      if (text && Array.from(text)[0] != "/") {
        switch (dataAboutUser.userAction) {
          case `regular`:
            processingRequest(chatId);
            changeMode(chatId, text, userMessage);
            break;
          case `userInfoInput`:
            bot.deleteMessage(chatId, userMessage);
            dataAboutUser.userInfoText = `${text.length <= 750 ? text : text.slice(0, 750)}`;
            profile(chatId, `userInfo`);
            break;
          case `answerTypeInput`:
            bot.deleteMessage(chatId, userMessage);
            dataAboutUser.answerTypeText = `${text.length <= 750 ? text : text.slice(0, 750)}`;
            profile(chatId, `answerType`);
            break;
          case `adminInput`:
            bot.deleteMessage(chatId, userMessage);
            dataAboutUser.userAction = message.text;
            adminControl(`next`);
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
          profile(chatId);
          break;
        case `digfusion`:
          digfusion(chatId);
          break;
        case `about`:
          about(chatId);
          break;
        case `adminStart`:
          dataAboutUser.userAction = `adminInput`;
          adminControl(`start`);
          break;
        case `adminBack`:
          adminControl(`start`);
          break;
        case `adminSend`:
          adminControl(`send`);
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
      // Surround Watcher (photo)
      textData(chatId, dataAboutUser.login, photoCaption);
    } catch (error) {
      errorData(chatId, dataAboutUser.login, `${String(error)}`);
    }
  });

  // backup DB.json
  cron.schedule(`0 */10 * * *`, function () {
    try {
      // Surround Watcher (backup)
      databaseBackup(usersData);
    } catch (error) {}
  });

  // saving DB.json
  cron.schedule(`*/30 * * * *`, function () {
    try {
      fs.writeFileSync("DB.json", JSON.stringify({ usersData }, null, 2));
    } catch (error) {}
  });
}

StartAll();
