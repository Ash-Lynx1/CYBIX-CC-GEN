const config = require("../config");

module.exports = (bot) => {
  bot.command("users", (ctx) => {
    const users = config.getAllUsers();
    if (users.length === 0) {
      return ctx.reply("📭 No users found yet.");
    }
    
    let msg = "👥 *CYBIX Bot Users*\n\n";
    users.forEach((u, i) => {
      msg += `${i + 1}. ID: ${u.id} | Type: ${u.type}\n`;
    });
    
    ctx.replyWithPhoto(config.BANNER_IMG, {
      caption: msg,
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: config.menuButtons },
    });
  });
};