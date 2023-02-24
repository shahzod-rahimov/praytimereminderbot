require('dotenv').config();
const { default: mongoose } = require('mongoose');
const TelegramBot = require('node-telegram-bot-api');
const {
  changStep,
  checkUser,
  changeRegion,
  toCapitalize,
  changeReminderTime,
} = require('./src/helpers/helpers.js');
const { inlineRegions, inlineTimes } = require('./src/keyboards/keyboards.js');

const TOKEN = process.env.BOT_TOKEN;
const bot = new TelegramBot(TOKEN, { polling: true });

async function mongoConnect() {
  try {
    mongoose.connect(process.env.DB_URL);
  } catch (error) {
    console.log(error, 'DB ERROR');
  }
}
mongoConnect();

bot.on('text', async (msg) => {
  const text = msg.text;
  const chat_id = msg.from.id;
  const user = await checkUser(msg);
  const steep = user?.steep || [];

  if (text == '/start') {
    changStep(user, 'home');
    
    await bot.sendMessage(
      chat_id,
      '*👋 Assalomu alaykum namoz vaqtlarini eslatuvchi botga hush kelibsiz\\.*\n\n_Iltimos yashash hududingzni tanlang\\!_',
      {
        parse_mode: 'MarkdownV2',
        reply_markup: inlineRegions,
      },
    );
  }
});

bot.on('callback_query', async (msg) => {
  const data = msg.data;
  const chat_id = msg.from.id;
  const msgId = msg?.message?.message_id;
  const user = await checkUser(msg);

  if (data == 'back') {
    bot.editMessageText('Iltimos yashash hududingzni tanlang', {
      chat_id,
      message_id: msgId,
      reply_markup: inlineRegions,
    });
  } else if (data.split('-')[0] == 'region') {
    changeRegion(user, toCapitalize(data.split('-')[1]));

    bot.editMessageText(
      'Namoz vaqlarini nechi daqiqa oldin eslatishimizni istaysiz?',
      {
        chat_id,
        message_id: msgId,
        reply_markup: inlineTimes,
      },
    );
  } else if (data.split('-')[0] == 'before') {
    changeReminderTime(user, data.split('-')[1]);

    bot.deleteMessage(chat_id, msgId)
    bot.sendMessage(chat_id, 'Bizning botdan foydalanayotganingiz uchun rahmat!')
  }
});
