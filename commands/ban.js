//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                             𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓                                                                                                     //
//                                                                  𝐕 : 1.0.0                                                                                                             //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2026                                                                                                        //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//* 
//  * command : ban
//  * description : Globally ban a user from using the bot (Owner only)
//  * Credit To  DEX SHYAM TECH
// ⛥┌┤
// */

const fs = require('fs');
const path = require('path');
const settings = require('../settings');

// ========== BANNED FILE PATHS ==========
const DATA_DIR = path.join(__dirname, '../data');
const BANNED_FILE = path.join(DATA_DIR, 'banned.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ========== ATOMIC SAVE (temp + rename) ==========
function saveDataAtomic(file, data) {
    try {
        const tempFile = file + '.tmp';
        fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
        fs.renameSync(tempFile, file);
        return true;
    } catch (error) {
        console.error(`❌ Error saving ${file}:`, error.message);
        try { fs.unlinkSync(file + '.tmp'); } catch (_) {}
        return false;
    }
}

// ========== SAFE LOAD ==========
function loadBannedUsers() {
    try {
        if (fs.existsSync(BANNED_FILE)) {
            const raw = fs.readFileSync(BANNED_FILE, 'utf8');
            const data = JSON.parse(raw);
            return Array.isArray(data) ? data : [];
        }
    } catch (error) {
        console.error('⚠️ Error loading banned.json, resetting:', error.message);
        saveDataAtomic(BANNED_FILE, []);
    }
    return [];
}

// ========== CONTEXT INFO (Dynamic from settings) ==========
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

module.exports = {
    name: 'ban',
    category: 'Admin',
    description: 'Globally ban a user from using the bot (Owner only)',
    groupOnly: false,
    ownerOnly: true, // ✅ Only bot owner can use

    execute: async (sock, message, args, senderId, chatId) => {
        try {
            // ✅ Get owner JID
            const ownerJid = settings.ownerNumber.includes('@')
                ? settings.ownerNumber
                : `${settings.ownerNumber}@s.whatsapp.net`;

            // ✅ Double-check owner (extra security)
            const isActuallyOwner = senderId === ownerJid || senderId === sock.user.id;
            if (!isActuallyOwner) {
                await sock.sendMessage(chatId, {
                    text: '❌ This command is exclusively for the bot owner!',
                    ...getContextInfo()
                }, { quoted: message });
                return;
            }

            // ✅ Extract target user (mention or quoted)
            let userToBan = null;

            // Check for mentioned users
            if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
                userToBan = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
            }
            // Check for replied message
            else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
                userToBan = message.message.extendedTextMessage.contextInfo.participant;
            }

            if (!userToBan) {
                await sock.sendMessage(chatId, {
                    text: '⚠️ Please mention the user or reply to their message to ban!\nExample: `.ban @user`',
                    ...getContextInfo()
                }, { quoted: message });
                return;
            }

            // 🛡️ PROTECT: Cannot ban owner
            if (userToBan === ownerJid || userToBan === ownerJid.replace('@s.whatsapp.net', '@lid')) {
                await sock.sendMessage(chatId, {
                    text: '🚫 You cannot ban the bot owner!',
                    ...getContextInfo()
                }, { quoted: message });
                return;
            }

            // 🛡️ PROTECT: Cannot ban the bot itself
            try {
                const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                if (userToBan === botId || userToBan === botId.replace('@s.whatsapp.net', '@lid')) {
                    await sock.sendMessage(chatId, {
                        text: '😅 You cannot ban the bot itself!',
                        ...getContextInfo()
                    }, { quoted: message });
                    return;
                }
            } catch (_) {}

            // ✅ Load current banned list
            let bannedUsers = loadBannedUsers();

            if (bannedUsers.includes(userToBan)) {
                await sock.sendMessage(chatId, {
                    text: `ℹ️ @${userToBan.split('@')[0]} is already banned.`,
                    mentions: [userToBan],
                    ...getContextInfo()
                }, { quoted: message });
                return;
            }

            // ✅ Add user to banned list (atomic save)
            bannedUsers.push(userToBan);
            if (saveDataAtomic(BANNED_FILE, bannedUsers)) {
                await sock.sendMessage(chatId, {
                    text: `✅ *USER BANNED!*\n\n@${userToBan.split('@')[0]} has been globally banned from using the bot.\n\n🛡️ They can no longer use any commands.`,
                    mentions: [userToBan],
                    ...getContextInfo()
                }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, {
                    text: '❌ Failed to ban user. Please try again.',
                    ...getContextInfo()
                }, { quoted: message });
            }
        } catch (error) {
            console.error('❌ Ban command error:', error.message);
            await sock.sendMessage(chatId, {
                text: '❌ An error occurred while banning the user. Please try again.',
                ...getContextInfo()
            }, { quoted: message });
        }
    }
};