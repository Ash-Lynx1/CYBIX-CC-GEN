const config = require("../config");

module.exports = (bot) => {
  bot.command("add-vip", (ctx) => {
    const ownerId = parseInt(config.OWNER_ID);
    const userId = ctx.from.id;
    
    if (userId !== ownerId) {
      return ctx.reply("🚫 Only the bot owner can add VVIP users.");
    }
    
    const parts = ctx.message.text.split(" ");
    if (parts.length < 2) {
      return ctx.reply("❌ Usage: /add-vip <user_id>");
    }
    
    const targetId = parseInt(parts[1]);
    config.addVvip(targetId);
    
    ctx.reply(`🔥 User ${targetId} is now *VVIP*! Unlimited requests granted.`);
  });
};