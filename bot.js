require('dotenv').config();
const { default: mongoose } = require('mongoose');
const TelegramBot = require('node-telegram-bot-api');
const {
  changStep,
  checkUser,
  changeRegion,
  toCapitalize,
  changeReminderTime,
  sendPrayTimes,
  sendPrayTimeOnTime,
  getUser,
} = require('./src/helpers/helpers.js');
const {
  inlineRegions,
  inlineTimes,
  settingsMenu,
  menu,
  inlineTimesWithoutBack,
  inlineRegionsSettings,
} = require('./src/keyboards/keyboards.js');

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

setInterval(() => {
  sendPrayTimeOnTime(bot);
}, 60000);

bot.on('text', async (msg) => {
  try {
    const text = msg.text;
    const chat_id = msg.from.id;
    const user = await checkUser(msg);
    const steps = user.step;
    const last_step = steps[steps.length - 1];

    if (text == '/start' && user.region) {
      sendPrayTimes(bot, msg, user);
    } else if (text == '/start') {
      changStep(user, 'home');

      await bot.sendMessage(
        chat_id,
        '*👋 Assalomu alaykum namoz vaqtlarini eslatuvchi botga hush kelibsiz\\.*\n\n_Iltimos yashash hududingzni tanlang\\!_',
        {
          parse_mode: 'MarkdownV2',
          reply_markup: inlineRegions,
        },
      );
    } else if (text == '⚙️ Sozlamalar') {
      changStep(user, 'setting');
      bot.sendMessage(chat_id, 'Sozlamalar', { reply_markup: settingsMenu });
    } else if (text == "🌏 Shaharni o'zgartirish") {
      bot.sendMessage(chat_id, 'Hududingizni tanlang!', {
        reply_markup: inlineRegionsSettings,
      });
    } else if (text == "🕔 Eslatma vaqtini o'zgartirish") {
      bot.sendMessage(chat_id, "Eslatma vaqtini o'zgartirish", {
        reply_markup: inlineTimesWithoutBack,
      });
    } else if (text == '⬅️ Ortga' && last_step == 'setting') {
      changStep(user, 'home');
      bot.sendMessage(chat_id, 'Assosiy menyu', { reply_markup: menu });
    } else if (text == '🕔 Namoz vaqtlari') {
      sendPrayTimes(bot, msg, user);
    } else if (text == '👤 Profilim') {
      getUser(chat_id, bot);
    }
  } catch (error) {
    console.log(error);
  }
});

bot.on('callback_query', async (msg) => {
  try {
    const data = msg.data;
    const chat_id = msg.from.id;
    const msgId = msg?.message?.message_id;
    const user = await checkUser(msg);
    const steps = user.step;
    const last_step = steps[steps.length - 1];

    if (data == 'back') {
      bot.editMessageText('Iltimos yashash hududingzni tanlang', {
        chat_id,
        message_id: msgId,
        reply_markup: inlineRegions,
      });
    } else if (data.split('-')[0] == 'region' && last_step == 'setting') {
      changStep(user, 'home');

      changeRegion(user, toCapitalize(data.split('-')[1]));

      bot.deleteMessage(chat_id, msgId);
      bot.sendMessage(chat_id, "✅ Shahar muvaffaqiyatli o'zgartirildi!", {
        reply_markup: menu,
      });
    } else if (data.split('-')[0] == 'before' && last_step == 'setting') {
      changeReminderTime(user, data.split('-')[1]);

      bot.deleteMessage(chat_id, msgId);

      bot.sendMessage(
        chat_id,
        "✅ Eslatma vaqti muvaffaqiyatli o'zgartirildi!",
        {
          reply_markup: menu,
        },
      );
    } else if (data.split('-')[0] == 'region') {
      changStep(user, 'home');

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

      bot.deleteMessage(chat_id, msgId);

      sendPrayTimes(bot, msg, user);
    } else if (data == 'cancel') {
      bot.deleteMessage(chat_id, msgId);
      bot.sendMessage(chat_id, 'Bekor qilindi', { reply_markup: menu });
    }
  } catch (error) {
    console.log(error);
  }
});
