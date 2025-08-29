const os = require('os');
const moment = require('moment');
const axios = require('axios');

let startTime = Date.now(); // Capture bot's start time
let usersCount = 0; // Initialize user count (this will be dynamic based on your data source)

// Example function to simulate fetching real user count (this should be replaced with your actual method)
const getUserCount = async () => {
  // Replace with your actual method to fetch the real number of users
  return 1200; // Just a placeholder; fetch real user count here
};

module.exports = {
  name: 'menu',
  getMenu: async () => {
    // Get current uptime and formatted runtime
    let uptime = moment.duration(Date.now() - startTime).humanize();
    let formattedRuntime = moment(startTime).format('MMMM Do YYYY, h:mm:ss a');
    
    // Get bot speed by pinging the bot itself
    let pingStart = Date.now();
    await axios.get('https://api.telegram.org'); // A simple ping to measure bot speed
    let pingDuration = Date.now() - pingStart; // Calculate ping time in ms
    
    // Fetch real user count dynamically
    usersCount = await getUserCount();
    
    return `🌟•••••••【𝐂𝐘𝐁𝐈𝐗 𝐂𝐂 】•••••••🌟

🔥 **Bot Status**: Online
📊 **Bot Speed**: ${pingDuration}ms (Ping)
⏳ **Uptime**: ${uptime}
🕒 **Runtime**: ${formattedRuntime}
👥 **Total Users**: ${usersCount}

💬 **Commands**:
» **/gen**
» **/getprem**
» **/addprem <user id>**
» **/add-vip <user id>**
» **/users**

⚡ Join our Telegram and WhatsApp channels for more updates!
`;
  },
  run: async (bot, msg, args, { menuButtons, BANNER_IMG }) => {
    const menuText = await module.exports.getMenu();
    
    await bot.sendPhoto(msg.chat.id, BANNER_IMG, {
      caption: menuText,
      reply_markup: { inline_keyboard: menuButtons }
    });
  }
};