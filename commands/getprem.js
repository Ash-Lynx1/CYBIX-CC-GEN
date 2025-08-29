const { getUserType } = require('../utils/limits');

module.exports = {
  name: 'getprem',
  run: async (bot, msg, args, { menuButtons, BANNER_IMG }) => {
    const userType = getUserType(msg.from.id);
    let reply = 'You are currently a ';
    if (userType === 'regular') reply += 'Regular user.';
    else if (userType === 'premium') reply += 'Premium user!';
    else if (userType === 'vvip') reply += 'VVIP user! 🎉';
    await bot.sendPhoto(msg.chat.id, BANNER_IMG, {
      caption: reply,
      reply_markup: { inline_keyboard: menuButtons }
    });
  }
};