const { setPremium } = require('../utils/userdb');

module.exports = {
  name: 'add-vip',
  run: async (bot, msg, args, { menuButtons, BANNER_IMG }) => {
    const userId = args.split(' ')[0];
    if (!userId) {
      await bot.sendPhoto(msg.chat.id, BANNER_IMG, {
        caption: '❌ Usage: /add-vip <user id>',
        reply_markup: { inline_keyboard: menuButtons }
      });
      return;
    }
    setPremium(userId, 'vvip');
    await bot.sendPhoto(msg.chat.id, BANNER_IMG, {
      caption: `✅ User ${userId} is now VVIP!`,
      reply_markup: { inline_keyboard: menuButtons }
    });
  }
};