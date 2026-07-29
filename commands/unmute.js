//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                             𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓                                                                                                     //
//                                                                  𝐕 : 1.0.0                                                                                                             //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2026                                                                                                        //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//* 
//  * command : unmute
//  * description : Unmute a user in the group (Admin only)
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
            return JSON.parse(raw);
        }
    } catch (error) {
        console.error('⚠️ Error loading mute.json, resetting:', error.message);
        saveDataAtomic(MUTE_FILE, {});
    }
    return {};
}

// ========== UNMUTE USER (INTERNAL) ==========
function unmuteUser(groupId, userId) {
    const muteData = loadMuteData();
    if (muteData[groupId] && muteData[groupId][userId]) {
        delete muteData[groupId][userId];
        // Clean empty group
        if (Object.keys(muteData[groupId]).length === 0) {
            delete muteData[groupId];
        }
        saveDataAtomic(MUTE_FILE, muteData);
        return true;
    }
    return false;
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

// ========== EXPORT COMMAND ==========
module.exports = {
    name: 'unmute',
    category: 'Admin',
    description: 'Unmute a user in the group (Admin only)',
    groupOnly: true,
    ownerOnly: false,

    execute: async (sock, message, args, senderId, chatId) => {
        try {
            // ✅ Check if sender is admin or owner
            let isSenderAdmin = false;
            try {
                const metadata = await sock.groupMetadata(chatId);
                const participant = metadata.participants.find(p => p.id === senderId);
                isSenderAdmin = participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
            } catch (_) {}

            const ownerJid = settings.ownerNumber.includes('@')
                ? settings.ownerNumber
                : `${settings.ownerNumber}@s.whatsapp.net`;
            const isOwner = senderId === ownerJid || senderId === sock.user.id;

            if (!isSenderAdmin && !isOwner) {
                await sock.sendMessage(chatId, {
                    text: '❌ Only group admins or bot owner can unmute users!',
                    ...getContextInfo()
                }, { quoted: message });
                return;
            }

            // ✅ Extract target user (mention or quoted)
            let userToUnmute = null;
            if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
                userToUnmute = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
            }
            else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
                userToUnmute = message.message.extendedTextMessage.contextInfo.participant;
            }

            if (!userToUnmute) {
                await sock.sendMessage(chatId, {
                    text: '⚠️ Please mention the user or reply to their message to unmute.\nExample: `.unmute @user`',
                    ...getContextInfo()
                }, { quoted: message });
                return;
            }

            // ✅ Check if user is actually muted
            const muteData = loadMuteData();
            if (!muteData[chatId] || !muteData[chatId][userToUnmute]) {
                await sock.sendMessage(chatId, {
                    text: `ℹ️ @${userToUnmute.split('@')[0]} is not muted in this group.`,
                    mentions: [userToUnmute],
                    ...getContextInfo()
                }, { quoted: message });
                return;
            }

            // ✅ Perform unmute
            const success = unmuteUser(chatId, userToUnmute);
            if (success) {
                await sock.sendMessage(chatId, {
                    text: `🔊 *USER UNMUTED!*\n\n@${userToUnmute.split('@')[0]} can now send messages again in this group.`,
                    mentions: [userToUnmute],
                    ...getContextInfo()
                }, { quoted: message });

                // Optional: DM the user
                try {
                    await sock.sendMessage(userToUnmute, {
                        text: `🔊 You have been unmuted in the group *${chatId}*.`,
                        ...getContextInfo()
                    });
                } catch (_) { /* ignore if DMs closed */ }
            } else {
                await sock.sendMessage(chatId, {
                    text: '❌ Failed to unmute user. Please try again.',
                    ...getContextInfo()
                }, { quoted: message });
            }
        } catch (error) {
            console.error('❌ Unmute command error:', error.message);
            await sock.sendMessage(chatId, {
                text: '❌ An error occurred while unmuting the user. Please try again.',
                ...getContextInfo()
            }, { quoted: message });
        }
    }
};

// ========== EXPOSE INTERNAL FUNCTIONS FOR MAIN HANDLER ==========
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