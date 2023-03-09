const Users = require("../models/Users");
const Regions = require("../models/Regions");
const axios = require("axios");
const { menu, inlineRegionsSettings } = require("../keyboards/keyboards");
const { notifTextBeforeFriday, notifTextOnFriday } = require("../lib");
require("dotenv").config();

const api = process.env.API_BASE_URL;

async function changStep(user, step_name) {
  try {
    let steps = user.step;
    const lastStep = user.step[user.step.length - 1];

    if (step_name == "home") {
      steps = ["home"];
    } else if (lastStep != step_name) steps.push(step_name);
    else return;

    const updatedUser = await Users.findOneAndUpdate(
      { user_id: user.user_id },
      { step: steps },
      { new: true }
    );
  } catch (error) {
    console.log(error);
  }
}

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
        step: "home",
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
      { remind_time: +time }
    );
  } catch (error) {
    console.log(error);
  }
}

async function sendPrayTimes(bot, msg, user) {
  try {
    const chat_id = msg.from.id;

    if (user.region) {
      const data = await Regions.findOne({ region_name: user.region });
      bot.sendMessage(chat_id, makeText(data), {
        reply_markup: menu,
        parse_mode: "Html",
      });
    } else {
      bot.sendMessage(chat_id, "Iltimos avval shahringizni kiriting!", {
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
    "yanvar",
    "fevral",
    "mart",
    "aprel",
    "may",
    "iyun",
    "iyul",
    "avgust",
    "sentabr",
    "oktabr",
    "noyabr",
    "dekabr",
  ];

  const weekdays = [
    "Yakshanba",
    "Dushanba",
    "Seshanba",
    "Chorshanba",
    "Payshanba",
    "Juma",
    "Shanba",
  ];

  return `<b>
📍 ${data.region_name}

🗓 Sana: ${weekdays[date.getDay()]} ${date.getDate()}-${
    months[date.getMonth()]
  } ${date.getFullYear()}-yil

🌆 Bomdod: ${data.tong_saharlik}
🌅 Quyosh: ${data.quyosh}
🏙 Peshin: ${data.peshin}
🌁 Asr: ${data.asr}
🌄 Shom: ${data.shom_iftor}
🌃 Xufton: ${data.hufton}

🌅 Saharlik: ${data.tong_saharlik}
🌄 Iftorlik: ${data.shom_iftor}
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
        const data = await Regions.findOne({ region_name: user.region });

        const bomdod = new Date();
        bomdod.setHours(...data.tong_saharlik.split(":"));
        const quyosh = new Date();
        quyosh.setHours(...data.quyosh.split(":"));
        const peshin = new Date();
        peshin.setHours(...data.peshin.split(":"));
        const asr = new Date();
        asr.setHours(...data.asr.split(":"));
        const shom = new Date();
        shom.setHours(...data.shom_iftor.split(":"));
        const hufton = new Date();
        hufton.setHours(...data.hufton.split(":"));

        if (
          bomdod.getHours() == date.getHours() &&
          bomdod.getMinutes() == date.getMinutes()
        ) {
          bot.sendMessage(
            user.user_id,
            `<b>🌆 Bomdod ${data.tong_saharlik} da kirdi</b>`,
            { parse_mode: "Html" }
          );
        } else if (
          quyosh.getHours() == date.getHours() &&
          quyosh.getMinutes() == date.getMinutes()
        ) {
          bot.sendMessage(
            user.user_id,
            `<b>🌅 Bomdod ${data.quyosh} da chiqdi</b>`,
            { parse_mode: "Html" }
          );
        } else if (
          peshin.getHours() == date.getHours() &&
          peshin.getMinutes() == date.getMinutes()
        ) {
          bot.sendMessage(
            user.user_id,
            `<b>🏙 Peshin ${data.peshin} da kirdi</b>`,
            { parse_mode: "Html" }
          );
        } else if (
          asr.getHours() == date.getHours() &&
          asr.getMinutes() == date.getMinutes()
        ) {
          bot.sendMessage(user.user_id, `<b>🌁 Asr ${data.asr} da kirdi</b>`, {
            parse_mode: "Html",
          });
        } else if (
          shom.getHours() == date.getHours() &&
          shom.getMinutes() == date.getMinutes()
        ) {
          bot.sendMessage(
            user.user_id,
            `<b>🌄 Shom ${data.shom_iftor} da kirdi</b>`,
            { parse_mode: "Html" }
          );
        } else if (
          hufton.getHours() == date.getHours() &&
          hufton.getMinutes() == date.getMinutes()
        ) {
          bot.sendMessage(
            user.user_id,
            `<b>🌃 Xufton ${data.hufton} da kirdi</b>`,
            {
              parse_mode: "Html",
            }
          );
        }
      }
    });
  } catch (error) {
    console.log(error);
  }
}

async function sendPrayTimeOnRemindTime(bot) {
  const users = await Users.find({});
  const date = new Date();

  users.forEach(async (user) => {
    if (user.region) {
      const data = await Regions.findOne({ region_name: user.region });
      const remind_time = user.remind_time;

      const bomdod = new Date();
      bomdod.setHours(...data.tong_saharlik.split(":"));
      bomdod.setMinutes(bomdod.getMinutes() - remind_time);
      const peshin = new Date();
      peshin.setHours(...data.peshin.split(":"));
      peshin.setMinutes(peshin.getMinutes() - remind_time);
      const asr = new Date();
      asr.setHours(...data.asr.split(":"));
      asr.setMinutes(asr.getMinutes() - remind_time);
      const shom = new Date();
      shom.setHours(...data.shom_iftor.split(":"));
      shom.setMinutes(shom.getMinutes() - remind_time);
      const hufton = new Date();
      hufton.setHours(...data.hufton.split(":"));
      hufton.setMinutes(hufton.getMinutes() - remind_time);

      if (remind_time) {
        if (
          bomdod.getHours() == date.getHours() &&
          bomdod.getMinutes() == date.getMinutes()
        ) {
          bot.sendMessage(
            user.user_id,
            `<b>Bomdod kirishiga ${remind_time} daqiqa qoldi</b>`,
            { parse_mode: "Html" }
          );
        } else if (
          peshin.getHours() == date.getHours() &&
          peshin.getMinutes() == date.getMinutes()
        ) {
          bot.sendMessage(
            user.user_id,
            `<b>Peshin kirishiga ${remind_time} daqiqa qoldi</b>`,
            { parse_mode: "Html" }
          );
        } else if (
          asr.getHours() == date.getHours() &&
          asr.getMinutes() == date.getMinutes()
        ) {
          bot.sendMessage(
            user.user_id,
            `<b>Asr kirishiga ${remind_time} daqiqa qoldi</b>`,
            {
              parse_mode: "Html",
            }
          );
        } else if (
          shom.getHours() == date.getHours() &&
          shom.getMinutes() == date.getMinutes()
        ) {
          bot.sendMessage(
            user.user_id,
            `<b>Shom kirishiga ${remind_time} daqiqa qoldi</b>`,
            { parse_mode: "Html" }
          );
        } else if (
          hufton.getHours() == date.getHours() &&
          hufton.getMinutes() == date.getMinutes()
        ) {
          bot.sendMessage(
            user.user_id,
            `<b>Xufton kirishiga ${remind_time} daqiqa qoldi</b>`,
            {
              parse_mode: "Html",
            }
          );
        }
      }
    }
  });
}

async function getUser(user_id, bot) {
  try {
    const user = await Users.findOne({ user_id });

    bot.sendMessage(
      user_id,
      `👤 Ismi: ${user.name}\n\n🌏 Shahar: ${
        user.region
      }\n\n🕔 Eslatma vaqti: ${
        user.remind_time ? user.remind_time + " daqiqa oldin" : "O'z vaqtida"
      }.`
    );
  } catch (error) {
    console.log(error);
  }
}

async function sendNotifBeforeFriday(bot) {
  try {
    const users = await Users.find({});

    users.forEach((user) => {
      bot.sendMessage(user.user_id, notifTextBeforeFriday, {
        parse_mode: "Html",
        disable_web_page_preview: true,
      });
    });
  } catch (error) {
    console.log(error);
  }
}

async function sendNotifOnFriday(bot) {
  try {
    const users = await Users.find({});

    users.forEach((user) => {
      bot.sendPhoto(
        user.user_id,
        "https://i.pinimg.com/originals/dc/fc/f8/dcfcf80f8c85f5369e011a35a0ba37a5.jpg",
        {
          caption: notifTextOnFriday,
          parse_mode: "HTML",
        }
      );
    });
  } catch (error) {
    console.log(error);
  }
}

async function getRegions() {
  try {
    console.log(await Regions.find({}).select("region_name -_id"));
    return Regions.find({}).select("region_name -_id");
  } catch (error) {
    console.log(error);
  }
}

async function updateRegionsPrayTime(arr) {
  try {
    const regions = await arr;

    regions.forEach(async (region) => {
      const res = await axios.get(`${api}${region.region_name}`);
      const prayTimes = res.data.times;

      console.log(region.region_name, prayTimes);

      await Regions.updateOne({ region_name: region.region_name }, prayTimes);
    });
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  changStep,
  checkUser,
  changeRegion,
  toCapitalize,
  changeReminderTime,
  sendPrayTimes,
  sendPrayTimeOnTime,
  getUser,
  sendNotifBeforeFriday,
  sendNotifOnFriday,
  getRegions,
  updateRegionsPrayTime,
  sendPrayTimeOnRemindTime,
};
