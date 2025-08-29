const axios = require('axios');

module.exports = {
  name: 'gen',
  run: async (bot, msg, args, { menuButtons, BANNER_IMG }) => {
    try {
      // Fetch real test card data from the API
      const res = await axios.get('https://apis.davidcyriltech.my.id/tools/ccgen?type=MasterCard&amount=5');
      
      // Ensure we're getting the correct response, and display the test cards
      if (res.data && res.data.result) {
        const data = res.data.result.join('\n'); // Join the generated test card details
        await bot.sendPhoto(msg.chat.id, BANNER_IMG, {
          caption: `•••••••【𝐂𝐘𝐁𝐈𝐗 𝐂𝐂 】•••••••\n\n${data}`,
          reply_markup: { inline_keyboard: menuButtons }
        });
      } else {
        throw new Error('No results from API');
      }
    } catch (e) {
      // Handle errors gracefully
      await bot.sendPhoto(msg.chat.id, BANNER_IMG, {
        caption: '❌ Failed to generate cards. Try again later.',
        reply_markup: { inline_keyboard: menuButtons }
      });
    }
  }
};