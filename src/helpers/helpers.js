const Users = require('../models/Users');

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
      let user = await Users.create({ user_id: chat_id, step: ['home'] });

      return user;
    }
  } catch (error) {
    console.log(error);
    return 0;
  }
}

async function changeRegion(user, region) {
  await Users.findOneAndUpdate({ user_id: user.user_id }, { region });
}

async function changeReminderTime(user, time) {
  await Users.findOneAndUpdate(
    { user_id: user.user_id },
    { remind_time: +time },
  );
}

async function sendPrayTimes(){
  
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
};
