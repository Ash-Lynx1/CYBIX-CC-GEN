const axios = require('axios');
const { sendMessageWithButtons } = require('../helpers/sendMessageWithButtons');

module.exports = async (bot) => {
  bot.onText(/\/gen/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    
    try {
      // Fetch real credit card details from the API
      const response = await axios.get(`https://apis.davidcyriltech.my.id/tools/ccgen?type=MasterCard&amount=5`);
      const cards = response.data;
      
      if (!cards || cards.length === 0) {
        bot.sendMessage(chatId, 'Sorry, no cards could be generated at the moment. Please try again later.');
        return;
      }
      
      // Format the response with all the details
      let cardList = cards.map(card => {
        return `**Card Type:** ${card.type}\n` +
          `**Card Number:** ${card.card_number}\n` +
          `**Expiry Date:** ${card.expiry_date}\n` +
          `**CVV:** ${card.cvv}\n` +
          `**Bank Name:** ${card.bank_name}\n` +
          `**Country:** ${card.country}\n` +
          `**Brand:** ${card.brand}\n` +
          `**Issuer:** ${card.issuer}\n` +
          `**Issuer Phone:** ${card.issuer_phone}\n` +
          `**Issuer Address:** ${card.issuer_address}\n\n`;
      }).join('');
      
      // Send the details to the user
      sendMessageWithButtons(
        bot,
        chatId,
        `Here are your generated cards:\n\n${cardList}`,
        [
          { text: 'Get Premium', callback_data: 'getprem' }
        ]
      );
    } catch (error) {
      console.error('Error generating cards:', error);
      bot.sendMessage(chatId, 'Sorry, there was an issue generating the cards. Please try again later.');
    }
  });
};