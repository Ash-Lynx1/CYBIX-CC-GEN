module.exports = {
  checkJoin: async (bot, userId, channelUsername) => {
    try {
      const res = await bot.getChatMember(`@${channelUsername}`, userId);
      return ['member', 'administrator', 'creator'].includes(res.status);
    } catch (e) {
      return false;
    }
  }
};