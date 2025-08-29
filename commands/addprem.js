const config = require('../config');

module.exports = (bot) => {
  bot.onText(/\/addprem (\d+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    
    // Only the owner can add premium users
    if (userId !== config.OWNER_ID) {
      return bot.sendMessage(chatId, "You do not have permission to add premium users.");
    }
    
    const targetUserId = match[1];
    // Logic to mark the user as premium (e.g., store in DB or memory)
    bot.sendMessage(chatId, `User ${targetUserId} has been added as a premium user.`);
  });
};