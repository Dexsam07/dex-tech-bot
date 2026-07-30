//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                             𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓                                                                                                     //
//                                                                  𝐕 : 1.0.0                                                                                                             //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2026                                                                                                        //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//* 
//  * command : alive
//  * description : Check if bot is alive
//  * Credit To  DEX SHYAM TECH
//  * © 2026 𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓.
// ⛥┌┤
// */

const settings = require('../settings');
const moment = require('moment-timezone');

async function aliveCommand(sock, chatId, message) {
    try {
        // Timezone from settings (default Asia/Kolkata)
        const timezone = settings.timezone || 'Asia/Kolkata';
        const currentTime = moment().tz(timezone).format('DD/MM/YYYY HH:mm:ss');
        
        // Bot uptime (if start time is stored globally)
        let uptime = 'Just started';
        if (global.botStartTime) {
            const diff = Date.now() - global.botStartTime;
            const seconds = Math.floor(diff / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);
            uptime = days > 0 ? `${days}d ${hours % 24}h ${minutes % 60}m` :
                    hours > 0 ? `${hours}h ${minutes % 60}m` :
                    `${minutes}m ${seconds % 60}s`;
        }

        // Dynamic newsletter JID (from settings)
        const newsletterJid = settings.newsletterJid || '120363406449026172@newsletter';
        const newsletterName = settings.newsletterName || 'Dex Shyam Tech';

        // Build status message
        const reply = `╭──❍「 *🤖 BOT STATUS* 」❍\n` +
                     `├• 📅 Time: ${currentTime}\n` +
                     `├• ✅ Status: *🟢 ONLINE & ACTIVE*\n` +
                     `├• ⏱️ Uptime: ${uptime}\n` +
                     `├• 💻 Version: ${settings.version || '1.0.0'}\n` +
                     `├• 👤 Owner: ${settings.botOwner || 'Shyam Choudhari'}\n` +
                     `├• 🌐 Prefix: ${settings.prefix || '.'}\n` +
                     `├• 🌍 Timezone: ${timezone}\n` +
                     `╰─┬─★─☆─♪♪─❍\n` +
                     `╭─┴❍「 *QUICK COMMANDS* 」❍\n` +
                     `◈ • ${settings.prefix || '.'}menu - All commands\n` +
                     `◈ • ${settings.prefix || '.'}help - Bot guide\n` +
                     `◈ • ${settings.prefix || '.'}owner - Contact owner\n` +
                     `◈ • ${settings.prefix || '.'}ping - Check speed\n` +
                     `╰───★─☆─♪♪─❍\n\n` +
                     `💬 *Support:* https://chat.whatsapp.com/Fu8Ck4TetM8BX902ZEWVIR?s=cl&p=a&ilr=4&amv=1\n` +
                     `📺 *YouTube:* https://www.youtube.com/@dex_shyam_tech\n` +
                     `🤖 *${settings.botName || '𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓'}*`;

        await sock.sendMessage(chatId, {
            text: reply,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: newsletterJid,
                    newsletterName: newsletterName,
                    serverMessageId: -1
                }
            }
        }, { quoted: message });

    } catch (error) {
        console.error('❌ Alive command error:', error.message);
        await sock.sendMessage(chatId, {
            text: '❌ Error checking bot status. Please try again.'
        }, { quoted: message });
    }
}

module.exports = aliveCommand;