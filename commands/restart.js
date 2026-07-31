//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                             𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓                                                                                                     //
//                                                                  𝐕 : 1.0.0                                                                                                             //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2026                                                                                                        //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//* 
//  * command : restart
//  * description : Restart the bot (Owner only)
//  * Credit To  DEX SHYAM TECH
// ⛥┌┤
// */

const fs = require('fs');
const path = require('path');
const settings = require('../settings');
const isOwnerOrSudo = require('../lib/isOwner');
const moment = require('moment-timezone');

// ========== CONTEXT INFO (Dynamic) ==========
function getContextInfo() {
    return {
        contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: settings.newsletterJid || '120363406449026172@newsletter',
                newsletterName: settings.newsletterName || 'Dex Shyam Tech',
                serverMessageId: -1
            }
        }
    };
}

// ========== FORMAT TIME ==========
function formatBotTime() {
    try {
        const timezone = settings.timezone || 'Asia/Kolkata';
        if (moment.tz.zone(timezone)) {
            return moment().tz(timezone).format('DD/MM/YYYY HH:mm:ss');
        } else {
            return new Date().toISOString() + ` (Invalid timezone: ${timezone})`;
        }
    } catch (_) {
        return new Date().toISOString() + ' (UTC)';
    }
}

// ========== COMMAND ==========
module.exports = {
    name: 'restart',
    category: 'Owner',
    description: 'Restart the bot (Owner only)',
    groupOnly: false,
    ownerOnly: true,

    // ✅ FIXED: Signature matches main.js call (sock, chatId, message, args)
    execute: async (sock, chatId, message, args) => {
        try {
            // ✅ Extract senderId from message
            const senderId = message.key.participant || message.key.remoteJid;
            const isOwner = await isOwnerOrSudo(senderId, sock, chatId);

            if (!isOwner && !message.key.fromMe) {
                await sock.sendMessage(chatId, {
                    text: '❌ Only bot owner can restart the bot!',
                    ...getContextInfo()
                }, { quoted: message });
                return;
            }

            // ✅ Get reason (optional)
            const reason = args.join(' ') || 'Restart requested by owner';
            const botTime = formatBotTime();
            const timezone = settings.timezone || 'Asia/Kolkata';

            // ✅ Build restart message
            let restartMsg = `🔄 *RESTARTING BOT...* 🔄\n\n` +
                           `*Reason:* ${reason}\n` +
                           `*Bot Time:* ${botTime}\n` +
                           `*Timezone:* ${timezone}\n\n` +
                           `⏳ Please wait 10-15 seconds for bot to reconnect...\n` +
                           `✅ Bot will auto-reconnect after restart\n\n` +
                           `🤖 ${settings.botName || '𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓'}`;

            await sock.sendMessage(chatId, {
                text: restartMsg,
                ...getContextInfo()
            }, { quoted: message });

            // ✅ Log restart
            console.log(`🔄 Bot restart requested by ${senderId}: ${reason}`);
            console.log(`🕒 Server time: ${new Date().toISOString()}`);
            console.log(`🌐 Bot timezone: ${timezone}`);

            // ✅ Clear require cache for settings
            try {
                delete require.cache[require.resolve('../settings')];
            } catch (_) {}

            // ✅ Delay to ensure message is sent
            await new Promise(resolve => setTimeout(resolve, 2000));

            // ✅ Exit process (panel auto-restarts)
            process.exit(0);

        } catch (error) {
            console.error('❌ Restart command error:', error.message);
            await sock.sendMessage(chatId, {
                text: '❌ Failed to restart bot. Please restart manually.',
                ...getContextInfo()
            }, { quoted: message });
        }
    }
};