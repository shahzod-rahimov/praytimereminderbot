const inlineRegions = {
  inline_keyboard: [
    [
      { text: 'Andijon', callback_data: 'region-andijon' },
      { text: 'Buxoro', callback_data: 'region-buxoro' },
    ],
    [
      { text: 'Denov', callback_data: 'region-denov' },
      { text: 'Guliston', callback_data: 'region-guliston' },
    ],
    [
      { text: 'Jizzax', callback_data: 'region-jizzax' },
      { text: 'Namangan', callback_data: 'region-namangan' },
    ],
    [
      { text: 'Navoiy', callback_data: 'region-navoiy' },
      { text: 'Nukus', callback_data: 'region-nukus' },
    ],
    [
      { text: 'Qarshi', callback_data: 'region-qarshi' },
      { text: "Qo'qon", callback_data: "region-qo'qon" },
    ],
    [
      { text: 'Samarqand', callback_data: 'region-samarqand' },
      { text: 'Toshkent', callback_data: 'region-toshkent' },
    ],
    [{ text: 'Xiva', callback_data: 'region_xiva' }],
  ],
};

const inlineTimes = {
  inline_keyboard: [
    [{ text: "O'z vaqtida", callback_data: 'before-0' }],
    [
      { text: '5 daqiqa', callback_data: 'before-5' },
      { text: '10 daqiqa', callback_data: 'before-10' },
    ],
    [
      { text: '15 daqiqa', callback_data: 'before-15' },
      { text: '20 daqiqa', callback_data: 'before-20' },
    ],
    [{ text: '⬅️ Ortga', callback_data: 'back' }],
  ],
};

module.exports = { inlineRegions, inlineTimes };
