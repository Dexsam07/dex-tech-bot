//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                             𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓                                                                                                     //
//                                                                  𝐕 : 1.0.0                                                                                                             //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2026                                                                                                        //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//* 
//  * command : warn
//  * description : Warn a user (3 warnings = auto-kick) (Admin only)
//  * Credit To  DEX SHYAM TECH
// ⛥┌┤
// */

const fs = require('fs');
const path = require('path');
const settings = require('../settings');

const DATA_DIR = path.join(__dirname, '../data');
const WARN_FILE = path.join(DATA_DIR, 'warnings.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

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

function loadWarnings() {
    try {
        if (fs.existsSync(WARN_FILE)) {
            const raw = fs.readFileSync(WARN_FILE, 'utf8');
            return JSON.parse(raw);
        }
    } catch (e) { console.error('⚠️ Warnings file corrupt, resetting:', e.message); saveDataAtomic(WARN_FILE, {}); }
    return {};
}

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
    name: 'warn',
    category: 'Admin',
    description: 'Warn a user (3 warnings = auto-kick)',
    groupOnly: true,
    ownerOnly: false,
    execute: async (sock, message, args, senderId, chatId) => {
        try {
            // Check sender admin
            let isSenderAdmin = false;
            try {
                const meta = await sock.groupMetadata(chatId);
                const p = meta.participants.find(p => p.id === senderId);
                isSenderAdmin = p && (p.admin === 'admin' || p.admin === 'superadmin');
            } catch (_) {}
            const ownerJid = settings.ownerNumber.includes('@') ? settings.ownerNumber : `${settings.ownerNumber}@s.whatsapp.net`;
            const isOwner = senderId === ownerJid || senderId === sock.user.id;
            if (!isSenderAdmin && !isOwner) {
                await sock.sendMessage(chatId, { text: '❌ Only admins or owner can warn!', ...getContextInfo() }, { quoted: message });
                return;
            }

            // Target user
            let userToWarn = null;
            if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) userToWarn = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
            else if (message.message?.extendedTextMessage?.contextInfo?.participant) userToWarn = message.message.extendedTextMessage.contextInfo.participant;

            if (!userToWarn) {
                await sock.sendMessage(chatId, { text: '⚠️ Mention or reply to a user to warn.', ...getContextInfo() }, { quoted: message });
                return;
            }

            // Prevent self-warn / owner / bot
            if (userToWarn === senderId) { await sock.sendMessage(chatId, { text: '😅 You cannot warn yourself!', ...getContextInfo() }, { quoted: message }); return; }
            if (userToWarn === ownerJid) { await sock.sendMessage(chatId, { text: '🚫 Cannot warn the owner!', ...getContextInfo() }, { quoted: message }); return; }
            try { const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'; if (userToWarn === botId) { await sock.sendMessage(chatId, { text: '😅 Cannot warn the bot!', ...getContextInfo() }, { quoted: message }); return; } } catch (_) {}

            // Load and update warnings
            const warns = loadWarnings();
            if (!warns[chatId]) warns[chatId] = {};
            if (!warns[chatId][userToWarn]) warns[chatId][userToWarn] = 0;
            warns[chatId][userToWarn]++;

            const count = warns[chatId][userToWarn];
            saveDataAtomic(WARN_FILE, warns);

            const maxWarns = 3;
            let msg = `⚠️ *WARNING!*\n\n@${userToWarn.split('@')[0]} has been warned.\n📊 Warnings: ${count}/${maxWarns}`;

            if (count >= maxWarns) {
                // Auto-kick
                try {
                    await sock.groupParticipantsUpdate(chatId, [userToWarn], 'remove');
                    msg += `\n\n🚫 User has been *KICKED* due to exceeding ${maxWarns} warnings!`;
                    // Reset warnings after kick
                    delete warns[chatId][userToWarn];
                    saveDataAtomic(WARN_FILE, warns);
                } catch (e) {
                    msg += `\n\n❌ Could not kick user. Please check bot permissions.`;
                }
            } else {
                msg += `\n\n💡 ${maxWarns - count} more warning(s) will result in a kick.`;
            }

            await sock.sendMessage(chatId, { text: msg, mentions: [userToWarn], ...getContextInfo() }, { quoted: message });
        } catch (error) {
            console.error('❌ Warn error:', error);
            await sock.sendMessage(chatId, { text: '❌ Failed to warn user.', ...getContextInfo() }, { quoted: message });
        }
    }
};