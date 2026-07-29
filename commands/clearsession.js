//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                             𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓                                                                                                     //
//                                                                  𝐕 : 1.0.0                                                                                                             //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2026                                                                                                        //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//* 
//  * command : clearsession
//  * description : Delete all session files except creds.json (Owner only)
//  * Credit To  DEX SHYAM TECH
// ⛥┌┤
// */

const fs = require('fs');
const path = require('path');
const settings = require('../settings');
const isOwnerOrSudo = require('../lib/isOwner');

// ========== CONTEXT INFO (Dynamic from settings) ==========
function getContextInfo() {
    return {
        contextInfo: {
            forwardingScore: 1, // ✅ Reduced to 1 (was 999 - high spam risk)
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: settings.newsletterJid || '120363406449026172@newsletter',
                newsletterName: settings.newsletterName || 'Dex Shyam Tech',
                serverMessageId: -1
            }
        }
    };
}

// ========== COMMAND ==========
module.exports = {
    name: 'clearsession',
    category: 'Owner',
    description: 'Delete all session files except creds.json (Owner only)',
    groupOnly: false,
    ownerOnly: true,

    execute: async (sock, message, args, senderId, chatId) => {
        try {
            // ✅ Owner check (extra security)
            const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
            if (!isOwner && !message.key.fromMe) {
                await sock.sendMessage(chatId, {
                    text: '❌ This command is only for the bot owner!',
                    ...getContextInfo()
                }, { quoted: message });
                return;
            }

            // ✅ Define session directory
            const sessionDir = path.join(__dirname, '../session');

            if (!fs.existsSync(sessionDir)) {
                await sock.sendMessage(chatId, {
                    text: '⚠️ Session directory does not exist.',
                    ...getContextInfo()
                }, { quoted: message });
                return;
            }

            // ✅ Send initial status
            await sock.sendMessage(chatId, {
                text: '🔍 Cleaning up session files (keeping creds.json)...',
                ...getContextInfo()
            }, { quoted: message });

            // ✅ Read all files
            const files = fs.readdirSync(sessionDir);
            let deletedCount = 0;
            let keptCount = 0;
            let errors = [];
            let stats = { appStateSync: 0, preKey: 0 };

            for (const file of files) {
                const filePath = path.join(sessionDir, file);

                // ⚠️ Keep creds.json (the main auth file)
                if (file === 'creds.json') {
                    keptCount++;
                    continue;
                }

                // Count file types
                if (file.startsWith('app-state-sync-')) stats.appStateSync++;
                if (file.startsWith('pre-key-')) stats.preKey++;

                // ✅ Delete the file
                try {
                    fs.unlinkSync(filePath);
                    deletedCount++;
                } catch (err) {
                    errors.push(`❌ ${file}: ${err.message}`);
                }
            }

            // ✅ Build response
            let response = `✅ *SESSION CLEANUP COMPLETE*\n\n` +
                           `📊 *Statistics:*\n` +
                           `• Files deleted: ${deletedCount}\n` +
                           `• Files kept (creds.json): ${keptCount}\n` +
                           `• App state sync files: ${stats.appStateSync}\n` +
                           `• Pre-key files: ${stats.preKey}\n`;

            if (errors.length > 0) {
                response += `\n⚠️ *Errors:*\n${errors.join('\n')}`;
            }

            response += `\n\n🔄 Please restart the bot to regenerate fresh session keys.\n` +
                        `🤖 ${settings.botName || '𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓'}`;

            await sock.sendMessage(chatId, {
                text: response,
                ...getContextInfo()
            }, { quoted: message });

        } catch (error) {
            console.error('❌ Clearsession command error:', error.message);
            await sock.sendMessage(chatId, {
                text: '❌ Failed to clear session files. Please try again.',
                ...getContextInfo()
            }, { quoted: message });
        }
    }
};