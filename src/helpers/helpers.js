const Users = require('../models/Users');
const axios = require('axios');
const { menu } = require('../keyboards/keyboards');
require('dotenv').config();

const api = process.env.API_BASE_URL;

async function changStep(user, step_name) {
  try {
    let steps = user.step;
    const lastStep = user.step[user.step.length - 1];

    if (lastStep != step_name) steps.push(step_name);
    else return;

    const updatedUser = await Users.findOneAndUpdate(
      { user_id: user.user_id },
      { step: steps },
      { new: true },
    );

    // console.log('changStep', updatedUser);
  } catch (error) {
    console.log(error);
  }
}

async function clearStep() {}

async function checkUser(data) {
  try {
    const chat_id = data.from.id;
    const user = await Users.findOne({ user_id: chat_id });

    if (user) {
      return user;
    } else {
      let user = await Users.create({ user_id: chat_id, step: 'home' });

      return user;
    }
  } catch (error) {
    console.log(error);
  }
}

async function changeRegion(user, region) {
  try {
    await Users.findOneAndUpdate({ user_id: user.user_id }, { region });
  } catch (error) {
    console.log(error);
  }
}

async function changeReminderTime(user, time) {
  try {
    await Users.findOneAndUpdate(
      { user_id: user.user_id },
      { remind_time: +time },
    );
  } catch (error) {
    console.log(error);
  }
}

async function sendPrayTimes(bot, msg, user) {
  try {
    const chat_id = msg.from.id;
    const res = await axios.get(api + 'Toshkent');
    const data = res.data;
    console.log(data);
    bot.sendMessage(chat_id, makeText(data), {
      reply_markup: menu,
      parse_mode: 'Html',
    });
  } catch (error) {
    console.log(error);
  }
}

function makeText(data) {
  const date = new Date();
  const months = [
    'yanvar',
    'fevral',
    'mart',
    'aprel',
    'may',
    'iyun',
    'iyul',
    'avgust',
    'sentabr',
    'oktabr',
    'noyabr',
    'dekabr',
  ];

  return `<b>
📍 ${data.region}

🗓 Sana: ${data.weekday} ${date.getDate()}-${
    months[date.getMonth()]
  } ${date.getFullYear()}-yil

🌆 Bomdod: ${data.times.tong_saharlik}
🌅 Quyosh: ${data.times.quyosh}
🏙 Peshin: ${data.times.peshin}
🌁 Asr: ${data.times.asr}
🌄 Shom: ${data.times.shom_iftor}
🌃 Xufton: ${data.times.hufton}

🌅 Saharlik: ${data.times.tong_saharlik}
🌄 Iftorlik: ${data.times.shom_iftor}
  </b>`;
}

function toCapitalize(str) {
  return str[0].toUpperCase() + str.slice(1);
}

module.exports = {
  changStep,
  clearStep,
  checkUser,
  changeRegion,
  toCapitalize,
  changeReminderTime,
  sendPrayTimes,
};
