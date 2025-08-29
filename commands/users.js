const { getAllUsers } = require('../utils/userdb');

module.exports = {
  name: 'users',
  run: async (bot, msg, args, { menuButtons, BANNER_IMG }) => {
    const users = getAllUsers();
    let out = 'User List:\n';
    Object.entries(users).forEach(([id, data]) => {
      out += `• ${id} - ${data.type}\n`;
    });
    await bot.sendPhoto(msg.chat.id, BANNER_IMG, {
      caption: out,
      reply_markup: { inline_keyboard: menuButtons }
    });
  }
};