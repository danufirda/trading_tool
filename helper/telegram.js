const TelegramBot = require('node-telegram-bot-api');
const token = '7189928044:AAH7kW0JhBCwRmExbudIrgx8wKr3sDojPtc';
const bot = new TelegramBot(token, {polling: true});
const { bulan_ini, formatRibu } = require('./function');
const { DateTime } = require('luxon');
const fs = require('fs');

const sendMsg = (chatId, msg) => {
  bot.sendMessage(chatId, msg);
}

bot.on('message', (msg) => {
  if(msg.text.toLowerCase()=='menu'){
    const messageText = `Halo ${msg.from.first_name} Silahkan pilih!`;
    const inlineKeyboard = {
        inline_keyboard: [
          [{ text: 'Report Aset Bulan', callback_data: 'report_bulan' }],
          [{ text: 'Button 2', callback_data: 'button2' }],
        ],
    };
    bot.sendMessage(msg.from.id, messageText, { reply_markup: inlineKeyboard });
  }
});

bot.on('callback_query', function onCallbackQuery(callbackQuery) {
  const action = callbackQuery.data;
  const msg = callbackQuery.message;
  const opts = {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
  };
  let text = '';
  if (action === 'report_bulan') {
    text += 'Echange: INDODAX\n';
    text += 'Akun: DANU FIRDA PERKASA\n';
    text += `Report: Bulan ${bulan_ini()}\n\n`;
    text += '----------------------------------------\n';

    let data_json = JSON.parse(fs.readFileSync(`./json/HISTORI_ASET/${DateTime.now().year}/${bulan_ini()}.json`, 'utf8'));
    for(const [key, value] of Object.entries(data_json)) {
      text += `TGL ${Object.keys(value)} : ${formatRibu(Object.values(value)[0])}\n`;
    }
    text += '----------------------------------------\n';
  }

  bot.editMessageText(text, opts);
});


module.exports = {
  sendMsg
}