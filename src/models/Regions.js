const { Schema, model } = require('mongoose');

const regionsShema = new Schema(
  {
    region_name: { type: String },
    tong_saharlik: { type: String },
    quyosh: { type: String },
    peshin: { type: String },
    asr: { type: String },
    shom_iftor: { type: String },
    hufton: { type: String },
  },
  { versionKey: false },
);

module.exports = model('regions', regionsShema);
