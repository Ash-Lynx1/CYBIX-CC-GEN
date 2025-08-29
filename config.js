module.exports = {
  // Bot Token from BotFather
  TOKEN: process.env.TOKEN || 'your-telegram-bot-token',
  
  // The Telegram channel ID that users must join
  CHANNEL_ID: '@cybixtech', // Replace with your actual channel ID
  
  // Bot owner ID (Only the owner can use certain commands)
  OWNER_ID: 6524840104, // Replace with your actual Telegram user ID
  
  // Optional: You can store premium user data here, or use a database
  premiumUsers: new Set(), // Example for storing premium users in memory
};