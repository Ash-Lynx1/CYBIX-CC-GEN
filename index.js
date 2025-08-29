// CYBIX CC — Telegraf + Express (Render-ready / polling only, no external URL env needed)
require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");
const express = require("express");
const axios = require("axios");

// ===== CONFIG =====
const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error("❌ BOT_TOKEN is missing. Set it in Render Environment Variables.");
  process.exit(1);
}
const OWNER_ID = 6524840104; // owner only can add prem/vip
const CHANNEL_ID = "@cybixtech"; // gate: must join

const BANNER = "https://files.catbox.moe/3lj8a6.jpg";
const TG_CHANNEL_LINK = "https://t.me/cybixtech";
const WA_LINK_1 = "https://whatsapp.com/channel/0029VbB8svo65yD8WDtzwd0X";
const WA_LINK_2 = "https://whatsapp.com/channel/0029VbAxGAQK5cD8Y03rnv3K";
const OWNER_CONTACT = "https://t.me/cybixdev";

const PORT = process.env.PORT || 10000;

// ===== STATE =====
const bot = new Telegraf(BOT_TOKEN);
const app = express();

const startTime = Date.now();
const users = new Set();
const premiumUsers = new Set();
const vvipUsers = new Set();
const usage = new Map(); // userId -> { windowStart, count }

// ===== UTILS =====
const formatRuntime = (ms) => {
  let s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400); s %= 86400;
  const h = Math.floor(s / 3600);  s %= 3600;
  const m = Math.floor(s / 60);    s %= 60;
  return `${d}d ${h}h ${m}m ${s}s`;
};

const buttons = () =>
  Markup.inlineKeyboard([
    [Markup.button.url("📢 Join Telegram Channel", TG_CHANNEL_LINK)],
    [Markup.button.url("📱 WhatsApp Channel 1", WA_LINK_1)],
    [Markup.button.url("📱 WhatsApp Channel 2", WA_LINK_2)],
    [Markup.button.url("👑 Bot Owner", OWNER_CONTACT)],
  ]);

const sendBanner = (ctx, caption) =>
  ctx.replyWithPhoto({ url: BANNER }, { caption, parse_mode: "Markdown", ...buttons() });

const getPing = async () => {
  const t0 = Date.now();
  try {
    await axios.get("https://apis.davidcyriltech.my.id/tools/ccgen?type=MasterCard&amount=10", { timeout: 8000 });
  } catch {}
  return Date.now() - t0;
};

const normalizeCard = (c) => {
  const num = c.card_number || c.cardNumber || c.ccnum || c.number || c.cc || c.bin || "N/A";
  const month = c.month || c.exp_month || (c.expiry && String(c.expiry).split(/[\/\-|]/)[0]) || c.mm || "MM";
  let year = c.year || c.exp_year || (c.expiry && String(c.expiry).split(/[\/\-|]/)[1]) || c.yy || "YY";
  if (String(year).length === 4) year = String(year).slice(2);
  const cvv = c.cvv || c.cvc || c.cvv2 || c.security_code || "CVV";
  return `${num}|${month}|${year}|${cvv}`;
};

const tierOf = (id) => (vvipUsers.has(id) ? "vvip" : premiumUsers.has(id) ? "premium" : "regular");
const recordUse = (id) => {
  const tier = tierOf(id);
  if (tier === "vvip") return { ok: true, left: "∞" };
  const limit = tier === "premium" ? 30 : 3;
  const now = Date.now();
  let slot = usage.get(id);
  if (!slot) { slot = { windowStart: now, count: 0 }; usage.set(id, slot); }
  if (now - slot.windowStart >= 3600_000) { slot.windowStart = now; slot.count = 0; }
  if (slot.count >= limit) return { ok: false, left: 0, limit };
  slot.count += 1;
  return { ok: true, left: limit - slot.count };
};

// ===== MIDDLEWARE =====
bot.use((ctx, next) => {
  if (ctx.from?.id) users.add(ctx.from.id);
  return next();
});

// Gate: must join channel
bot.use(async (ctx, next) => {
  const uid = ctx.from?.id;
  if (!uid) return next();
  try {
    const m = await ctx.telegram.getChatMember(CHANNEL_ID, uid);
    if (["left", "kicked", "restricted"].includes(m.status)) {
      await sendBanner(ctx, "🚫 To use *CYBIX CC*, first join our channel using the buttons below.");
      return;
    }
  } catch {
    // If we cannot check (private channel / permissions), still enforce join by prompting.
    await sendBanner(ctx, "⚠️ Please join our channel to continue.");
    return;
  }
  return next();
});

// ===== MENU (EXACT FORMAT YOU PROVIDED) =====
const menuCaption = async () => {
  const runtime = formatRuntime(Date.now() - startTime);
  const ping = await getPing();
  // Your exact layout preserved:
  return (
`•••••••【𝐂𝐘𝐁𝐈𝐗 𝐂𝐂 】•••••••
» Users:
${users.size}
» Prefix:
/
» Plugins:
gen, getprem, addprem, add-vip, users
» Status:
${ping}ms
» Runtime:
${runtime}


➪ gen
➪ getprem
➪ addprem <user id>
➪ add-vip <user id>
➪ users`
  );
};

// ===== COMMANDS =====
bot.start(async (ctx) => { await sendBanner(ctx, await menuCaption()); });
bot.command("menu", async (ctx) => { await sendBanner(ctx, await menuCaption()); });

// Generate CCs from API (5 MasterCard) with limits per tier
bot.command("gen", async (ctx) => {
  const uid = ctx.from.id;
  const gate = recordUse(uid);
  if (!gate.ok) {
    const tier = tierOf(uid);
    await sendBanner(ctx, `⏳ You've reached your hourly limit.\nTier: *${tier.toUpperCase()}*${tier === "premium" ? " (30/hr)" : tier === "regular" ? " (3/hr)" : ""}\nUpgrade via /getprem.`);
    return;
  }

  try {
    const res = await axios.get("https://apis.davidcyriltech.my.id/tools/ccgen?type=MasterCard&amount=5", { timeout: 15000 });
    const data = Array.isArray(res.data?.data) ? res.data.data
               : Array.isArray(res.data)       ? res.data
               : res.data?.cards               ? res.data.cards
               : [];

    if (!data.length) {
      await sendBanner(ctx, "⚠️ API returned no cards. Try again shortly.");
      return;
    }

    // Lines + raw JSON preview (not too long for Telegram)
    const lines = data.map((c, i) => `#${i + 1} ${normalizeCard(c)}`).join("\n");
    await sendBanner(ctx, `💳 *Generated Cards*\n\`\`\`\n${lines}\n\`\`\``);

    const raw = JSON.stringify(data, null, 2);
    const chunk = raw.length > 3500 ? raw.slice(0, 3500) + "\n... (truncated)" : raw;
    await ctx.replyWithMarkdown("```json\n" + chunk + "\n```", buttons());
  } catch (e) {
    await sendBanner(ctx, "❌ Failed to fetch from API. Please try again later.");
  }
});

// Check premium status
bot.command("getprem", async (ctx) => {
  const uid = ctx.from.id;
  if (vvipUsers.has(uid)) { await sendBanner(ctx, "💎 You are *VVIP*. Unlimited usage."); return; }
  if (premiumUsers.has(uid)) { await sendBanner(ctx, "🌟 You are *Premium*. 30 requests per hour."); return; }
  await ctx.replyWithPhoto(
    { url: BANNER },
    {
      caption: "❌ You are *not premium*. Tap below to contact the owner.",
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.url("👑 Contact Owner", OWNER_CONTACT)],
        ...buttons().reply_markup.inline_keyboard
      ])
    }
  );
});

// Owner-only: add premium
bot.command("addprem", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) { await sendBanner(ctx, "⛔ Only the owner can use this command."); return; }
  const parts = ctx.message.text.trim().split(/\s+/);
  const target = Number(parts[1]);
  if (!target) { await sendBanner(ctx, "Usage: /addprem <user id>"); return; }
  premiumUsers.add(target);
  await sendBanner(ctx, `✅ User \`${target}\` added as *Premium* (30/hr).`);
});

// Owner-only: add VVIP
bot.command("add-vip", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) { await sendBanner(ctx, "⛔ Only the owner can use this command."); return; }
  const parts = ctx.message.text.trim().split(/\s+/);
  const target = Number(parts[1]);
  if (!target) { await sendBanner(ctx, "Usage: /add-vip <user id>"); return; }
  vvipUsers.add(target);
  await sendBanner(ctx, `🔥 User \`${target}\` added as *VVIP* (unlimited).`);
});

// Real users count (unique IDs seen by the bot)
bot.command("users", async (ctx) => {
  await sendBanner(ctx, `👥 Total Users: *${users.size}*`);
});

// ===== SERVER (health endpoint for Render) =====
app.get("/", (_req, res) => res.send("CYBIX CC is running."));
app.listen(PORT, () => console.log(`🌐 HTTP server on :${PORT}`));

// ===== START BOT (Polling; ensure no webhook to avoid 409 conflicts) =====
(async () => {
  try {
    await bot.telegram.deleteWebhook({ drop_pending_updates: true }).catch(() => {});
    await bot.launch({ dropPendingUpdates: true });
    console.log("🚀 CYBIX CC Bot launched (polling).");
  } catch (err) {
    console.error("❌ Error launching bot:", err);
    process.exit(1);
  }
})();

// Graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));