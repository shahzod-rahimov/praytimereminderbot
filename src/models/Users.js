const { Schema, model } = require('mongoose');

const usersShema = new Schema(
  {
    user_id: { type: Number },
    name: { type: String },
    region: { type: String },
    step: { type: Array },
    is_admin: { type: Boolean, default: false },
  },
  { versionKey: false, timestamps: true },
);

module.exports = model('Users', usersShema);
