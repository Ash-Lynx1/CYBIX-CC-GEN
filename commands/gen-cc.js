const axios = require("axios");
const config = require("../config");

module.exports = (bot) => {
  bot.command("gen", async (ctx) => {
    try {
      const userId = ctx.from.id;
      const userType = config.getUserType(userId);
      
      // Request limits
      if (userType === "regular" && !config.canUseCommand(userId, 3, 3600)) {
        return ctx.reply("⏳ You reached your hourly limit (3). Upgrade to Premium or VVIP.");
      }
      if (userType === "premium" && !config.canUseCommand(userId, 30, 3600)) {
        return ctx.reply("⏳ You reached your hourly limit (30). Upgrade to VVIP.");
      }
      
      const response = await axios.get("https://apis.davidcyriltech.my.id/tools/ccgen?type=MasterCard&amount=5");
      const cards = response.data.data || [];
      
      if (cards.length === 0) {
        return ctx.reply("⚠️ No cards generated. Try again later.");
      }
      
      let msg = `💳 *CYBIX CC Generator*\n\n`;
      cards.forEach((c, i) => {
        msg += `#${i + 1}\n${c.cardNumber} | ${c.expiry} | ${c.cvv}\n\n`;
      });
      
      ctx.replyWithPhoto(config.BANNER_IMG, {
        caption: msg,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: config.menuButtons,
        },
      });
    } catch (err) {
      console.error(err.message);
      ctx.reply("❌ Failed to fetch cards. Try again later.");
    }
  });
};