const { sendMessageWithButtons } = require('../helpers/sendMessageWithButtons');
const config = require('../config');

module.exports = (bot) => {
  bot.onText(/\/getprem/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    
    // Check if user is premium (this can be a DB check or any other logic you implement)
    const isPremium = false; // Example logic (replace with your actual logic)
    
    if (isPremium) {
      bot.sendMessage(chatId, "You are a premium user! You can generate 30 cards per hour.");
    } else {
      sendMessageWithButtons(
        bot,
        chatId,
        "You are not a premium user. Please contact the bot owner for access.",
        [
          { text: 'Contact Owner @cybixdev', url: 'tg://resolve?domain=cybixdev' }
        ]
      );
    }
  });
};