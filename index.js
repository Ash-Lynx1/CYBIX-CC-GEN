require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');

// Initialize the bot with polling
const bot = new TelegramBot(config.TOKEN, { polling: true });

// Import all the command files
const genCc = require('./commands/gen-cc');
const getPrem = require('./commands/getprem');
const addPrem = require('./commands/addprem');
const addVip = require('./commands/add-vip');
const users = require('./commands/users');
const menu = require('./commands/menu');

// Command to show the main menu
menu(bot);

// Command to generate credit cards
genCc(bot);

// Command to get premium status
getPrem(bot);

// Command to add premium users (only for the owner)
addPrem(bot);

// Command to add VIP users (only for the owner)
addVip(bot);

// Command to list all users (only for the owner)
users(bot);

// Log when bot is up and running
bot.on('polling_error', (error) => {
  console.log(`Polling error: ${error.message}`);
});

console.log('CYBIX CC Bot is running...');