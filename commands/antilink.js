//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                             𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓                                                                                                     //
//                                                                  𝐕 : 1.0.0                                                                                                             //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2026                                                                                                        //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//* 
//  * command : antilink
//  * description : Auto-delete WhatsApp group links
//  * Credit To  DEX SHYAM TECH
// ⛥┌┤
// */

const fs = require('fs');
const path = require('path');
const settings = require('../settings');

// ========== FILE PATHS ==========
const DATA_DIR = path.join(__dirname, '../data');
const ANTILINK_FILE = path.join(DATA_DIR, 'antilink.json');

// ========== ATOMIC SAVE ==========
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
function getAntilinkSettings() {
    try {
        if (fs.existsSync(ANTILINK_FILE)) {
            const raw = fs.readFileSync(ANTILINK_FILE, 'utf8');
            return JSON.parse(raw);
        }
    } catch (e) {
        console.error('⚠️ Antilink file corrupt, resetting:', e.message);
        saveDataAtomic(ANTILINK_FILE, { groups: {} });
    }
    return { groups: {} };
}

function saveAntilinkSettings(data) {
    return saveDataAtomic(ANTILINK_FILE, data);
}

// ========== CONTEXT INFO ==========
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

// ========== MAIN COMMAND HANDLER ==========
async function handleAntilinkCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message) {
    try {
        // ✅ Check if it's a group
        if (!chatId.endsWith('@g.us')) {
            await sock.sendMessage(chatId, {
                text: '❌ This command can only be used in groups.',
                ...getContextInfo()
            }, { quoted: message });
            return;
        }

        // ✅ Check if sender is admin (using isSenderAdmin passed from main.js)
        const ownerJid = settings.ownerNumber.includes('@')
            ? settings.ownerNumber
            : `${settings.ownerNumber}@s.whatsapp.net`;
        const isOwner = senderId === ownerJid || senderId === sock.user.id;

        if (!isSenderAdmin && !isOwner) {
            await sock.sendMessage(chatId, {
                text: '❌ Only group admins or bot owner can use this command.',
                ...getContextInfo()
            }, { quoted: message });
            return;
        }

        // ✅ Check if bot is admin (required for deleting messages)
        let isBotAdmin = false;
        try {
            const metadata = await sock.groupMetadata(chatId);
            const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            const participant = metadata.participants.find(p => p.id === botJid);
            isBotAdmin = participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
        } catch (_) {}

        // ✅ Extract arguments from userMessage (commandWithoutPrefix)
        const parts = userMessage.trim().split(/\s+/);
        const action = parts.length > 1 ? parts[1].toLowerCase() : null;

        if (!action) {
            const data = getAntilinkSettings();
            const groupStatus = data.groups?.[chatId] || false;
            const botStatus = isBotAdmin ? '✅ Bot is admin' : '❌ Bot is NOT admin (required for deleting links)';
            await sock.sendMessage(chatId, {
                text: `📋 *Antilink Status*\n\n` +
                      `🔹 Group: ${chatId}\n` +
                      `🔹 Status: ${groupStatus ? '🟢 ENABLED' : '🔴 DISABLED'}\n` +
                      `🔹 Bot Admin: ${botStatus}\n\n` +
                      `📖 Usage: .antilink on/off`,
                ...getContextInfo()
            }, { quoted: message });
            return;
        }

        if (action === 'on') {
            if (!isBotAdmin) {
                await sock.sendMessage(chatId, {
                    text: '⚠️ Bot must be admin to delete links. Please make bot admin first.',
                    ...getContextInfo()
                }, { quoted: message });
                return;
            }
            const data = getAntilinkSettings();
            if (!data.groups) data.groups = {};
            data.groups[chatId] = true;
            if (saveAntilinkSettings(data)) {
                await sock.sendMessage(chatId, {
                    text: `✅ *Antilink ENABLED* for this group.\n🔗 Links will be automatically deleted.`,
                    ...getContextInfo()
                }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, { text: '❌ Failed to enable antilink.', ...getContextInfo() }, { quoted: message });
            }
        } else if (action === 'off') {
            const data = getAntilinkSettings();
            if (data.groups) {
                data.groups[chatId] = false;
                // Optionally delete the entry
                // delete data.groups[chatId];
            }
            if (saveAntilinkSettings(data)) {
                await sock.sendMessage(chatId, {
                    text: `✅ *Antilink DISABLED* for this group.\nLinks will no longer be deleted.`,
                    ...getContextInfo()
                }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, { text: '❌ Failed to disable antilink.', ...getContextInfo() }, { quoted: message });
            }
        } else {
            await sock.sendMessage(chatId, {
                text: `❌ Invalid argument. Use:\n.antilink on\n.antilink off`,
                ...getContextInfo()
            }, { quoted: message });
        }
    } catch (error) {
        console.error('❌ Antilink command error:', error.message);
        await sock.sendMessage(chatId, {
            text: '❌ Error processing antilink command. Please try again.',
            ...getContextInfo()
        }, { quoted: message });
    }
}

// ========== OPTIONAL: Handle link detection (auto-delete) ==========
async function handleLinkDetection(sock, message) {
    try {
        // This function can be called from main.js or lib/antilink.js
        // It checks if antilink is enabled for the group and deletes links.
        // We'll implement a simple version or you can rely on the lib/antilink.js
        // Currently, main.js uses Antilink from lib/antilink, so we don't need to implement here.
        // But to be safe, we can export a placeholder.
        return false;
    } catch (e) {
        return false;
    }
}

module.exports = { handleAntilinkCommand, handleLinkDetection };