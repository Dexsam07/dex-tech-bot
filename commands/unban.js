//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                             𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓                                                                                                     //
//                                                                  𝐕 : 1.0.0                                                                                                             //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2026                                                                                                        //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//* 
//  * command : unban
//  * description : Unban a globally banned user (Owner only)
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
    name: 'unban',
    category: 'Admin',
    description: 'Unban a globally banned user (Owner only)',
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
            let userToUnban = null;

            if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
                userToUnban = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
            }
            else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
                userToUnban = message.message.extendedTextMessage.contextInfo.participant;
            }

            if (!userToUnban) {
                await sock.sendMessage(chatId, {
                    text: '⚠️ Please mention the user or reply to their message to unban!\nExample: `.unban @user`',
                    ...getContextInfo()
                }, { quoted: message });
                return;
            }

            // ✅ Load current banned list
            let bannedUsers = loadBannedUsers();

            if (!bannedUsers.includes(userToUnban)) {
                await sock.sendMessage(chatId, {
                    text: `ℹ️ @${userToUnban.split('@')[0]} is not banned.`,
                    mentions: [userToUnban],
                    ...getContextInfo()
                }, { quoted: message });
                return;
            }

            // ✅ Remove user from banned list (atomic save)
            const updatedList = bannedUsers.filter(id => id !== userToUnban);
            if (saveDataAtomic(BANNED_FILE, updatedList)) {
                await sock.sendMessage(chatId, {
                    text: `✅ *USER UNBANNED!*\n\n@${userToUnban.split('@')[0]} can now use the bot again globally.`,
                    mentions: [userToUnban],
                    ...getContextInfo()
                }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, {
                    text: '❌ Failed to unban user. Please try again.',
                    ...getContextInfo()
                }, { quoted: message });
            }
        } catch (error) {
            console.error('❌ Unban command error:', error.message);
            await sock.sendMessage(chatId, {
                text: '❌ An error occurred while unbanning the user. Please try again.',
                ...getContextInfo()
            }, { quoted: message });
        }
    }
};