const { setPremium } = require('../utils/userdb');

module.exports = {
  name: 'addprem',
  run: async (bot, msg, args, { menuButtons, BANNER_IMG }) => {
    const userId = args.split(' ')[0];
    if (!userId) {
      await bot.sendPhoto(msg.chat.id, BANNER_IMG, {
        caption: '❌ Usage: /addprem <user id>',
        reply_markup: { inline_keyboard: menuButtons }
      });
      return;
    }
    setPremium(userId, 'premium');
    await bot.sendPhoto(msg.chat.id, BANNER_IMG, {
      caption: `✅ User ${userId} is now Premium!`,
      reply_markup: { inline_keyboard: menuButtons }
    });
  }
};