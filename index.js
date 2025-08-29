require("dotenv").config();
const express = require("express");
const { Telegraf, Markup } = require("telegraf");
const axios = require("axios");

// ====== ENV / CONSTANTS ======
const BOT_TOKEN = process.env.BOT_TOKEN;
const PORT = process.env.PORT || 10000;

if (!BOT_TOKEN) {
  console.error("❌ BOT_TOKEN is missing. Set it in Render > Environment.");
  process.exit(1);
}

const OWNER_ID = 6524840104;                           // Owner can add premium/vvip
const CHANNEL_USERNAME = "@cybixtech";                 // Must-join channel gate
const BANNER_URL = "https://i.imgur.com/8TSnkdN.jpeg"; // Banner image
const TG_CHANNEL_LINK = "https://t.me/cybixtech";
const WA_LINK_1 = "https://whatsapp.com/channel/0029VbB8svo65yD8WDtzwd0X";
const WA_LINK_2 = "https://whatsapp.com/channel/0029VbAxGAQK5cD8Y03rnv3K";
const OWNER_CONTACT = "https://t.me/cybixdev";

// ====== BOT / SERVER ======
const bot = new Telegraf(BOT_TOKEN);
const app = express();

// ====== RUNTIME STATE ======
const startTime = Date.now();
const users = new Set();          // real users seen by the bot
const premiumUsers = new Set();   // premium tier
const vvipUsers = new Set();      // vvip tier (unlimited)
const usage = new Map();          // per-hour usage counts: Map<userId, {start, count}>

// ====== HELPERS ======
const buttons = () =>
  Markup.inlineKeyboard([
    [Markup.button.url("📢 Join Telegram Channel", TG_CHANNEL_LINK)],
    [Markup.button.url("📱 WhatsApp Channel 1", WA_LINK_1)],
    [Markup.button.url("📱 WhatsApp Channel 2", WA_LINK_2)],
    [Markup.button.url("👑 Contact Owner", OWNER_CONTACT)],
  ]);

const sendBanner = (ctx, caption) =>
  ctx.replyWithPhoto({ url: BANNER_URL }, { caption, parse_mode: "Markdown", ...buttons() });

const fmtRuntime = (ms) => {
  let s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400); s %= 86400;
  const h = Math.floor(s / 3600);  s %= 3600;
  const m = Math.floor(s / 60);    s %= 60;
  return `${d}d ${h}h ${m}m ${s}s`;
};

const getPingMs = async (ctx) => {
  const t0 = Date.now();
  try { await ctx.telegram.getMe(); } catch {}
  return Date.now() - t0;
};

const tierOf = (id) => (vvipUsers.has(id) ? "vvip" : premiumUsers.has(id) ? "premium" : "regular");

const recordUse = (id) => {
  const tier = tierOf(id);
  if (tier === "vvip") return { ok: true, left: "∞" };
  const limit = tier === "premium" ? 30 : 3;
  const now = Date.now();
  let rec = usage.get(id);
  if (!rec) { rec = { start: now, count: 0 }; usage.set(id, rec); }
  if (now - rec.start >= 3600_000) { rec.start = now; rec.count = 0; }
  if (rec.count >= limit) return { ok: false, left: 0, limit };
  rec.count += 1;
  return { ok: true, left: limit - rec.count, limit };
};

const normalizeCardLine = (c) => {
  const num = c.card_number || c.cardNumber || c.number || c.cc || c.bin || "N/A";
  const mm  = c.month || c.exp_month || (c.expiry && String(c.expiry).split(/[\/\-|]/)[0]) || c.mm || "MM";
  let yy    = c.year || c.exp_year  || (c.expiry && String(c.expiry).split(/[\/\-|]/)[1]) || c.yy || "YY";
  if (String(yy).length === 4) yy = String(yy).slice(2);
  const cvv = c.cvv || c.cvc || c.cvv2 || c.security_code || "CVV";
  return `${num}|${mm}|${yy}|${cvv}`;
};

const buildMenuText = async (ctx) => {
  const runtime = fmtRuntime(Date.now() - startTime);
  const ping = await getPingMs(ctx);
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

// ====== MIDDLEWARE ======
// Track real users
bot.use((ctx, next) => {
  if (ctx.from?.id) users.add(ctx.from.id);
  return next();
});

// Must-join channel gate
bot.use(async (ctx, next) => {
  const uid = ctx.from?.id;
  if (!uid) return next();
  try {
    const member = await ctx.telegram.getChatMember(CHANNEL_USERNAME, uid);
    if (["left", "kicked", "restricted"].includes(member.status)) {
      await sendBanner(ctx, "🚫 To use *CYBIX CC*, first join our channel using the buttons below.");
      return;
    }
  } catch {
    // If member list is inaccessible (private channel / not an admin),
    // we still prompt to join to enforce the rule without crashing.
    await sendBanner(ctx, "⚠️ Please join our channel to continue.");
    return;
  }
  return next();
});

// ====== COMMANDS (prefix "/") ======
bot.start(async (ctx) => { try { await sendBanner(ctx, await buildMenuText(ctx)); } catch {} });
bot.command("menu", async (ctx) => { try { await sendBanner(ctx, await buildMenuText(ctx)); } catch {} });

bot.command("users", async (ctx) => {
  try { await sendBanner(ctx, `👥 Total Users: *${users.size}*`); } catch {}
});

bot.command("getprem", async (ctx) => {
  const uid = ctx.from.id;
  if (vvipUsers.has(uid)) { await sendBanner(ctx, "💎 You are *VVIP*. Unlimited usage."); return; }
  if (premiumUsers.has(uid)) { await sendBanner(ctx, "🌟 You are *Premium*. 30 requests per hour."); return; }
  // not premium
  try {
    await ctx.replyWithPhoto(
      { url: BANNER_URL },
      {
        caption: "❌ You are *not premium*. Tap below to contact the owner.",
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard([
          [Markup.button.url("👑 Contact Owner", OWNER_CONTACT)],
          ...buttons().reply_markup.inline_keyboard
        ])
      }
    );
  } catch {}
});

// Owner-only: /addprem <userId>
bot.command("addprem", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) { await sendBanner(ctx, "⛔ Only the owner can use this command."); return; }
  const parts = ctx.message.text.trim().split(/\s+/);
  const target = Number(parts[1]);
  if (!target) { await sendBanner(ctx, "Usage: `/addprem <user id>`"); return; }
  premiumUsers.add(target);
  await sendBanner(ctx, `✅ User \`${target}\` added as *Premium* (30/hr).`);
});

// Owner-only: /add-vip <userId>
bot.command("add-vip", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) { await sendBanner(ctx, "⛔ Only the owner can use this command."); return; }
  const parts = ctx.message.text.trim().split(/\s+/);
  const target = Number(parts[1]);
  if (!target) { await sendBanner(ctx, "Usage: `/add-vip <user id>`"); return; }
  vvipUsers.add(target);
  await sendBanner(ctx, `🔥 User \`${target}\` added as *VVIP* (unlimited).`);
});

// /gen — fetch real cards from your API with per-tier limits
bot.command("gen", async (ctx) => {
  const uid = ctx.from.id;
  const gate = recordUse(uid);
  if (!gate.ok) {
    const tier = tierOf(uid);
    await sendBanner(ctx, `⏳ You've reached your hourly limit.\nTier: *${tier.toUpperCase()}*${tier==="premium"?" (30/hr)":tier==="regular"?" (3/hr)":""}\nUse /getprem to upgrade.`);
    return;
  }

  try {
    const url = "https://apis.davidcyriltech.my.id/tools/ccgen?type=MasterCard&amount=5";
    const res = await axios.get(url, { timeout: 15000 });

    // Try multiple common shapes
    const arr = Array.isArray(res.data?.data) ? res.data.data
              : Array.isArray(res.data)       ? res.data
              : Array.isArray(res.data?.cards)? res.data.cards
              : [];

    if (!arr.length) {
      await sendBanner(ctx, "⚠️ API returned no cards. Try again shortly.");
      return;
    }

    const lines = arr.map((c, i) => `#${i+1} ${normalizeCardLine(c)}`);
    // Send banner first (short caption), then the list
    await sendBanner(ctx, `💳 *Generated Cards* (${lines.length})`);
    // Split into safe message chunks
    const chunkSize = 50;
    for (let i = 0; i < lines.length; i += chunkSize) {
      const chunk = lines.slice(i, i + chunkSize).join("\n");
      await ctx.replyWithMarkdown("```\n" + chunk + "\n```", buttons());
    }
  } catch (e) {
    await sendBanner(ctx, "❌ Failed to fetch from API. Please try again later.");
  }
});

// ====== SERVER (health) ======
app.get("/", (_req, res) => res.send("CYBIX CC is running."));
app.listen(PORT, () => console.log(`🌐 HTTP server on :${PORT}`));

// ====== LAUNCH (polling only; clear webhook to avoid 409 conflicts) ======
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

// ====== GRACEFUL STOP ======
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));