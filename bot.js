require('dotenv').config();
const { default: mongoose } = require('mongoose');
const Users = require('./src/models/Users.js');
const TelegramBot = require('node-telegram-bot-api');
const { changStep, checkUser } = require('./src/helpers/index.js');

const TOKEN = process.env.BOT_TOKEN;
const bot = new TelegramBot(TOKEN, { polling: true });

async function mongoConnect() {
  try {
    mongoose.connect(process.env.DB_URL);
  } catch (error) {
    console.log('DB ERROR', error);
  }
}
mongoConnect();

bot.on('text', async (msg) => {
  const text = msg.text;
  const chat_id = msg.from.id;
  const user = await checkUser(msg);
  const steep = user?.steep || [];

  if (text == '/start') {
    changStep(user);
  }
});
