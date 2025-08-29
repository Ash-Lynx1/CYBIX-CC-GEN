const { sendMessageWithButtons } = require('../helpers/sendMessageWithButtons');
const config = require('../config');

module.exports = (bot) => {
  bot.onText(/\/menu/, (msg) => {
    const chatId = msg.chat.id;
    
    // Main menu message
    const text = `
      **Welcome to CYBIX CC Bot!**

      Here you can generate fake credit cards for fun. Choose an option below:

      • /gen - Generate fake credit card details
      • /getprem - Check your premium status
      • /users - View all bot users (Owner only)
    `;
    
    // Buttons for the main menu
    const buttons = [
      { text: 'Get Premium', callback_data: 'getprem' },
      { text: 'Contact Owner @cybixdev', url: 'tg://resolve?domain=cybixdev' },
      { text: 'Join Telegram Channel', url: 'https://t.me/cybixtech' },
      { text: 'Join WhatsApp Channel 1', url: 'https://whatsapp.com/channel/0029VbB8svo65yD8WDtzwd0X' },
      { text: 'Join WhatsApp Channel 2', url: 'https://whatsapp.com/channel/0029VbAxGAQK5cD8Y03rnv3K' }
    ];
    
    // Send the menu with buttons
    sendMessageWithButtons(
      bot,
      chatId,
      text,
      buttons,
      'https://i.imgur.com/8TSnkdN.jpeg' // Banner Image
    );
  });
};