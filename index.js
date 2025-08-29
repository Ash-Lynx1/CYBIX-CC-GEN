require('dotenv').config(); // Load environment variables from .env file
const { Telegraf } = require('telegraf'); // Import Telegraf

// Log to verify if the token is loaded correctly
if (!process.env.TOKEN) {
  console.error('Bot token is missing!');
  process.exit(1);
} else {
  console.log('Bot Token Loaded Successfully');
}

const bot = new Telegraf(process.env.TOKEN); // Initialize bot with the token from .env file

const OWNER_ID = process.env.OWNER_ID; // Your bot owner ID, stored in .env
const CHANNEL_ID = process.env.CHANNEL_ID; // Channel username, stored in .env

// Middleware to check if user is a member of the required channel before interacting
bot.use(async (ctx, next) => {
  const userId = ctx.from.id;
  const member = await bot.telegram.getChatMember(CHANNEL_ID, userId);
  
  if (member.status === 'member' || member.status === 'administrator') {
    return next(); // Proceed to the next handler
  } else {
    return ctx.reply(
      'Please join the required channel to use this bot. Click below to join.',
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Join Channel', url: `https://t.me/${CHANNEL_ID}` }],
          ],
        },
      }
    );
  }
});

// Command for '/start' to check bot status
bot.start((ctx) => {
  ctx.reply(
    'Welcome to CYBIX CC Bot! Please choose a command from the menu.',
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Menu', callback_data: 'menu' }],
        ],
      },
    }
  );
});

// Command to show bot status, including uptime and ping
bot.command('status', async (ctx) => {
  const uptime = process.uptime();
  const ping = await bot.telegram.getMe(); // Simple ping to check if bot is working
  const pingTime = ping ? 'Pong!' : 'Bot seems to be down!';
  
  const formattedUptime = new Date(uptime * 1000).toISOString().substr(11, 8); // Convert uptime to HH:MM:SS format
  
  ctx.reply(
    `🟢 **Bot Status** 🟢\n\n` +
    `**Uptime**: ${formattedUptime}\n` +
    `**Ping**: ${pingTime}\n` +
    `**Status**: Online`
  );
});

// Command to check number of users (just an example, needs a database for real user count)
bot.command('users', (ctx) => {
  const userCount = 100; // This is just a placeholder
  ctx.reply(`There are currently ${userCount} users interacting with the bot.`);
});

// Command to get premium status
bot.command('getprem', (ctx) => {
  // Check if user is premium (you would need a real database or list of users)
  const isPremium = false; // Just an example, you'd replace this with actual logic
  
  if (isPremium) {
    ctx.reply('You are a premium user.');
  } else {
    ctx.reply(
      'You are not a premium user. Contact the bot owner @cybixdev to upgrade.',
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Contact Owner', url: 'https://t.me/cybixdev' }],
          ],
        },
      }
    );
  }
});

// Add premium user (only for the owner)
bot.command('addprem', (ctx) => {
  const userId = ctx.from.id;
  if (userId.toString() === OWNER_ID) {
    // Logic to add a user to the premium list
    const targetUserId = ctx.message.text.split(' ')[1];
    if (!targetUserId) {
      return ctx.reply('Please provide a user ID to add as premium.');
    }
    ctx.reply(`User ${targetUserId} has been added to premium.`);
  } else {
    ctx.reply('You are not authorized to perform this action.');
  }
});

// Add VIP user (only for the owner)
bot.command('add-vip', (ctx) => {
  const userId = ctx.from.id;
  if (userId.toString() === OWNER_ID) {
    // Logic to add a user to the VIP list
    const targetUserId = ctx.message.text.split(' ')[1];
    if (!targetUserId) {
      return ctx.reply('Please provide a user ID to add as VIP.');
    }
    ctx.reply(`User ${targetUserId} has been added to VIP.`);
  } else {
    ctx.reply('You are not authorized to perform this action.');
  }
});

// Handle the menu command
bot.command('menu', (ctx) => {
  ctx.reply(
    'Here are the available commands:\n' +
    '/start - Start the bot\n' +
    '/status - Check bot status\n' +
    '/getprem - Check if you are a premium user\n' +
    '/addprem <user id> - Add user to premium (owner only)\n' +
    '/add-vip <user id> - Add user to VIP (owner only)\n' +
    '/users - See number of users\n',
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Join Channel', url: `https://t.me/${CHANNEL_ID}` }],
          [{ text: 'Contact Owner', url: 'https://t.me/cybixdev' }],
        ],
      },
    }
  );
});

// Launch the bot
bot.launch()
  .then(() => console.log('CYBIX CC Bot is running...'))
  .catch((err) => console.error('Error launching bot:', err));