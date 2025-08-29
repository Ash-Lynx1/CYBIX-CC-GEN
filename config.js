require("dotenv").config();

const OWNER_ID = process.env.OWNER_ID || "6524840104";
const TOKEN = process.env.TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID || "@cybixtech";
const BANNER_IMG = "https://i.imgur.com/8TSnkdN.jpeg";

// In-memory user storage
let users = [];

function getUserType(id) {
  const user = users.find((u) => u.id === id);
  return user ? user.type : "regular";
}

function canUseCommand(id, limit, intervalSec) {
  let user = users.find((u) => u.id === id);
  if (!user) {
    user = { id, type: "regular", requests: [] };
    users.push(user);
  }
  
  const now = Date.now();
  user.requests = user.requests.filter((t) => now - t < intervalSec * 1000);
  
  if (user.type === "vvip") return true;
  if (user.requests.length >= limit) return false;
  
  user.requests.push(now);
  return true;
}

function addPremium(id) {
  let user = users.find((u) => u.id === id);
  if (!user) {
    users.push({ id, type: "premium", requests: [] });
  } else {
    user.type = "premium";
  }
}

function addVvip(id) {
  let user = users.find((u) => u.id === id);
  if (!user) {
    users.push({ id, type: "vvip", requests: [] });
  } else {
    user.type = "vvip";
  }
}

function getAllUsers() {
  return users;
}

// Menu buttons
const menuButtons = [
  [{ text: "📢 Telegram Channel", url: "https://t.me/cybixtech" }],
  [{ text: "💬 WhatsApp 1", url: "https://whatsapp.com/channel/0029VbB8svo65yD8WDtzwd0X" }],
  [{ text: "💬 WhatsApp 2", url: "https://whatsapp.com/channel/0029VbAxGAQK5cD8Y03rnv3K" }],
];

module.exports = {
  OWNER_ID,
  TOKEN,
  CHANNEL_ID,
  BANNER_IMG,
  menuButtons,
  getUserType,
  canUseCommand,
  addPremium,
  addVvip,
  getAllUsers,
};