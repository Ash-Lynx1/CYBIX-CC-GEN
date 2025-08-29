const axios = require('axios');

let startTime = Date.now(); // when the bot started
let usersCount = 0; // placeholder, replace with your real user count logic

// Format uptime in d h m s
function formatUptime(ms) {
  let seconds = Math.floor(ms / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  let days = Math.floor(hours / 24);
  
  seconds %= 60;
  minutes %= 60;
  hours %= 24;
  
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

// Example: fetch real user count (replace with your DB or storage logic)
const getUserCount = async () => {
  return 1200; // dummy value, replace with actual
};

module.exports = {
  name: 'menu',
  getMenu: async () => {
    // uptime since bot started
    let uptime = formatUptime(Date.now() - startTime);
    
    // runtime start time in readable format
    let startedAt = new Date(startTime).toLocaleString();
    
    // calculate ping
    let pingStart = Date.now();
    await axios.get('https://api.telegram.org'); // simple ping
    let pingDuration = Date.now() - pingStart;
    
    // user count
    usersCount = await getUserCount();
    
    return `🌟•••••••【𝐂𝐘𝐁𝐈𝐗 𝐂𝐂 】•••••••🌟

🔥 Status: Online
⚡ Speed: ${pingDuration}ms
⏳ Uptime: ${uptime}
🕒 Started: ${startedAt}
👥 Users: ${usersCount}

💬 Commands:
➪ /gen
➪ /getprem
➪ /addprem <user id>
➪ /add-vip <user id>
➪ /users

📢 Join our Telegram and WhatsApp channels for updates!`;
  },
  run: async (bot, msg, args, { menuButtons, BANNER_IMG }) => {
    const menuText = await module.exports.getMenu();
    
    await bot.sendPhoto(msg.chat.id, BANNER_IMG, {
      caption: menuText,
      reply_markup: { inline_keyboard: menuButtons }
    });
  }
};