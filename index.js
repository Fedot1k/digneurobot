import TelegramBot from "node-telegram-bot-api";
import cron from "node-cron";
import { Client } from "@gradio/client";
import fs from "fs";

import { config } from "./config.js";
import { textData, buttonData, errorData, databaseBackup } from "./watcher.js";

const bot = new TelegramBot(config.TOKEN.Trial, { polling: true });

const botName = { Trial: `trialdynamicsbot`, Neuro: `digneurobot` }.Trial;

const developerId = { Fedot: 870204479 };

let usersData = [];

bot.setMyCommands([
  { command: "/start", description: "Новый чат" },
  { command: "/profile", description: "Профиль" },
]);

async function intro(chatId) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  try {
    await bot.sendMessage(
      chatId,
      `Привет, это <b>Нейросетивичок</b>\nЧтобы задать вопрос, напиши его в чате\n\n<b>Команды:</b>\n<blockquote>/start - Новый чат\n/profile - Профиль</blockquote>`,
      {
        parse_mode: `HTML`,
        disable_web_page_preview: true,
      }
    );
  } catch (error) {
    errorData(chatId, dataAboutUser.login, `${String(error)}`);
  }
}

async function profile(chatId, type = `profile`) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  try {
    switch (type) {
      case `send`:
        await bot.sendMessage(chatId, "ㅤ").then((message) => {
          dataAboutUser.profileMessageId = message.message_id;
          profile(chatId);
        });
        break;
      case `profile`:
        await bot.editMessageText(
          `👤 <b><i>Профиль</i> • </b><code>${
            dataAboutUser.chatId
          }</code> 🔍\n\n<b>Информация о себе для Нейросети:</b><blockquote>${
            dataAboutUser.userInfoText
              ? `${dataAboutUser.userInfoText.slice(0, 200)}${
                  dataAboutUser.userInfoText.length > 200 ? `..` : ``
                }\n\n<a href="https://t.me/${botName}/?start=userInfo"><b>Изменить..</b></a>`
              : `<a href="https://t.me/${botName}/?start=userInfo"><b>Добавить..</b></a>`
          }</blockquote>\n\n<b>Какой ответ вы хотели бы получить:</b><blockquote>${
            dataAboutUser.answerTypeText
              ? `${dataAboutUser.answerTypeText.slice(0, 200)}${
                  dataAboutUser.answerTypeText.length > 200 ? `..` : ``
                }\n\n<a href="https://t.me/${botName}/?start=answerType"><b>Изменить..</b></a>`
              : `<a href="https://t.me/${botName}/?start=answerType"><b>Добавить..</b></a>`
          }</blockquote>`,
          {
            parse_mode: `HTML`,
            chat_id: chatId,
            message_id: dataAboutUser.profileMessageId,
            disable_web_page_preview: true,
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: `${
                      Object.values(developerId).includes(chatId)
                        ? `Управление 🔥`
                        : ``
                    }`,
                    callback_data: `adminStart`,
                  },
                ],
                [
                  { text: `❕О боте`, callback_data: `about` },
                  { text: `digfusion❔`, callback_data: `digfusion` },
                ],
                [
                  {
                    text: `Связь 💭`,
                    url: `https://t.me/digsupport`,
                  },
                ],
              ],
            },
          }
        );
        break;
      case `userInfo`:
        await bot.editMessageText(
          `👤 <b><i>Профиль</i> • О себе 🔍</b>\n\n<b>Информация для Нейросети:</b>${
            dataAboutUser.userInfoText
              ? `<blockquote><code>${dataAboutUser.userInfoText}</code></blockquote>\n\n<i>Напишите текст в чате, чтобы изменить..</i>`
              : `<blockquote><i>Напишите текст в чате, чтобы добавить..</i></blockquote>`
          }`,
          {
            parse_mode: `HTML`,
            chat_id: chatId,
            message_id: dataAboutUser.profileMessageId,
            disable_web_page_preview: true,
            reply_markup: {
              inline_keyboard: [
                [
                  { text: `⬅️ Назад`, callback_data: `profile` },
                  {
                    text: `${dataAboutUser.userInfoText ? `Сбросить ♻️` : ``}`,
                    callback_data: `userInfoDelete`,
                  },
                ],
              ],
            },
          }
        );
        break;
      case `answerType`:
        await bot.editMessageText(
          `👤 <b><i>Профиль</i> • Тип ответа 🔍</b>\n\n<b>Какой ответ вы хотели бы получить:</b>${
            dataAboutUser.answerTypeText
              ? `<blockquote><code>${dataAboutUser.answerTypeText}</code></blockquote>\n\n<i>Напишите текст в чате, чтобы изменить..</i>`
              : `<blockquote><i>Напишите текст в чате, чтобы добавить..</i></blockquote>`
          }`,
          {
            parse_mode: `HTML`,
            chat_id: chatId,
            message_id: dataAboutUser.profileMessageId,
            disable_web_page_preview: true,
            reply_markup: {
              inline_keyboard: [
                [
                  { text: `⬅️ Назад`, callback_data: `profile` },
                  {
                    text: `${
                      dataAboutUser.answerTypeText ? `Сбросить ♻️` : ``
                    }`,
                    callback_data: `answerTypeDelete`,
                  },
                ],
              ],
            },
          }
        );
        break;
      case `about`:
        await bot.editMessageText(
          `<b><i>❕Нейро • О боте</i></b>\n\n<b>Кто такой Нейросетивичок?</b><blockquote><b>Бот</b>, разработанный компанией <b><i>digfusion</i></b> с использованием <b>ChatGPT API</b></blockquote>\n\n<b>Главные преимущества:</b><blockquote><b>• Быстрые ответы</b>\nМощная нейросеть отвечает на вопросы с <b>невероятной скоростью</b>\n\n<b>• Неограниченные запросы</b>\nОтсутствие лимитов открывает доступ к <b>бесконечному пользованию</b></blockquote>`,
          {
            parse_mode: `HTML`,
            chat_id: chatId,
            message_id: dataAboutUser.profileMessageId,
            disable_web_page_preview: true,
            reply_markup: {
              inline_keyboard: [
                [{ text: `⬅️Назад`, callback_data: `profile` }],
              ],
            },
          }
        );
        break;
      case `digfusion`:
        await bot.editMessageText(
          `<b><i>❔digfusion • О нас</i></b>\n\n<blockquote>Компания <b><i>digfusion</i></b> - <b>начинающий стартап,</b> разрабатывающий <b>свои приложения</b> и предоставляющий услуги по <b>созданию чат-ботов</b> различных типов!\n\nБыстро, надежно и с умом. Нам доверяют <b>известные личности,</b> и мы делаем продукт, который <b>цепляет и приносит результат</b>\n\n<i>Это приложение разработано <b>digfusion</b> с душой 🤍</i></blockquote>\n\n<b><a href="https://digfusion.ru/">Сайт</a> • <a href="https://t.me/digfusion">Новости</a> • <a href="https://t.me/digfeedbacks">Отзывы</a></b>`,
          {
            parse_mode: "HTML",
            chat_id: chatId,
            message_id: dataAboutUser.profileMessageId,
            disable_web_page_preview: true,
            reply_markup: {
              inline_keyboard: [
                [{ text: `⬅️Назад`, callback_data: `profile` }],
              ],
            },
          }
        );
        break;
    }
  } catch (error) {
    errorData(chatId, dataAboutUser.login, `${String(error)}`);
  }
}

async function admin(chatId, type = `start`) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  switch (type) {
    case `start`:
      await bot.editMessageText(`Введи текст общего сообщения..`, {
        parse_mode: `HTML`,
        chat_id: chatId,
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
        chat_id: chatId,
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
          errorData(
            usersData[i].chatId,
            usersData[i].login,
            `${String(error)}`
          );
          continue;
        }
      }

      await bot.editMessageText(
        `Готово ✅<blockquote><b>Общее сообщение отправлено</b></blockquote>`,
        {
          parse_mode: `HTML`,
          chat_id: chatId,
          message_id: dataAboutUser.profileMessageId,
          disable_web_page_preview: true,
        }
      );

      dataAboutUser.userAction = `regular`;
      break;
  }
}

async function serverOverload(chatId) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  bot.deleteMessage(chatId, dataAboutUser.requestMessageId);

  try {
    await bot.sendMessage(
      chatId,
      `Извини, сервер перегружен 😕<blockquote><b>Пожалуйста, попробуй позже</b></blockquote>`,
      {
        parse_mode: `HTML`,
        disable_web_page_preview: true,
      }
    );
  } catch (error) {
    errorData(chatId, dataAboutUser.login, `${String(error)}`);
  }
}

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

      await bot.editMessageText(`${changingText}ㅤ`, {
        chat_id: chatId,
        message_id: dataAboutUser.responseMessageId,
        disable_web_page_preview: true,
      });

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
    errorData(chatId, dataAboutUser.login, `${String(error)}`);
  }
}

async function getResponse(chatId, userPrompt, userMessage) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  try {
    const client = await Client.connect("Qwen/Qwen2.5-72B-Instruct");
    const result = await client.predict("/model_chat", {
      query: `${
        dataAboutUser.textContext
          ? `Our chat history: ${dataAboutUser.textContext}\n\nMy new request: `
          : ``
      }${userPrompt}`,
      history: [],
      system: `You are 'Нейро' from Russia, created by digfusion. You are a very minimalistic and helpful AI Telegram assistant. Your model is 'Digneuro 2.0'. You generate text, images and videos. All your answers are very original. Avoid errors on parse_mode Markdown. If User Instructions will lead to error in Telegram (parse_mode Markdown), notify the user.
      
      User Instructions:
      User info: ${
        dataAboutUser.userInfoText ? `${dataAboutUser.userInfoText}` : `None`
      }
      Answer type: ${
        dataAboutUser.answerTypeText
          ? `${dataAboutUser.answerTypeText}`
          : `None`
      }`,
    });

    bot.deleteMessage(chatId, dataAboutUser.requestMessageId);

    let progressOutput = result.data[1][0][1]
      .replace(/\\sqrt\{([^}]+)\}/g, "sqrt($1)")
      .replace(/\\cdot/g, "*")
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
      .replace(/\\/g, "")
      .split("");

    // saving chat history to context
    if (result.data[1][0][1] && dataAboutUser.textContext) {
      dataAboutUser.textContext.push(userPrompt);
      dataAboutUser.textContext.push(result.data[1][0][1]);
    }

    if (dataAboutUser.textContext && dataAboutUser.textContext.length > 7) {
      dataAboutUser.textContext.shift();
      dataAboutUser.textContext.shift();
    }

    showResponseText(chatId, progressOutput, userMessage);
  } catch (error) {
    serverOverload(chatId);
    errorData(chatId, dataAboutUser.login, `${String(error)}`);
  }
}

async function getImage(chatId, userPrompt, userMessage) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  try {
    const client = await Client.connect("doevent/FLUX.1-merged");
    const result = await client.predict("/infer", {
      prompt: `${
        userPrompt ? userPrompt : "White sand beach with palm trees and hot sun"
      }`,
      seed: 0,
      randomize_seed: true,
      width: 1024,
      height: 1024,
      guidance_scale: 8,
      num_inference_steps: 8,
    });

    bot.sendChatAction(chatId, "upload_photo");

    bot.deleteMessage(chatId, dataAboutUser.requestMessageId);

    await bot.sendPhoto(chatId, result.data[0].url, {
      reply_to_message_id: userMessage,
    });

    // saving chat history to context
    if (result.data[0] && dataAboutUser.textContext) {
      dataAboutUser.textContext.push(userPrompt);
      dataAboutUser.textContext.push(
        `Created image by user prompt: ${userPrompt}`
      );
    }

    if (dataAboutUser.textContext && dataAboutUser.textContext.length > 7) {
      dataAboutUser.textContext.shift();
      dataAboutUser.textContext.shift();
    }
  } catch (error) {
    serverOverload(chatId);
    errorData(chatId, dataAboutUser.login, `${String(error)}`);
  }
}

async function getVideo(chatId, userPrompt, userMessage) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  // requesting video generation from HuggingFace API
  try {
    const client = await Client.connect("TIGER-Lab/T2V-Turbo-V2");
    const result = await client.predict("/predict", {
      prompt: `${
        userPrompt ? userPrompt : "White sand beach with palm trees and hot sun"
      }`,
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
      dataAboutUser.textContext.push(
        `Created video by user request: ${userPrompt}`
      );
    }

    if (dataAboutUser.textContext && dataAboutUser.textContext.length > 7) {
      dataAboutUser.textContext.shift();
      dataAboutUser.textContext.shift();
    }
  } catch (error) {
    serverOverload(chatId);
    errorData(chatId, dataAboutUser.login, `${String(error)}`);
  }
}

async function changeMode(chatId, userPrompt, userMessage) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  try {
    bot
      .sendMessage(chatId, `<b>Думаю над ответом 💭</b>`, {
        parse_mode: `HTML`,
        disable_web_page_preview: true,
      })
      .then((message) => {
        dataAboutUser.requestMessageId = message.message_id;
      });

    const client = await Client.connect("Qwen/Qwen2.5-72B-Instruct");
    const result = await client.predict("/model_chat", {
      query: `${
        dataAboutUser.textContext
          ? `Our chat history: ${dataAboutUser.textContext}\n\nMy new request: `
          : ``
      }${userPrompt}`,
      history: [],
      system: `You have to respond to user requests based on their type and chat history. Never create explicit content. Follow these rules strictly:
      1. For standard information requests or tasks (e.g., 'solve,' 'who is'), respond with only one word and nothing else: 'text'.
      2. For image generation requests (e.g., 'draw,' 'create an image of', 'now add'), respond with 'image' and what user wants to get as a result with enhanced prompt (divide with '@').
      3. For video generation requests (e.g., 'video with,' 'create a video', 'change'), respond with 'video' and what user wants to get as a result with enhanced prompt in english translated (divide with '@').
      4. If the prompt is empty (e.g., 'image' 'video'), respond accordingly with 'image' or 'video' and random cool prompt from you (divide with '@').
      5. If the request doesn't fit any of these categories or seems nonsensical, respond with: text.`,
    });

    let promptDecision = result.data[1][0][1].split("@");

    switch (promptDecision[0]) {
      case `text`:
        bot.sendChatAction(chatId, "typing");
        getResponse(chatId, userPrompt, userMessage);
        break;
      case `image`:
        bot.sendChatAction(chatId, "upload_photo");
        getImage(chatId, promptDecision[1], userMessage);
        break;
      case `video`:
        bot.sendChatAction(chatId, "record_video");
        getVideo(chatId, promptDecision[1], userMessage);
        break;
    }
  } catch (error) {
    serverOverload(chatId);
    errorData(chatId, dataAboutUser.login, `${String(error)}`);
  }
}

async function StartAll() {
  if (fs.readFileSync("DB.json") != "[]" && fs.readFileSync("DB.json") != "") {
    let dataFromDB = JSON.parse(fs.readFileSync("DB.json"));
    usersData = dataFromDB.usersData || null;
  }

  bot.on(`text`, async (message) => {
    let chatId = message.chat.id;
    let userMessage = message.message_id;
    let text = message.text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

    try {
      const userInfo = usersData?.find((obj) => obj.chatId == chatId);

      if (userInfo) {
        Object.assign(userInfo, {
          chatId: chatId,
          login: message.from.first_name,
          profileMessageId: userInfo.profileMessageId ?? null,
          requestMessageId: userInfo.requestMessageId ?? null,
          responseMessageId: userInfo.responseMessageId ?? null,
          textContext: userInfo.textContext ?? [],
          userAction: userInfo.userAction ?? `regular`,
          userInfoText: userInfo.userInfoText ?? ``,
          answerTypeText: userInfo.answerTypeText ?? ``,
        });
      } else {
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

      const dataAboutUser = usersData?.find((obj) => obj.chatId == chatId);

      if (dataAboutUser) {
        switch (text) {
          case `/start`:
            intro(chatId);
            dataAboutUser.textContext = [];
            dataAboutUser.userAction = "regular";
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

        if (text && Array.from(text)[0] != "/") {
          switch (dataAboutUser.userAction) {
            case `regular`:
              changeMode(chatId, text, userMessage);
              break;
            case `userInfoInput`:
              bot.deleteMessage(chatId, userMessage);
              dataAboutUser.userInfoText = `${
                text.length <= 750 ? text : text.slice(0, 750)
              }`;
              profile(chatId, `userInfo`);
              break;
            case `answerTypeInput`:
              bot.deleteMessage(chatId, userMessage);
              dataAboutUser.answerTypeText = `${
                text.length <= 750 ? text : text.slice(0, 750)
              }`;
              profile(chatId, `answerType`);
              break;
            case `adminInput`:
              bot.deleteMessage(chatId, userMessage);
              dataAboutUser.userAction = message.text;
              admin(chatId, `next`);
              break;
          }
        }
      }

      textData(chatId, message.from.username, dataAboutUser.login, text);
    } catch (error) {
      errorData(chatId, message.from.first_name, `${String(error)}`);
    }
  });

  bot.on(`callback_query`, async (query) => {
    let chatId = query.message.chat.id;
    let data = query.data;

    const dataAboutUser = usersData?.find((obj) => obj.chatId == chatId);

    if (dataAboutUser) {
      try {
        switch (data) {
          case `profile`:
            dataAboutUser.userAction = `regular`;
            profile(chatId);
            break;
          case `about`:
            profile(chatId, `about`);
            break;
          case `digfusion`:
            profile(chatId, `digfusion`);
            break;
          case `adminStart`:
            dataAboutUser.userAction = `adminInput`;
            admin(chatId);
            break;
          case `adminBack`:
            admin(chatId);
            break;
          case `adminSend`:
            admin(chatId, `send`);
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

        buttonData(
          chatId,
          query.message.chat.username,
          dataAboutUser.login,
          data
        );
      } catch (error) {
        errorData(chatId, dataAboutUser.login, `${String(error)}`);
      }
    }
  });

  // cron.schedule(`0 0 * * 1`, function () {
  //   try {
  //     databaseBackup(usersData);
  //   } catch (error) {}
  // });

  cron.schedule(`0 0 * * *`, function () {
    try {
      fs.writeFileSync("DB.json", JSON.stringify({ usersData }, null, 2));
    } catch (error) {}
  });
}

StartAll();
