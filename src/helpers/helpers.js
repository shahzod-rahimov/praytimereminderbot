const Users = require('../models/Users');
const axios = require('axios');
const { menu } = require('../keyboards/keyboards');
require('dotenv').config();

const api = process.env.API_BASE_URL;

async function changStep(user, step_name) {
  try {
    let steps = user.step;
    const lastStep = user.step[user.step.length - 1];

    if (step_name == 'home') {
      steps = ['home'];
    } else if (lastStep != step_name) steps.push(step_name);
    else return;

    const updatedUser = await Users.findOneAndUpdate(
      { user_id: user.user_id },
      { step: steps },
      { new: true },
    );
  } catch (error) {
    console.log(error);
  }
}

async function clearStep() {}

async function checkUser(data) {
  try {
    const chat_id = data.from.id;
    const name = data.from.first_name;
    const user = await Users.findOne({ user_id: chat_id });

    if (user) {
      return user;
    } else {
      let user = await Users.create({
        user_id: chat_id,
        step: 'home',
        name,
      });

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

    if (user.region) {
      const res = await axios.get(api + user.region);
      const data = res.data;
      bot.sendMessage(chat_id, makeText(data), {
        reply_markup: menu,
        parse_mode: 'Html',
      });
    } else {
      bot.sendMessage(chat_id, 'Iltimos avval shahringizni kiriting!', {
        reply_markup: inlineRegionsSettings,
      });
    }
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

async function sendPrayTimeOnTime(bot) {
  try {
    const users = await Users.find({});
    const date = new Date();

    users.forEach(async (user) => {
      if (user.region) {
        const res = await axios.get(api + user.region);
        const data = res.data;
        const prayTimes = res.data.times;
        const bomdod = new Date(`${data.date}/${prayTimes.tong_saharlik}`);
        const quyosh = new Date(`${data.date}/${prayTimes.quyosh}`);
        const peshin = new Date(`${data.date}/${prayTimes.peshin}`);
        const asr = new Date(`${data.date}/${prayTimes.asr}`);
        const shom = new Date(`${data.date}/${prayTimes.shom_iftor}`);
        const hufton = new Date(`${data.date}/${prayTimes.hufton}`);

        if (
          bomdod.getHours() == date.getHours() &&
          bomdod.getMinutes() == date.getMinutes()
        ) {
          bot.sendMessage(
            user.user_id,
            `<b>🌆 Bomdod ${prayTimes.tong_saharlik} da kirdi</b>`,
            { parse_mode: 'Html' },
          );
          console.log('bomdod', date.toTimeString());
        } else if (
          quyosh.getHours() == date.getHours() &&
          quyosh.getMinutes() == date.getMinutes()
        ) {
          bot.sendMessage(
            user.user_id,
            `<b>🌅 Bomdod ${prayTimes.quyosh} da chiqdi</b>`,
            { parse_mode: 'Html' },
          );
        } else if (
          peshin.getHours() == date.getHours() &&
          peshin.getMinutes() == date.getMinutes()
        ) {
          bot.sendMessage(
            user.user_id,
            `<b>🏙 Peshin ${prayTimes.peshin} da kirdi</b>`,
            { parse_mode: 'Html' },
          );
        } else if (
          asr.getHours() == date.getHours() &&
          asr.getMinutes() == date.getMinutes()
        ) {
          bot.sendMessage(
            user.user_id,
            `<b>🌁 Asr ${prayTimes.asr} da kirdi</b>`,
            {
              parse_mode: 'Html',
            },
          );
        } else if (
          shom.getHours() == date.getHours() &&
          shom.getMinutes() == date.getMinutes()
        ) {
          bot.sendMessage(
            user.user_id,
            `<b>🌄 Shom ${prayTimes.shom_iftor} da kirdi</b>`,
            { parse_mode: 'Html' },
          );
        } else if (
          hufton.getHours() == date.getHours() &&
          hufton.getMinutes() == date.getMinutes()
        ) {
          bot.sendMessage(
            user.user_id,
            `<b>🌃 Hufton ${prayTimes.hufton} da kirdi</b>`,
            {
              parse_mode: 'Html',
            },
          );
        }
      }
    });
  } catch (error) {
    console.log(error);
  }
}

async function getUser(user_id, bot) {
  const user = await Users.findOne({ user_id });

  bot.sendMessage(
    user_id,
    `👤 Ismi: ${user.name}\n\n🌏 Shahar: ${user.region}\n\n🕔 Eslatma vaqti: ${user.remind_time} daqiqa oldin.`,
  );
}

module.exports = {
  changStep,
  clearStep,
  checkUser,
  changeRegion,
  toCapitalize,
  changeReminderTime,
  sendPrayTimes,
  sendPrayTimeOnTime,
  getUser,
};
