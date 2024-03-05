const TelegramBot = require('node-telegram-bot-api');

const token = '7189928044:AAH7kW0JhBCwRmExbudIrgx8wKr3sDojPtc';

const bot = new TelegramBot(token, {polling: true});

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const resp = match[1];
  bot.sendMessage(chatId, resp);
});

bot.on('message', (msg) => {
    console.log('PESAN:',msg)
    const chatId = msg.chat.id;

    if(msg.text == '.button'){
        const messageText = 'Welcome to the bot!';
        const inlineKeyboard = {
            inline_keyboard: [
              [{ text: 'Button 1', callback_data: 'button1' }],
              [{ text: 'Button 2', callback_data: 'button2' }],
              [{ text: 'Button 3', callback_data: 'button3' }],
            ],
          };

        bot.sendMessage(chatId, messageText, { reply_markup: inlineKeyboard });
    }

    bot.sendMessage(chatId, msg.text);
});

console.log('Bot running...');