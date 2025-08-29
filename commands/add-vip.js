const config = require('../config');

module.exports = (bot) => {
  bot.onText(/\/add-vip (\d+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    
    // Only the owner can add VIP users
    if (userId !== config.OWNER_ID) {
      return bot.sendMessage(chatId, "You do not have permission to add VIP users.");
    }
    
    const targetUserId = match[1];
    // Logic to mark the user as VIP (e.g., store in DB or memory)
    bot.sendMessage(chatId, `User ${targetUserId} has been added as a VIP user.`);
  });
};