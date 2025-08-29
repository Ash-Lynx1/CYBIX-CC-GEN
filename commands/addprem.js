const config = require("../config");

module.exports = (bot) => {
  bot.command("addprem", (ctx) => {
    const ownerId = parseInt(config.OWNER_ID);
    const userId = ctx.from.id;
    
    if (userId !== ownerId) {
      return ctx.reply("🚫 Only the bot owner can add premium users.");
    }
    
    const parts = ctx.message.text.split(" ");
    if (parts.length < 2) {
      return ctx.reply("❌ Usage: /addprem <user_id>");
    }
    
    const targetId = parseInt(parts[1]);
    config.addPremium(targetId);
    
    ctx.reply(`✅ User ${targetId} is now *Premium*!`);
  });
};