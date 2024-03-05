const TelegramBot = require('node-telegram-bot-api');
const token = '7189928044:AAH7kW0JhBCwRmExbudIrgx8wKr3sDojPtc';
const bot = new TelegramBot(token, {polling: true});

const sendMsg = (chatId, msg) => {
  bot.sendMessage(chatId, msg);
}

module.exports = {
  sendMsg
}