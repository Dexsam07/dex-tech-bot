//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                             𝐃𝐄𝐗 𝐓𝐄𝐂𝐇  𝐁𝐎𝐓                                                                                                     //
//                                                                  𝐕 : 1.0.0                                                                                                             //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2026                                                                                                        //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//* 
//  * file : antidelete.js (WITH DEBUG LOGS)
//  * description : Recovers deleted messages & statuses
//  * Credit To  DEX SHYAM TECH
// ⛥┌┤
// */
const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { writeFile } = require('fs/promises');
const isOwnerOrSudo = require('../lib/isOwner');
const settings = require('../settings');

const CONFIG_PATH = path.join(__dirname, '../data/antidelete.json');
const TEMP_MEDIA_DIR = path.join(__dirname, '../tmp/antidelete');
const messageStore = new Map();
const statusStore = new Map();

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(TEMP_MEDIA_DIR)) fs.mkdirSync(TEMP_MEDIA_DIR, { recursive: true });

// Auto-clean temp files every 10 seconds
setInterval(() => {
    try {
        const files = fs.readdirSync(TEMP_MEDIA_DIR);
        const now = Date.now();
        for (const file of files) {
            const fp = path.join(TEMP_MEDIA_DIR, file);
            if (now - fs.statSync(fp).mtimeMs > 30000) fs.unlinkSync(fp);
        }
    } catch (e) {}
}, 10000);

// ========== DYNAMIC CONTEXT INFO ==========
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

// ═══════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════

function loadConfig() {
    try { if (fs.existsSync(CONFIG_PATH)) return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')); } catch (e) {}
    return { enabled: false, statusEnabled: false, statusRoute: 'dm', route: { private: 'chat', group: 'chat' } };
}

function saveConfig(config) {
    try { fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2)); } catch (e) {}
}

// ═══════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════

function formatTimestamp() {
    return new Date().toLocaleString('en-US', {
        timeZone: settings.timezone || 'Asia/Kolkata',
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function getMessageType(msg) {
    if (!msg) return { type: 'UNKNOWN', emoji: '❓' };
    if (msg.conversation || msg.extendedTextMessage) return { type: 'TEXT', emoji: '💬' };
    if (msg.imageMessage) return { type: 'IMAGE', emoji: '📷' };
    if (msg.videoMessage) return { type: 'VIDEO', emoji: '🎥' };
    if (msg.audioMessage) return { type: msg.audioMessage.ptt ? 'VOICE NOTE' : 'AUDIO', emoji: msg.audioMessage.ptt ? '🎤' : '🎵' };
    if (msg.stickerMessage) return { type: 'STICKER', emoji: '🎨' };
    if (msg.documentMessage) return { type: 'DOCUMENT', emoji: '📄' };
    return { type: 'UNKNOWN', emoji: '❓' };
}

// ═══════════════════════════════════════
// MESSAGE STORAGE
// ═══════════════════════════════════════

async function storeMessage(sock, message) {
    try {
        const config = loadConfig();
        if (!message.key?.id) return;

        const messageId = message.key.id;
        const sender = message.key.participant || message.key.remoteJid;
        const isGroup = message.key.remoteJid.endsWith('@g.us');
        const isStatus = message.key.remoteJid === 'status@broadcast';
        const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';

        // ✅ DEBUG LOG: Check if message is being considered
        console.log(`📦 [STORAGE CHECK] ID: ${messageId} | isStatus: ${isStatus} | enabled: ${config.enabled} | statusEnabled: ${config.statusEnabled}`);

        if (isStatus && !config.statusEnabled) {
            console.log(`⏭️ [STORAGE SKIP] Status disabled`);
            return;
        }
        if (!isStatus && !config.enabled) {
            console.log(`⏭️ [STORAGE SKIP] Message recovery disabled`);
            return;
        }
        if (isStatus && sender === botJid) return;

        let groupName = '';
        if (isGroup) {
            try {
                const metadata = await sock.groupMetadata(message.key.remoteJid);
                groupName = metadata.subject || 'Group';
            } catch (e) {}
        }

        let content = '', mediaType = '', mediaPath = '', fileName = '';
        const msg = message.message || {};
        const msgType = getMessageType(msg);

        if (msg.conversation) {
            content = msg.conversation;
        } else if (msg.extendedTextMessage?.text) {
            content = msg.extendedTextMessage.text;
        } else if (msg.imageMessage) {
            mediaType = 'image';
            content = msg.imageMessage.caption || '';
            try {
                const stream = await downloadContentFromMessage(msg.imageMessage, 'image');
                const chunks = [];
                for await (const chunk of stream) chunks.push(chunk);
                mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.jpg`);
                await writeFile(mediaPath, Buffer.concat(chunks));
            } catch (err) {}
        } else if (msg.videoMessage) {
            mediaType = 'video';
            content = msg.videoMessage.caption || '';
            try {
                const stream = await downloadContentFromMessage(msg.videoMessage, 'video');
                const chunks = [];
                for await (const chunk of stream) chunks.push(chunk);
                mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.mp4`);
                await writeFile(mediaPath, Buffer.concat(chunks));
            } catch (err) {}
        } else if (msg.audioMessage) {
            mediaType = msg.audioMessage.ptt ? 'voice' : 'audio';
            try {
                const stream = await downloadContentFromMessage(msg.audioMessage, 'audio');
                const chunks = [];
                for await (const chunk of stream) chunks.push(chunk);
                mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.ogg`);
                await writeFile(mediaPath, Buffer.concat(chunks));
            } catch (err) {}
        } else if (msg.stickerMessage) {
            mediaType = 'sticker';
            try {
                const stream = await downloadContentFromMessage(msg.stickerMessage, 'sticker');
                const chunks = [];
                for await (const chunk of stream) chunks.push(chunk);
                mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.webp`);
                await writeFile(mediaPath, Buffer.concat(chunks));
            } catch (err) {}
        } else if (msg.documentMessage) {
            mediaType = 'document';
            content = msg.documentMessage.caption || '';
            fileName = msg.documentMessage.fileName || 'document';
            try {
                const stream = await downloadContentFromMessage(msg.documentMessage, 'document');
                const chunks = [];
                for await (const chunk of stream) chunks.push(chunk);
                mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}_${fileName}`);
                await writeFile(mediaPath, Buffer.concat(chunks));
            } catch (err) {}
        }

        const storeData = {
            id: messageId,
            content,
            mediaType,
            mediaPath,
            fileName,
            sender,
            isGroup,
            isStatus,
            group: message.key.remoteJid,
            groupName,
            remoteJid: message.key.remoteJid,
            timestamp: Date.now(),
            type: msgType.type,
            emoji: msgType.emoji
        };

        if (isStatus) {
            statusStore.set(messageId, storeData);
            console.log(`✅ [STORED STATUS] ${messageId}`);
        } else {
            messageStore.set(messageId, storeData);
            console.log(`✅ [STORED MSG] ${messageId} | Type: ${storeData.type}`);
        }
    } catch (err) {
        console.error('❌ Store error:', err.message);
    }
}

// ═══════════════════════════════════════
// MESSAGE RECOVERY
// ═══════════════════════════════════════

async function handleMessageRevocation(sock, revocationMessage) {
    try {
        const config = loadConfig();
        if (!config.enabled && !config.statusEnabled) return;

        const revokedKey = revocationMessage.message?.protocolMessage?.key;
        if (!revokedKey?.id) return;

        const messageId = revokedKey.id;
        console.log(`🔄 [REVOKE DETECTED] ID: ${messageId}`);

        const isBotDeleting = revocationMessage.key.fromMe === true;
        const rawDeleter = revocationMessage.key.participant || revocationMessage.key.remoteJid;
        const isStatus = revokedKey.remoteJid === 'status@broadcast';
        const isGroup = revokedKey.remoteJid?.endsWith('@g.us');

        let original = messageStore.get(messageId);
        if (!original) original = statusStore.get(messageId);
        
        if (!original) {
            console.log(`⚠️ [REVOKE MISS] No stored message found for ID: ${messageId}`);
            return;
        }

        console.log(`✅ [REVOKE FOUND] Recovering: ${original.type}`);

        if (isStatus && !config.statusEnabled) return;
        if (!isStatus && !config.enabled) return;

        const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const botName = settings.botName || 'Dex Shyam Tech';

        const deleterName = isBotDeleting ? `${botName} (Bot)` : `@${rawDeleter.split('@')[0]}`;
        const deleterMention = isBotDeleting ? botJid : rawDeleter;
        const senderName = `@${original.sender.split('@')[0]}`;
        const senderMention = original.sender;

        let targetChat;
        if (isStatus) {
            targetChat = config.statusRoute === 'owner' ? original.sender : botJid;
        } else if (isGroup) {
            targetChat = config.route.group === 'dm' ? botJid : original.remoteJid;
        } else {
            targetChat = config.route.private === 'dm' ? botJid : original.remoteJid;
        }

        console.log(`📍 [RECOVER TARGET] ${targetChat}`);

        const time = formatTimestamp();
        const chatType = isStatus ? 'Status' : isGroup ? `Group • ${original.groupName || 'Unknown'}` : 'Private';

        let recoveryText = `╭──❍「 *RECOVERED* 」❍\n`;
        recoveryText += `├• 👤 From: ${senderName}\n`;
        recoveryText += `├• 🗑️ By: ${deleterName}\n`;
        recoveryText += `├• ${original.emoji} Type: ${original.type}${original.content ? ' + caption' : ''}\n`;
        if (original.fileName) recoveryText += `├• 📎 File: ${original.fileName}\n`;
        recoveryText += `├• 🕒 Time: ${time}\n`;
        if (isStatus) recoveryText += `├• 📱 Source: Status\n`;
        recoveryText += `├• 📍 Chat: ${chatType}\n`;
        if (original.content) recoveryText += `├• 💬 "${original.content.substring(0, 100)}${original.content.length > 100 ? '...' : ''}"\n`;
        recoveryText += `╰───★─☆─♪♪─❍\n\n`;
        recoveryText += `╭──❍「 *${botName}* 」❍\n╰───★─☆─♪♪─❍`;

        const context = getContextInfo();

        if (original.mediaType && fs.existsSync(original.mediaPath)) {
            try {
                switch (original.mediaType) {
                    case 'image':
                        await sock.sendMessage(targetChat, {
                            image: { url: original.mediaPath },
                            caption: recoveryText,
                            mentions: [senderMention, deleterMention],
                            ...context
                        });
                        break;
                    case 'video':
                        await sock.sendMessage(targetChat, {
                            video: { url: original.mediaPath },
                            caption: recoveryText,
                            mentions: [senderMention, deleterMention],
                            ...context
                        });
                        break;
                    case 'document':
                        await sock.sendMessage(targetChat, {
                            document: { url: original.mediaPath },
                            fileName: original.fileName || 'document',
                            caption: recoveryText,
                            mentions: [senderMention, deleterMention],
                            ...context
                        });
                        break;
                    case 'audio':
                    case 'voice':
                        await sock.sendMessage(targetChat, {
                            audio: { url: original.mediaPath },
                            mimetype: original.mediaType === 'voice' ? 'audio/ogg; codecs=opus' : 'audio/mpeg',
                            ptt: original.mediaType === 'voice'
                        });
                        await sock.sendMessage(targetChat, {
                            text: recoveryText,
                            mentions: [senderMention, deleterMention],
                            ...context
                        });
                        break;
                    case 'sticker':
                        await sock.sendMessage(targetChat, {
                            sticker: { url: original.mediaPath },
                            ...context
                        });
                        await sock.sendMessage(targetChat, {
                            text: recoveryText,
                            mentions: [senderMention, deleterMention],
                            ...context
                        });
                        break;
                }
            } catch (err) { console.error('Media send error:', err); }
            try { fs.unlinkSync(original.mediaPath); } catch (err) {}
        } else {
            await sock.sendMessage(targetChat, {
                text: recoveryText,
                mentions: [senderMention, deleterMention],
                ...context
            });
        }

        console.log(`✅ Recovered ${original.type} → ${targetChat === botJid ? 'Bot DM' : 'Chat'}`);
        messageStore.delete(messageId);
        statusStore.delete(messageId);
    } catch (err) {
        console.error('❌ Recovery error:', err.message);
    }
}

// ═══════════════════════════════════════
// COMMAND HANDLER (Unchanged, but using dynamic channel)
// ═══════════════════════════════════════

async function handleAntideleteCommand(sock, chatId, message, args) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const isOwner = message.key.fromMe || await isOwnerOrSudo(senderId, sock, chatId);
        if (!isOwner) {
            await sock.sendMessage(chatId, {
                text: '❌ This command is only available for the owner!',
                ...getContextInfo()
            });
            return;
        }

        const config = loadConfig();
        if (!Array.isArray(args)) args = args ? [args] : [];
        const cmd = args[0]?.toLowerCase();

        if (!cmd) {
            await sock.sendMessage(chatId, {
                text: `🛡️ *ANTI-DELETE SETTINGS*\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `${config.enabled ? '🟢' : '🔴'} *Messages:* ${config.enabled ? '✅ ON' : '❌ OFF'}\n` +
                      `${config.statusEnabled ? '🟢' : '🔴'} *Statuses:* ${config.statusEnabled ? '✅ ON' : '❌ OFF'}\n` +
                      `📩 *Private Route:* ${config.route.private === 'dm' ? 'Bot DM' : 'Original Chat'}\n` +
                      `👥 *Group Route:* ${config.route.group === 'chat' ? 'Group Chat' : 'Bot DM'}\n` +
                      `📱 *Status Route:* ${config.statusRoute === 'dm' ? 'Bot DM' : 'Status Owner DM'}\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📖 *Commands:*\n` +
                      `└ .antidelete on - Enable message recovery\n` +
                      `└ .antidelete off - Disable message recovery\n` +
                      `└ .antidelete status on - Enable status recovery\n` +
                      `└ .antidelete status off - Disable status recovery\n` +
                      `└ .antidelete statusroute dm - Statuses to your DM\n` +
                      `└ .antidelete statusroute owner - Statuses to owner DM\n` +
                      `└ .antidelete private dm - Private recovery to Bot DM\n` +
                      `└ .antidelete private chat - Private recovery to chat\n` +
                      `└ .antidelete group chat - Group recovery to group\n` +
                      `└ .antidelete group dm - Group recovery to Bot DM\n\n` +
                      `💡 *Example:* .antidelete on`,
                ...getContextInfo()
            }, { quoted: message });
            return;
        }

        if (cmd === 'on') {
            if (config.enabled) { await sock.sendMessage(chatId, { text: '⚠️ Already ON.', ...getContextInfo() }); return; }
            config.enabled = true;
            saveConfig(config);
            await sock.sendMessage(chatId, { text: `✅ *MESSAGE RECOVERY ENABLED*`, ...getContextInfo() });
        }
        else if (cmd === 'off') {
            if (!config.enabled) { await sock.sendMessage(chatId, { text: '⚠️ Already OFF.', ...getContextInfo() }); return; }
            config.enabled = false;
            saveConfig(config);
            await sock.sendMessage(chatId, { text: `❌ *MESSAGE RECOVERY DISABLED*`, ...getContextInfo() });
        }
        else if (cmd === 'status') {
            const sub = args[1]?.toLowerCase();
            if (sub === 'on') { config.statusEnabled = true; saveConfig(config); await sock.sendMessage(chatId, { text: `✅ *STATUS RECOVERY ENABLED*`, ...getContextInfo() }); }
            else if (sub === 'off') { config.statusEnabled = false; saveConfig(config); await sock.sendMessage(chatId, { text: `❌ *STATUS RECOVERY DISABLED*`, ...getContextInfo() }); }
            else { await sock.sendMessage(chatId, { text: `📱 Status: ${config.statusEnabled ? 'ON' : 'OFF'}`, ...getContextInfo() }); }
        }
        else if (cmd === 'statusroute') {
            const sub = args[1]?.toLowerCase();
            if (sub === 'dm') { config.statusRoute = 'dm'; saveConfig(config); await sock.sendMessage(chatId, { text: `✅ Statuses → *Bot DM*`, ...getContextInfo() }); }
            else if (sub === 'owner') { config.statusRoute = 'owner'; saveConfig(config); await sock.sendMessage(chatId, { text: `✅ Statuses → *Owner DM*`, ...getContextInfo() }); }
        }
        else if (cmd === 'private') {
            const sub = args[1]?.toLowerCase();
            if (sub === 'dm') { config.route.private = 'dm'; saveConfig(config); await sock.sendMessage(chatId, { text: `✅ Private → *Bot DM*`, ...getContextInfo() }); }
            else if (sub === 'chat') { config.route.private = 'chat'; saveConfig(config); await sock.sendMessage(chatId, { text: `✅ Private → *Original Chat*`, ...getContextInfo() }); }
        }
        else if (cmd === 'group') {
            const sub = args[1]?.toLowerCase();
            if (sub === 'chat') { config.route.group = 'chat'; saveConfig(config); await sock.sendMessage(chatId, { text: `✅ Group → *Group Chat*`, ...getContextInfo() }); }
            else if (sub === 'dm') { config.route.group = 'dm'; saveConfig(config); await sock.sendMessage(chatId, { text: `✅ Group → *Bot DM*`, ...getContextInfo() }); }
        }
    } catch (err) { console.error('Command error:', err); }
}

module.exports = { handleAntideleteCommand, handleMessageRevocation, storeMessage };