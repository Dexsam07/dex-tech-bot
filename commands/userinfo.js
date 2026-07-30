//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                                                                                                                                                        //
//                                                             𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓                                                                                                     //
//                                                                                                                                                                                        //
//                                                                  𝐕 : 1.0.0                                                                                                             //
//                                                                                                                                                                                        //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2026                                                                                                        //
//                                                                                                                                                                                        //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//* 
//* 
//  * project_name : DEX-TECH-BOT
//  * author : Shyam Choudhari
//  * youtube : https://www.youtube.com/dex_shyam_tech 
//  * description : DEX-TECH-BOT ,A Multi-Device whatsapp user bot.
//*
//*
//re-upload? recode? copy code? give credit to Shyam Choudhari 2025:)
//Instagram: @dex_shyam_42
//Telegram: t.me/dex_shyam_tools
//GitHub: dexsam07 
//WhatsApp: +639542842622
//want more free bot scripts? subscribe to my youtube channel: https://youtube.com/@dex_shyam_tech
//   * Created By Github: dexsam07.
//   * Credit To Shyam Choudhari 
//   * © 2025 DEX-TECH-BOT.
// ⛥┌┤
// */
const fetch = require('node-fetch');
const PROXY_URL = 'https://gemini-proxy-10a1.onrender.com';

async function userInfoCommand(sock, chatId, message) {
    try {
        let targetNumber;
        const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        if (mentionedJid && mentionedJid.length === 1) targetNumber = mentionedJid[0].split('@')[0];
        if (!targetNumber) {
            const quotedParticipant = message.message?.extendedTextMessage?.contextInfo?.participant;
            if (quotedParticipant) targetNumber = quotedParticipant.split('@')[0];
        }
        if (!targetNumber) {
            const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
            const arg = text.split(' ').slice(1)[0]?.replace(/[^0-9]/g, '');
            if (arg && arg.length >= 10) targetNumber = arg;
        }
        if (!targetNumber) targetNumber = (message.key.remoteJidAlt || message.key.participant || message.key.remoteJid).split('@')[0].split(':')[0];

        const res = await fetch(`${PROXY_URL}/v1/userinfo/${targetNumber}`);
        const data = await res.json();
        if (data.error) return sock.sendMessage(chatId, { text: `╭──◆「 *USER INFO* 」◆\n├\n├◇ ❌ User not found\n├◇ 📱 ${targetNumber}\n├◇ 💡 Deploy DEX-TECH-BOT to register\n├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *DEX-TECH-BOT* 」◆\n╰───★─☆─♪♪─◆` }, { quoted: message });

        const icon = data.isOnline ? '🟢' : '🔴';
        let msg = `╭──◆「 *USER INFO* 」◆\n├\n`;
        msg += `├◇ 👤 *Number:* ${data.userId}\n`;
        msg += `├◇ 🏷️ *Name:* ${data.botOwner}\n`;
        msg += `├◇ 🤖 *Bot:* ${data.botName}\n`;
        msg += `├◇ 📡 *Platform:* ${data.platform}\n`;
        msg += `├◇ 🌍 *Timezone:* ${data.timezone}\n`;
        msg += `├◇ 📊 *Commands:* ${data.commandCount}\n`;
        msg += `├◇ ⭐ *Favorite:* ${data.favCmd}\n`;
        msg += `├◇ ⏱️ *Uptime:* ${data.uptimeDisplay}\n`;
        msg += `├◇ ${icon} *Status:* ${data.isOnline ? 'Active' : 'Inactive'}\n`;
        msg += `├◇ 🎂 *Age:* ${data.ageDisplay}\n`;
        msg += `├◇ 📅 *First Seen:* ${new Date(data.firstSeen).toLocaleDateString()}\n`;
        msg += `├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *DEX-TECH-BOT* 」◆\n╰───★─☆─♪♪─◆`;
        await sock.sendMessage(chatId, { text: msg }, { quoted: message });
    } catch (error) {
        await sock.sendMessage(chatId, { text: `╭──◆「 *ERROR* 」◆\n├\n├◇ ❌ Failed to fetch user info\n├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *DEX-TECH-BOT* 」◆\n╰───★─☆─♪♪─◆` }, { quoted: message });
    }
}
module.exports = userInfoCommand;
