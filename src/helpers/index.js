const Users = require('../models/Users');

async function changStep(user, step_name) {
  let steps = user.step;
  const lastStep = user.step[user.step.length - 1];

  console.log(lastStep);
}

const checkUser = async (data) => {
  try {
    const chat_id = data.from.id;
    const user = await Users.findOne({ user_id: chat_id });

    console.log(user);

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
};

async function clearStep() {}

module.exports = {
  changStep,
  clearStep,
  checkUser,
};
