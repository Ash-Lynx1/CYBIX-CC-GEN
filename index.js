require('dotenv').config();
const { Telegraf } = require('telegraf');
const express = require('express');

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

const PORT = process.env.PORT || 3000;

// ✅ Middlewares
app.use(express.json());

// ✅ Bot commands (example, adjust as needed)
bot.start((ctx) => {
  ctx.reply(`👋 Welcome ${ctx.from.first_name}! Use /menu to see options.`);
});

bot.command('menu', (ctx) => {
  ctx.reply(`📌 Menu
- /gen Generates CC
- /getprem Premium Status
- /users Bot Users
- /status Bot Status`);
});

// ✅ Handle webhook updates
app.post(`/webhook/${process.env.BOT_TOKEN}`, (req, res) => {
  bot.handleUpdate(req.body);
  res.sendStatus(200);
});

// ✅ Launch webhook
(async () => {
  try {
    const webhookUrl = `${process.env.RENDER_EXTERNAL_URL}/webhook/${process.env.BOT_TOKEN}`;
    await bot.telegram.setWebhook(webhookUrl);
    console.log(`🚀 Bot started in Webhook mode at: ${webhookUrl}`);
    
    app.listen(PORT, () => {
      console.log(`🌍 Express server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Error starting bot:", err);
  }
})();