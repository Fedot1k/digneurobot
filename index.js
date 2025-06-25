import TelegramBot from "node-telegram-bot-api";
import cron from "node-cron";
import { Client } from "@gradio/client";
import fs from "fs";

import { config } from "./config.js";
import { textData, buttonData, errorData, databaseBackup } from "./watcher.js";

const bot = new TelegramBot(config.TOKEN.Neuro, { polling: true });

const botName = { Trial: `trialdynamicsbot`, Neuro: `digneurobot` }.Neuro;

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
      `Привет, это <b>Нейро</b>\nЧтобы задать вопрос, напиши его в чате\n\n<b>Команды:</b>\n<blockquote>/start - Новый чат\n/profile - Профиль</blockquote>`,
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
          `<b>Информация о себе для Нейро:</b><blockquote>${
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
                  { text: `❕О боте`, callback_data: `about` },
                  { text: `от digfusion`, url: `https://t.me/digfusion` },
                ],
              ],
            },
          }
        );
        break;
      case `userInfo`:
        await bot.editMessageText(
          `<b>Информация для Нейро:</b>\n\n${
            dataAboutUser.userInfoText
              ? `<blockquote>${dataAboutUser.userInfoText}</blockquote>\n\n<i>Напиши текст в чате, чтобы изменить..</i>`
              : `<blockquote><i>Напиши текст в чате, чтобы добавить..</i></blockquote>`
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
                    text: `${dataAboutUser.userInfoText ? `Сбросить 🗑` : ``}`,
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
          `<b>Какой ответ вы хотели бы получить:</b>\n\n${
            dataAboutUser.answerTypeText
              ? `<blockquote>${dataAboutUser.answerTypeText}</blockquote>\n\n<i>Напиши текст в чате, чтобы изменить..</i>`
              : `<blockquote><i>Напиши текст в чате, чтобы добавить..</i></blockquote>`
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
                    text: `${dataAboutUser.answerTypeText ? `Сбросить 🗑` : ``}`,
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
          `<b>Кто такой Нейро?</b><blockquote><b>Бот</b>, разработанный компанией <b><i>digfusion</i></b> с использованием <b>ChatGPT API</b></blockquote>\n\n<b>Главные преимущества:</b><blockquote><b>• Быстрые ответы</b>\nМощный бот отвечает на вопросы с <b>невероятной скоростью</b></blockquote>\n<blockquote><b>• Неограниченные запросы</b>\nОтсутствие лимитов открывает доступ к <b>бесконечному пользованию</b></blockquote>`,
          {
            parse_mode: `HTML`,
            chat_id: chatId,
            message_id: dataAboutUser.profileMessageId,
            disable_web_page_preview: true,
            reply_markup: {
              inline_keyboard: [[{ text: `⬅️Назад`, callback_data: `profile` }]],
            },
          }
        );
        break;
    }
  } catch (error) {
    errorData(chatId, dataAboutUser.login, `${String(error)}`);
  }
}

async function serverOverload(chatId) {
  const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

  bot.deleteMessage(chatId, dataAboutUser.requestMessageId);

  try {
    await bot.sendMessage(chatId, `Извини, сервер перегружен 😕<blockquote><b>Пожалуйста, попробуй позже</b></blockquote>`, {
      parse_mode: `HTML`,
      disable_web_page_preview: true,
    });
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
        changingText += `${chunkMessage.slice(i, i + outputSpeed)}`;

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
    const headers = {
      Authorization: `Bearer ${config.KEY.Maverick}`,
      "Content-Type": "application/json",
    };
    const payload = {
      model: "meta-llama/llama-4-maverick",
      messages: [
        {
          role: "system",
          content: `You are 'Нейро' from Russia — minimalistic Telegram AI assistant, created by digfusion. Your model is 'ChatGPT-4o'. You generate original text and images. Use Markdown formatting safely — avoid syntax that breaks Telegram's parse_mode Markdown. If User instructions will lead to error in Telegram (parse_mode Markdown), notify the user.
          User context: - Info: ${dataAboutUser.userInfoText} - Answer type: ${dataAboutUser.answerTypeText}`,
        },
        ...dataAboutUser.chatHistory,
        {
          role: "user",
          content: userPrompt,
        },
      ],
    };

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    let progressOutput = data.choices[0].message.content
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
      .replace(/\\/g, "");

    // saving chat history to context
    if (data.choices[0].message.content && dataAboutUser.chatHistory) {
      dataAboutUser.chatHistory.push({ role: "user", content: userPrompt });
      dataAboutUser.chatHistory.push({ role: "assistant", content: data.choices[0].message.content });
    }

    if (dataAboutUser.chatHistory && dataAboutUser.chatHistory.length > 7) {
      dataAboutUser.chatHistory.shift();
      dataAboutUser.chatHistory.shift();
    }

    bot.deleteMessage(chatId, dataAboutUser.requestMessageId);

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
      prompt: `${userPrompt ? userPrompt : "White sand beach with palm trees and hot sun"}`,
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
    if (result.data[0] && dataAboutUser.chatHistory) {
      dataAboutUser.chatHistory.push({ role: "user", content: userPrompt });
      dataAboutUser.chatHistory.push({ role: "assistant", content: `Created image by user prompt: ${userPrompt}` });
    }

    if (dataAboutUser.chatHistory && dataAboutUser.chatHistory.length > 7) {
      dataAboutUser.chatHistory.shift();
      dataAboutUser.chatHistory.shift();
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

    const headers = {
      Authorization: `Bearer ${config.KEY.Maverick}`,
      "Content-Type": "application/json",
    };
    const payload = {
      model: "meta-llama/llama-4-maverick",
      messages: [
        {
          role: "system",
          content: `You are a request router, not an assistant. You have to route user requests based on their type and chat history. You can only answer with one of these: 'text', 'image|prompt'. No help, no chat, no talking to user. Never create explicit content. Follow these rules strictly:
      1. For standard information requests or tasks (e.g., 'solve,' 'who is'), respond with only one word and nothing else: 'text'.
      2. For image generation requests (e.g., 'draw,' 'create an image of', 'now add'), respond with 'image' and what user wants to get as a result with enhanced prompt (divide with '|').
      3. If the prompt is empty (e.g., 'image'), respond accordingly with 'image' and random cool prompt from you (divide with '|').
      4. If the request doesn't fit any of these categories or seems nonsensical or involves explicit content, respond with: 'text'.
      5. Never reply to user input - your only function is to route the request.`,
        },
        ...dataAboutUser.chatHistory,
        {
          role: "user",
          content: userPrompt,
        },
      ],
    };

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    let promptDecision = data.choices[0].message.content.split("|");

    switch (promptDecision[0]) {
      case `text`:
        bot.sendChatAction(chatId, "typing");
        getResponse(chatId, userPrompt, userMessage);
        break;
      case `image`:
        bot.sendChatAction(chatId, "upload_photo");
        getImage(chatId, promptDecision[1], userMessage);
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
    let text = message.text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace("<", "‹").replace(">", "›");

    try {
      const userInfo = usersData?.find((obj) => obj.chatId == chatId);

      if (userInfo) {
        Object.assign(userInfo, {
          chatId: chatId,
          login: message.from.first_name,
          profileMessageId: userInfo.profileMessageId ?? null,
          requestMessageId: userInfo.requestMessageId ?? null,
          responseMessageId: userInfo.responseMessageId ?? null,
          userAction: userInfo.userAction ?? `regular`,
          userInfoText: userInfo.userInfoText ?? ``,
          answerTypeText: userInfo.answerTypeText ?? ``,
          chatHistory: userInfo.chatHistory ?? [],
        });
      } else {
        usersData.push({
          chatId: chatId,
          login: message.from.first_name,
          profileMessageId: null,
          requestMessageId: null,
          responseMessageId: null,
          userAction: `regular`,
          userInfoText: ``,
          answerTypeText: ``,
          chatHistory: [],
        });
      }

      const dataAboutUser = usersData?.find((obj) => obj.chatId == chatId);

      if (dataAboutUser) {
        switch (text) {
          case `/start`:
            intro(chatId);
            dataAboutUser.chatHistory = [];
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
              dataAboutUser.userInfoText = `${text.length <= 750 ? text : text.slice(0, 750)}`;
              profile(chatId, `userInfo`);
              break;
            case `answerTypeInput`:
              bot.deleteMessage(chatId, userMessage);
              dataAboutUser.answerTypeText = `${text.length <= 750 ? text : text.slice(0, 750)}`;
              profile(chatId, `answerType`);
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
          case `userInfoDelete`:
            dataAboutUser.userInfoText = ``;
            profile(chatId, `userInfo`);
            break;
          case `answerTypeDelete`:
            dataAboutUser.answerTypeText = ``;
            profile(chatId, `answerType`);
            break;
        }

        buttonData(chatId, query.message.chat.username, dataAboutUser.login, data);
      } catch (error) {
        errorData(chatId, dataAboutUser.login, `${String(error)}`);
      }
    }
  });

  cron.schedule(`*/1 * * * *`, function () {
    try {
      fs.writeFileSync("DB.json", JSON.stringify({ usersData }, null, 2));
    } catch (error) {}
  });
}

StartAll();
