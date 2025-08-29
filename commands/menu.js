module.exports = {
  name: 'menu',
  getMenu: () => (
    `•••••••【𝐂𝐘𝐁𝐈𝐗 𝐂𝐂 】•••••••
» Users: /users
» Prefix: /
» Plugins: 6
» Status: Online
» Runtime: Node.js

➪ /gen
➪ /getprem
➪ /addprem <user id>
➪ /add-vip <user id>
➪ /users

Join the Telegram and WhatsApp channels for more updates!`
  ),
  run: async (bot, msg, args, { menuButtons, BANNER_IMG }) => {
    await bot.sendPhoto(msg.chat.id, BANNER_IMG, {
      caption: module.exports.getMenu(),
      reply_markup: { inline_keyboard: menuButtons }
    });
  }
};