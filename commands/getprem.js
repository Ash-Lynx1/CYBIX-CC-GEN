const config = require("../config");

module.exports = (bot) => {
  bot.command("getprem", (ctx) => {
    const userId = ctx.from.id;
    const userType = config.getUserType(userId);
    
    if (userType === "premium" || userType === "vvip") {
      return ctx.reply("✅ You already have premium access!");
    }
    
    ctx.replyWithPhoto(config.BANNER_IMG, {
      caption: "🚀 You are currently a *regular user*.\n\nUpgrade to Premium or VVIP by contacting the owner.",
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "👑 Contact Owner", url: "https://t.me/cybixdev" }],
          ...config.menuButtons,
        ],
      },
    });
  });
};