const { sendMessageWithButtons } = require('../helpers/sendMessageWithButtons');
const config = require('../config');

// Mock example of storing users (replace with actual database logic)
let users = [
  { id: 6524840104, username: '@cybixdev' },
  { id: 123456789, username: '@user1' },
  { id: 987654321, username: '@user2' }
];

module.exports = (bot) => {
  bot.onText(/\/users/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    
    // Only allow the owner to see the user list
    if (userId !== config.OWNER_ID) {
      return bot.sendMessage(chatId, "You do not have permission to view the list of users.");
    }
    
    // Format the list of users
    if (users.length === 0) {
      return bot.sendMessage(chatId, "No users have interacted with the bot yet.");
    }
    
    let userList = users.map(user => {
      return `${user.username} (ID: ${user.id})`;
    }).join('\n');
    
    sendMessageWithButtons(
      bot,
      chatId,
      `Here are the registered users:\n\n${userList}`,
      [
        { text: 'Go Back', callback_data: 'menu' }
      ]
    );
  });
};