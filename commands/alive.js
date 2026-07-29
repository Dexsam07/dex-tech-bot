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
//  * command : alive
//  * description : Check if bot is alive
//  * Credit To  DEX SHYAM TECH
//  * © 2026 𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓.
// ⛥┌┤
// */

const settings = require('../settings');
const moment = require('moment-timezone');

module.exports = {
    name: 'alive',
    category: 'General',
    description: 'Check if bot is alive',
    usage: '.alive',
    execute: async (dexbotInc, message, args, sender, from) => {
        try {
            // ✅ India timezone (settings se load hoga)
            const timezone = settings.timezone || 'Asia/Kolkata';
            const currentTime = moment().tz(timezone).format('DD/MM/YYYY HH:mm:ss');
            
            // ✅ Get bot uptime (agar bot start time store kiya hai toh)
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

            // ✅ Settings se newsletter JID load karo (TERA WALA)
            const newsletterJid = settings.newsletterJid || '120363406449026172@newsletter';
            const newsletterName = settings.newsletterName || 'Dex Shyam Tech';

            // ✅ Reply message
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
                         `💬 *Support:* https://chat.whatsapp.com/EefmNhOh1TvGcZhwySaOGw\n` +
                         `📺 *YouTube:* https://www.youtube.com/@gang_hacker\n` +
                         `🤖 *${settings.botName || '𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓'}*`;

            await dexbotInc.sendMessage(from, {
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
            });
        } catch (error) {
            console.error('❌ Alive command error:', error.message);
            await dexbotInc.sendMessage(from, { 
                text: '❌ Error checking bot status. Please try again.' 
            });
        }
    }
};