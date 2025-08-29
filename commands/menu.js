const sendMessageWithButtons = require("../helpers/sendMessageWithButtons");
const config = require("../config");

// track start time
const startTime = Date.now();

// plugins list (we can count commands here manually or dynamically)
const plugins = ["gen", "getprem", "addprem", "add-vip", "users", "menu"];

module.exports = (bot, userStore) => {
  bot.command("menu", async (ctx) => {
    try {
      const userId = ctx.from.id;
      userStore.addUser(userId); // track unique users
      
      // runtime calculation
      const uptime = Date.now() - startTime;
      const seconds = Math.floor((uptime / 1000) % 60);
      const minutes = Math.floor((uptime / (1000 * 60)) % 60);
      const hours = Math.floor((uptime / (1000 * 60 * 60)) % 24);
      const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
      const runtime = `${days}d ${hours}h ${minutes}m ${seconds}s`;
      
      // fake ping = time taken to reply
      const before = Date.now();
      await ctx.reply("⏳ Checking bot status...");
      const ping = Date.now() - before;
      
      const caption = `
•••••••【 *CYBIX CC* 】•••••••
» Users: *${userStore.count()}*
» Prefix: \`/\`
» Plugins: *${plugins.length}*
» Status: *${ping}ms*
» Runtime: *${runtime}*

➪ /gen  
➪ /getprem  
➪ /addprem <user id>  
➪ /add-vip <user id>  
➪ /users  
➪ /menu
`;
      
      await sendMessageWithButtons(ctx, config.BANNER_IMG, caption, [
        [{ text: "📢 Join Channel", url: "https://t.me/cybixtech" }],
        [
          { text: "💬 WhatsApp 1", url: "https://whatsapp.com/channel/0029VbB8svo65yD8WDtzwd0X" },
        ],
        [
          { text: "💬 WhatsApp 2", url: "https://whatsapp.com/channel/0029VbAxGAQK5cD8Y03rnv3K" },
        ],
        [{ text: "👑 Owner", url: "https://t.me/cybixdev" }],
      ]);
    } catch (err) {
      console.error("Menu error:", err.message);
      ctx.reply("⚠️ Error loading menu.");
    }
  });
};