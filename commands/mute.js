//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                             𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓                                                                                                     //
//                                                                  𝐕 : 1.0.0                                                                                                             //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2026                                                                                                        //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//* 
//  * command : mute
//  * description : Mute a user in the group (Admin only)
//  * Credit To  DEX SHYAM TECH
// ⛥┌┤
// */

const fs = require('fs');
const path = require('path');
const settings = require('../settings');

// ========== MUTE FILE PATHS ==========
const DATA_DIR = path.join(__dirname, '../data');
const MUTE_FILE = path.join(DATA_DIR, 'mute.json');

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
function loadMuteData() {
    try {
        if (fs.existsSync(MUTE_FILE)) {
            const raw = fs.readFileSync(MUTE_FILE, 'utf8');
            const data = JSON.parse(raw);
            // Ensure structure: { groupId: { userId: { reason: '', until: timestamp } } }
            if (typeof data === 'object' && data !== null) {
                return data;
            }
        }
    } catch (error) {
        console.error('⚠️ Error loading mute.json, resetting:', error.message);
        saveDataAtomic(MUTE_FILE, {});
    }
    return {};
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

// ========== INTERNAL: Mute a user (used by command and auto-unmute) ==========
function muteUser(groupId, userId, durationMinutes = null) {
    const muteData = loadMuteData();
    if (!muteData[groupId]) muteData[groupId] = {};

    const until = durationMinutes ? Date.now() + (durationMinutes * 60 * 1000) : null;
    muteData[groupId][userId] = {
        reason: 'Muted by admin',
        until: until
    };

    saveDataAtomic(MUTE_FILE, muteData);

    // If duration is set, auto-unmute after that time
    if (durationMinutes) {
        setTimeout(() => {
            unmuteUser(groupId, userId);
        }, durationMinutes * 60 * 1000);
    }
}

// ========== INTERNAL: Unmute a user ==========
function unmuteUser(groupId, userId) {
    const muteData = loadMuteData();
    if (muteData[groupId] && muteData[groupId][userId]) {
        delete muteData[groupId][userId];
        // Clean empty groups
        if (Object.keys(muteData[groupId]).length === 0) {
            delete muteData[groupId];
        }
        saveDataAtomic(MUTE_FILE, muteData);
    }
}

// ========== EXPORT COMMAND ==========
module.exports = {
    name: 'mute',
    category: 'Admin',
    description: 'Mute a user in the group (Admin only)',
    groupOnly: true,
    ownerOnly: false,

    execute: async (sock, message, args, senderId, chatId) => {
        try {
            // ✅ Check if bot is admin in group
            let isBotAdmin = false;
            try {
                const metadata = await sock.groupMetadata(chatId);
                const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                const participant = metadata.participants.find(p => p.id === botId);
                isBotAdmin = participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
            } catch (_) {}

            if (!isBotAdmin) {
                await sock.sendMessage(chatId, {
                    text: '❌ Bot must be an admin to mute users!',
                    ...getContextInfo()
                }, { quoted: message });
                return;
            }

            // ✅ Check if sender is admin in group
            let isSenderAdmin = false;
            try {
                const metadata = await sock.groupMetadata(chatId);
                const participant = metadata.participants.find(p => p.id === senderId);
                isSenderAdmin = participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
            } catch (_) {}

            // Allow owner to mute even if not admin (optional)
            const ownerJid = settings.ownerNumber.includes('@')
                ? settings.ownerNumber
                : `${settings.ownerNumber}@s.whatsapp.net`;
            const isOwner = senderId === ownerJid || senderId === sock.user.id;

            if (!isSenderAdmin && !isOwner) {
                await sock.sendMessage(chatId, {
                    text: '❌ Only group admins or bot owner can mute users!',
                    ...getContextInfo()
                }, { quoted: message });
                return;
            }

            // ✅ Extract target user (mention or quoted)
            let userToMute = null;
            if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
                userToMute = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
            }
            else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
                userToMute = message.message.extendedTextMessage.contextInfo.participant;
            }

            if (!userToMute) {
                await sock.sendMessage(chatId, {
                    text: '⚠️ Please mention the user or reply to their message to mute.\nExample: `.mute @user 5` (mute for 5 minutes)',
                    ...getContextInfo()
                }, { quoted: message });
                return;
            }

            // 🛡️ Prevent muting owner/bot
            if (userToMute === ownerJid || userToMute === ownerJid.replace('@s.whatsapp.net', '@lid')) {
                await sock.sendMessage(chatId, {
                    text: '🚫 You cannot mute the bot owner!',
                    ...getContextInfo()
                }, { quoted: message });
                return;
            }

            try {
                const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                if (userToMute === botId || userToMute === botId.replace('@s.whatsapp.net', '@lid')) {
                    await sock.sendMessage(chatId, {
                        text: '😅 You cannot mute the bot itself!',
                        ...getContextInfo()
                    }, { quoted: message });
                    return;
                }
            } catch (_) {}

            // ✅ Parse duration from args (optional)
            let durationMinutes = null;
            let reason = 'Muted by admin';
            if (args.length > 0) {
                const possibleDuration = parseInt(args[0]);
                if (!isNaN(possibleDuration) && possibleDuration > 0) {
                    durationMinutes = possibleDuration;
                    // If there are more args, treat as reason
                    if (args.length > 1) {
                        reason = args.slice(1).join(' ');
                    }
                } else {
                    reason = args.join(' ');
                }
            }

            // ✅ Mute the user
            const muteData = loadMuteData();
            if (muteData[chatId] && muteData[chatId][userToMute]) {
                // Already muted
                const existing = muteData[chatId][userToMute];
                const isPermanent = existing.until === null;
                let status = isPermanent ? 'permanently' : `until ${new Date(existing.until).toLocaleString()}`;
                await sock.sendMessage(chatId, {
                    text: `ℹ️ @${userToMute.split('@')[0]} is already muted (${status}).`,
                    mentions: [userToMute],
                    ...getContextInfo()
                }, { quoted: message });
                return;
            }

            // Perform mute
            muteUser(chatId, userToMute, durationMinutes);

            const durationText = durationMinutes ? `for ${durationMinutes} minute(s)` : 'permanently';
            const muteMessage = `🔇 *USER MUTED!*\n\n@${userToMute.split('@')[0]} has been muted ${durationText}.\nReason: ${reason}\n\nThey cannot send messages in this group until unmuted.`;

            await sock.sendMessage(chatId, {
                text: muteMessage,
                mentions: [userToMute],
                ...getContextInfo()
            }, { quoted: message });

            // Optional: Notify the muted user privately (if bot can DM)
            try {
                await sock.sendMessage(userToMute, {
                    text: `🔇 You have been muted in the group *${chatId}* ${durationText}.\nReason: ${reason}`,
                    ...getContextInfo()
                });
            } catch (_) { /* ignore if user has DMs closed */ }

        } catch (error) {
            console.error('❌ Mute command error:', error.message);
            await sock.sendMessage(chatId, {
                text: '❌ An error occurred while muting the user. Please try again.',
                ...getContextInfo()
            }, { quoted: message });
        }
    }
};

// ========== EXPOSE INTERNAL FUNCTIONS FOR UNMUTE & MAIN HANDLER ==========
module.exports.unmuteUser = unmuteUser;
module.exports.loadMuteData = loadMuteData;
module.exports.isMuted = (groupId, userId) => {
    const data = loadMuteData();
    if (data[groupId] && data[groupId][userId]) {
        const entry = data[groupId][userId];
        if (entry.until && entry.until < Date.now()) {
            // Expired, auto-unmute
            unmuteUser(groupId, userId);
            return false;
        }
        return true;
    }
    return false;
};