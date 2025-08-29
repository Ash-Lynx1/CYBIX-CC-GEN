require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const { checkJoin } = require('./utils/checkJoin');
const { getUserType, canUseCommand, recordCommandUse } = require('./utils/limits');
const { ensureUserExists } = require('./utils/userdb');
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

const commands = {};
fs.readdirSync(path.join(__dirname, 'commands')).forEach(file => {
  if (file.endsWith('.js')) {
    const cmd = require(`./commands/${file}`);
    commands[cmd.name] = cmd;
  }
});

const BANNER_IMG = 'https://files.catbox.moe/die17y.jpg';
const CHANNEL_LINK = 'https://t.me/cybixtech';
const WHATSAPP1 = 'https://whatsapp.com/channel/0029VbB8svo65yD8WDtzwd0X';
const WHATSAPP2 = 'https://whatsapp.com/channel/0029VbAxGAQK5cD8Y03rnv3K';

const menuButtons = [
  [{ text: 'TELEGRAM CHANNEL', url: CHANNEL_LINK }],
  [{ text: 'WA CHANNEL-1', url: WHATSAPP1 }, { text: 'WA CHANNEL-2', url: WHATSAPP2 }],
  [{ text: 'Menu', callback_data: 'menu' }]
];

async function sendMenu(chatId) {
  await bot.sendPhoto(chatId, BANNER_IMG, {
    caption: commands.menu.getMenu(),
    reply_markup: { inline_keyboard: menuButtons }
  });
}

bot.onText(/^\/(gen|getprem|addprem|add\-vip|users|menu)(.*)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userType = getUserType(userId);
  ensureUserExists(userId);
  
  // Owner commands
  if ((match[1] === 'addprem' || match[1] === 'add-vip') && userId.toString() !== process.env.OWNER_ID) {
    await bot.sendPhoto(chatId, BANNER_IMG, {
      caption: '❌ Only the bot owner can use this command.',
      reply_markup: { inline_keyboard: menuButtons }
    });
    return;
  }
  
  // Make sure user joined the channel
  if (!(await checkJoin(bot, userId, process.env.CHANNEL_USERNAME)) && userId.toString() !== process.env.OWNER_ID) {
    await bot.sendPhoto(chatId, BANNER_IMG, {
      caption: '🚨 Please join our channel to use the bot!',
      reply_markup: { inline_keyboard: menuButtons }
    });
    return;
  }
  
  // Rate limit check
  if (!canUseCommand(userId, userType, match[1]) && userType !== 'vvip') {
    await bot.sendPhoto(chatId, BANNER_IMG, {
      caption: '⏳ You have reached your hourly limit. Upgrade to Premium or VVIP for more access.',
      reply_markup: { inline_keyboard: menuButtons }
    });
    return;
  }
  recordCommandUse(userId, match[1]);
  
  // Run command
  await commands[match[1]].run(bot, msg, match[2].trim(), { menuButtons, BANNER_IMG });
});

bot.on('callback_query', async query => {
  if (query.data === 'menu') {
    await sendMenu(query.message.chat.id);
  }
});

bot.onText(/\/start/, async msg => {
  await sendMenu(msg.chat.id);
});