const axios = require('axios');
const config = require('../config');

async function checkUserStatus(userId) {
  try {
    const response = await axios.get(`https://api.telegram.org/bot${config.TOKEN}/getChatMember`, {
      params: {
        chat_id: config.CHANNEL_ID, // The required channel ID
        user_id: userId
      }
    });
    
    const status = response.data.result.status;
    
    // Return whether the user is a member or not
    return status === 'member' || status === 'administrator' || status === 'creator';
  } catch (error) {
    console.error('Error checking user status:', error);
    return false; // If there is an error, we return false to handle gracefully
  }
}

module.exports = { checkUserStatus };