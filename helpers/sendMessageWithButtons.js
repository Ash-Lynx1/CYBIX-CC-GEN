function sendMessageWithButtons(bot, chatId, text, buttons, imageUrl = null) {
  const opts = {
    reply_markup: {
      inline_keyboard: buttons.map(button => [{ text: button.text, url: button.url || button.callback_data }])
    }
  };
  
  if (imageUrl) {
    bot.sendPhoto(chatId, imageUrl, opts).then(() => {
      bot.sendMessage(chatId, text, opts);
    });
  } else {
    bot.sendMessage(chatId, text, opts);
  }
}

module.exports = { sendMessageWithButtons };