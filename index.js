require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");
const axios = require("axios");

// ===== BOT CONFIG =====
const BOT_OWNER_ID = 6524840104;
const CHANNEL_LINK = "https://t.me/cybixtech";
const WHATSAPP1 = "https://whatsapp.com/channel/0029VbB8svo65yD8WDtzwd0X";
const WHATSAPP2 = "https://whatsapp.com/channel/0029VbAxGAQK5cD8Y03rnv3K";
const OWNER_CONTACT = "https://t.me/cybixdev";
const BANNER = "https://i.imgur.com/8TSnkdN.jpeg";

// ===== STATE STORAGE =====
let users = new Set();
let premiumUsers = new Set();
let vvipUsers = new Set();
let userRequests = {}; // track request counts
const startTime = Date.now();

// ===== INIT BOT =====
const bot = new Telegraf(process.env.BOT_TOKEN);

// ===== Middleware to track users =====
bot.use((ctx, next) => {
  if (ctx.from && ctx.from.id) {
    users.add(ctx.from.id);
  }
  return next();
});

// ===== Helper Functions =====
function formatRuntime(ms) {
  let seconds = Math.floor(ms / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  let days = Math.floor(hours / 24);
  seconds %= 60;
  minutes %= 60;
  hours %= 24;
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function buttons() {
  return Markup.inlineKeyboard([
    [Markup.button.url("📢 Join Telegram Channel", CHANNEL_LINK)],
    [Markup.button.url("📱 WhatsApp Channel 1", WHATSAPP1)],
    [Markup.button.url("📱 WhatsApp Channel 2", WHATSAPP2)],
    [Markup.button.url("👑 Bot Owner", OWNER_CONTACT)]
  ]);
}

// ===== COMMANDS =====

// /menu
bot.command("menu", async (ctx) => {
  const uptime = formatRuntime(Date.now() - startTime);
  
  // Ping check
  const pingStart = Date.now();
  await axios.get("https://apis.davidcyriltech.my.id/tools/ccgen?type=MasterCard&amount=1").catch(() => {});
  const ping = Date.now() - pingStart;
  
  const message = `
🖤 •••••••【 *CYBIX CC MENU* 】••••••• 🖤

📊 *Users:* ${users.size}
⚡ *Prefix:* /
📂 *Plugins:* gen, getprem, addprem, add-vip, users, menu
📡 *Status:* ✅ Online
📶 *Ping:* ${ping} ms
⏳ *Runtime:* ${uptime}

━━━━━━━━━━━━━━
Available Commands:
/gen - Generate CC
/getprem - Check Premium
/addprem <id> - Add Premium (Owner)
/add-vip <id> - Add VVIP (Owner)
/users - Show Total Users
/menu - Show Menu
━━━━━━━━━━━━━━
`;
  
  await ctx.replyWithPhoto({ url: BANNER }, { caption: message, parse_mode: "Markdown", ...buttons() });
});

// /users
bot.command("users", async (ctx) => {
  const msg = `👥 *Total Registered Users:* ${users.size}`;
  await ctx.replyWithMarkdown(msg, buttons());
});

// /gen
bot.command("gen", async (ctx) => {
  const userId = ctx.from.id;
  
  // Limit Handling
  if (!premiumUsers.has(userId) && !vvipUsers.has(userId)) {
    userRequests[userId] = userRequests[userId] || { count: 0, time: Date.now() };
    let data = userRequests[userId];
    
    // Reset after 1h
    if (Date.now() - data.time > 3600000) {
      data.count = 0;
      data.time = Date.now();
    }
    
    if (data.count >= 3) {
      return ctx.reply("⚠️ You reached the hourly limit (3). Upgrade to Premium or VVIP.");
    }
    
    data.count++;
  } else if (premiumUsers.has(userId)) {
    userRequests[userId] = userRequests[userId] || { count: 0, time: Date.now() };
    let data = userRequests[userId];
    if (Date.now() - data.time > 3600000) {
      data.count = 0;
      data.time = Date.now();
    }
    if (data.count >= 30) {
      return ctx.reply("⚠️ Premium users are limited to 30 requests/hour.");
    }
    data.count++;
  }
  
  try {
    const res = await axios.get("https://apis.davidcyriltech.my.id/tools/ccgen?type=MasterCard&amount=5");
    const cards = res.data.data.map(c => `${c.ccnum}|${c.month}|${c.year}|${c.cvv}`).join("\n");
    
    await ctx.replyWithMarkdown(`💳 *Generated Cards:*\n\`\`\`\n${cards}\n\`\`\``, buttons());
  } catch (err) {
    await ctx.reply("❌ Failed to fetch from API. Try again later.");
  }
});

// /getprem
bot.command("getprem", async (ctx) => {
  const userId = ctx.from.id;
  
  if (premiumUsers.has(userId)) {
    return ctx.reply("🌟 You are a *Premium User*", { parse_mode: "Markdown", ...buttons() });
  } else if (vvipUsers.has(userId)) {
    return ctx.reply("💎 You are a *VVIP User*", { parse_mode: "Markdown", ...buttons() });
  } else {
    return ctx.reply("❌ You are *not premium*. Contact the bot owner to upgrade.", {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.url("👑 Contact Owner", OWNER_CONTACT)]
      ])
    });
  }
});

// /addprem
bot.command("addprem", async (ctx) => {
  const userId = ctx.from.id;
  if (userId !== BOT_OWNER_ID) return ctx.reply("⛔ Only the bot owner can use this command.");
  
  const args = ctx.message.text.split(" ");
  const targetId = args[1];
  if (!targetId) return ctx.reply("⚠️ Usage: /addprem <user_id>");
  
  premiumUsers.add(Number(targetId));
  ctx.reply(`✅ User ${targetId} has been added as *Premium*.`, { parse_mode: "Markdown" });
});

// /add-vip
bot.command("add-vip", async (ctx) => {
  const userId = ctx.from.id;
  if (userId !== BOT_OWNER_ID) return ctx.reply("⛔ Only the bot owner can use this command.");
  
  const args = ctx.message.text.split(" ");
  const targetId = args[1];
  if (!targetId) return ctx.reply("⚠️ Usage: /add-vip <user_id>");
  
  vvipUsers.add(Number(targetId));
  ctx.reply(`💎 User ${targetId} has been added as *VVIP*.`, { parse_mode: "Markdown" });
});

// ===== START BOT =====
bot.launch();
console.log("🚀 CYBIX CC Bot is running...");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));