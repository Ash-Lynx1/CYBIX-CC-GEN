const axios = require('axios');

module.exports = {
  name: 'gen',
  run: async (bot, msg, args, { menuButtons, BANNER_IMG }) => {
    try {
      const res = await axios.get('https://apis.davidcyriltech.my.id/tools/ccgen?type=MasterCard&amount=5');
      const data = res.data?.result?.join('\n') || 'No CC generated.';
      await bot.sendPhoto(msg.chat.id, BANNER_IMG, {
        caption: `•••••••【𝐂𝐘𝐁𝐈𝐗 𝐂𝐂 】•••••••\n\n${data}`,
        reply_markup: { inline_keyboard: menuButtons }
      });
    } catch (e) {
      await bot.sendPhoto(msg.chat.id, BANNER_IMG, {
        caption: '❌ Failed to generate cards. Try again later.',
        reply_markup: { inline_keyboard: menuButtons }
      });
    }
  }
};