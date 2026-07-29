//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                             𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓                                                                                                     //
//                                                                  𝐕 : 1.0.0                                                                                                             //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2026                                                                                                        //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//* 
//  * command : antibot
//  * description : Protect groups from other WhatsApp bots
//  * Credit To  DEX SHYAM TECH
// ⛥┌┤
// */

const fs = require('fs');
const path = require('path');
const settings = require('../settings');
const isOwnerOrSudo = require('../lib/isOwner');

// ========== DATA FILE ==========
const DATA_DIR = path.join(__dirname, '../data');
const ANTIBOT_FILE = path.join(DATA_DIR, 'antibot.json');

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

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
function loadAntibotData() {
    try {
        if (fs.existsSync(ANTIBOT_FILE)) {
            const raw = fs.readFileSync(ANTIBOT_FILE, 'utf8');
            const data = JSON.parse(raw);
            return {
                detectedBots: new Set(data.detectedBots || []),
                suspiciousActivities: new Map(Object.entries(data.suspiciousActivities || {})),
                enabled: data.enabled !== false,
                autoAction: data.autoAction || 'warn',
                protectedGroups: new Set(data.protectedGroups || [])
            };
        }
    } catch (error) {
        console.error('⚠️ Error loading antibot data, resetting:', error.message);
        saveDataAtomic(ANTIBOT_FILE, {
            detectedBots: [],
            suspiciousActivities: {},
            enabled: true,
            autoAction: 'warn',
            protectedGroups: []
        });
    }
    return {
        detectedBots: new Set(),
        suspiciousActivities: new Map(),
        enabled: true,
        autoAction: 'warn',
        protectedGroups: new Set()
    };
}

function saveAntibotData(data) {
    const saveObj = {
        detectedBots: Array.from(data.detectedBots),
        suspiciousActivities: Object.fromEntries(data.suspiciousActivities),
        enabled: data.enabled,
        autoAction: data.autoAction,
        protectedGroups: Array.from(data.protectedGroups)
    };
    return saveDataAtomic(ANTIBOT_FILE, saveObj);
}

// ========== GLOBAL STATE ==========
let antibotState = loadAntibotData();

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

// ========== BOT DETECTION PATTERNS ==========
const BOT_PATTERNS = {
    names: [
        'bot', 'wabot', 'whatsapp bot', 'md bot', 'whatsapp-bot', 'wabot-inc',
        'baileys', 'venom', 'whatsapp-web.js', 'wppconnect', 'whatsapp-web',
        'automation', 'script', 'crawler', 'spider', 'scanner', 'whatsappbot',
        'userbot', 'multi-device', 'baileys-md', 'wamd', 'wame'
    ],
    messagePatterns: [
        /\.\w+\s+@\d{10,}/g,
        /https?:\/\/[^\s]+\.[^\s]+/gi,
        /[@#][0-9]{10,}/g,
        /[\u{1F600}-\u{1F64F}]{5,}/gu,
        /(.)\1{10,}/g,
        /[0-9]{15,}/g,
    ],
    rapidCommands: [
        /^\.\w+$/g,
        /^\.\w+\s+@\d+$/g,
    ],
    userAgents: [
        'Baileys', 'Venom', 'WPPConnect', 'WhatsAppWeb.js', 'WhatsApp-Bot',
        'Multi-Device', 'MD-Bot', 'WAMD', 'WAME'
    ]
};

// ========== USER ACTIVITY TRACKING ==========
const userActivity = new Map();

// ========== DETECTION ENGINE ==========
class AntiBotSystem {
    static async detectBot(sock, chatId, userId, message) {
        if (!antibotState.enabled) return { isBot: false, score: 0, reasons: [] };

        const userJid = userId;
        let botScore = 0;
        const reasons = [];

        // Check name
        try {
            const user = await sock.onWhatsApp(userJid);
            if (user && user[0]) {
                const pushName = user[0].pushname || '';
                const name = pushName.toLowerCase();
                for (const pattern of BOT_PATTERNS.names) {
                    if (name.includes(pattern)) {
                        botScore += 30;
                        reasons.push(`Name contains "${pattern}"`);
                        break;
                    }
                }
            }
        } catch (_) {}

        // Check message content
        const messageText = AntiBotSystem.extractMessageText(message);
        if (messageText) {
            if (AntiBotSystem.isRapidCommand(userJid, messageText)) {
                botScore += 25;
                reasons.push('Rapid command execution');
            }
            for (const pattern of BOT_PATTERNS.messagePatterns) {
                const matches = messageText.match(pattern);
                if (matches && matches.length > 0) {
                    botScore += 20;
                    reasons.push(`Suspicious message pattern: ${pattern}`);
                    break;
                }
            }
            const commandCount = (messageText.match(/\.\w+/g) || []).length;
            if (commandCount > 3) {
                botScore += 15;
                reasons.push(`Too many commands: ${commandCount}`);
            }
        }

        // Activity
        const now = Date.now();
        const activity = userActivity.get(userJid) || { count: 0, lastActivity: 0 };
        if (now - activity.lastActivity < 1000 && activity.count > 5) {
            botScore += 35;
            reasons.push('Extremely rapid messaging');
        }
        userActivity.set(userJid, { count: activity.count + 1, lastActivity: now });
        setTimeout(() => { if (userActivity.has(userJid)) userActivity.delete(userJid); }, 60000);

        console.log(`🔍 Bot detection for ${userJid}: Score ${botScore}, Reasons:`, reasons);
        return {
            isBot: botScore >= 50,
            score: botScore,
            reasons
        };
    }

    static extractMessageText(message) {
        return (
            message.message?.conversation ||
            message.message?.extendedTextMessage?.text ||
            message.message?.imageMessage?.caption ||
            message.message?.videoMessage?.caption ||
            ''
        ).toLowerCase();
    }

    static isRapidCommand(userJid, messageText) {
        const now = Date.now();
        const key = `${userJid}_commands`;
        const data = userActivity.get(key) || { count: 0, lastCommand: 0 };
        if (messageText.startsWith('.')) {
            if (now - data.lastCommand < 2000 && data.count > 2) return true;
            userActivity.set(key, { count: data.count + 1, lastCommand: now });
            setTimeout(() => { if (userActivity.has(key)) userActivity.delete(key); }, 5000);
        }
        return false;
    }

    static async takeAction(sock, chatId, userId, detection) {
        if (!antibotState.enabled) return;
        const userJid = userId;
        const isGroup = chatId.endsWith('@g.us');
        antibotState.detectedBots.add(userJid);
        saveAntibotData(antibotState);

        const action = antibotState.autoAction;
        const reasons = detection.reasons.join(', ');

        try {
            switch (action) {
                case 'warn':
                    await sock.sendMessage(chatId, {
                        text: `⚠️ *BOT DETECTED!*\n\n👤 User: @${userJid.split('@')[0]}\n📊 Score: ${detection.score}\n🔍 Reasons: ${reasons}\n\n❌ Suspected bot activity flagged.`,
                        mentions: [userJid],
                        ...getContextInfo()
                    });
                    break;
                case 'mute':
                    if (isGroup) {
                        await sock.groupParticipantsUpdate(chatId, [userJid], 'mute');
                        await sock.sendMessage(chatId, {
                            text: `🔇 *BOT MUTED!*\n\n👤 @${userJid.split('@')[0]}\n📊 Score: ${detection.score}\n🔍 Reasons: ${reasons}`,
                            mentions: [userJid],
                            ...getContextInfo()
                        });
                    }
                    break;
                case 'kick':
                    if (isGroup) {
                        await sock.groupParticipantsUpdate(chatId, [userJid], 'remove');
                        await sock.sendMessage(chatId, {
                            text: `🚫 *BOT KICKED!*\n\n👤 @${userJid.split('@')[0]}\n📊 Score: ${detection.score}\n🔍 Reasons: ${reasons}`,
                            mentions: [userJid],
                            ...getContextInfo()
                        });
                    }
                    break;
                case 'ban':
                    const banList = require('./isBanned');
                    await banList.banUser(userJid);
                    if (isGroup) {
                        await sock.groupParticipantsUpdate(chatId, [userJid], 'remove');
                    }
                    await sock.sendMessage(chatId, {
                        text: `🔨 *BOT BANNED!*\n\n👤 @${userJid.split('@')[0]}\n📊 Score: ${detection.score}\n🔍 Reasons: ${reasons}`,
                        mentions: [userJid],
                        ...getContextInfo()
                    });
                    break;
            }
            console.log(`✅ AntiBot action taken: ${action} for ${userJid}`);
        } catch (error) {
            console.error('❌ Error taking antibot action:', error);
        }
    }
}

// ========== COMMAND ==========
module.exports = {
    name: 'antibot',
    category: 'Group',
    description: 'Protect groups from other WhatsApp bots',
    groupOnly: false,
    ownerOnly: false,

    execute: async (sock, message, args, senderId, chatId) => {
        try {
            const isGroup = chatId.endsWith('@g.us');
            const isAuthorized = message.key.fromMe || await isOwnerOrSudo(senderId, sock, chatId);
            if (!isAuthorized) {
                await sock.sendMessage(chatId, {
                    text: '❌ Only bot owner/admins can use antibot commands!',
                    ...getContextInfo()
                }, { quoted: message });
                return;
            }

            const prefix = settings.prefix || '.';
            const action = args[0]?.toLowerCase();

            switch (action) {
                case 'on':
                case 'enable':
                    antibotState.enabled = true;
                    if (isGroup) antibotState.protectedGroups.add(chatId);
                    saveAntibotData(antibotState);
                    await sock.sendMessage(chatId, {
                        text: `✅ *AntiBot ENABLED*${isGroup ? ' for this group' : ' globally'}`,
                        ...getContextInfo()
                    }, { quoted: message });
                    break;

                case 'off':
                case 'disable':
                    antibotState.enabled = false;
                    if (isGroup) antibotState.protectedGroups.delete(chatId);
                    saveAntibotData(antibotState);
                    await sock.sendMessage(chatId, {
                        text: `❌ *AntiBot DISABLED*${isGroup ? ' for this group' : ' globally'}`,
                        ...getContextInfo()
                    }, { quoted: message });
                    break;

                case 'action': {
                    const newAction = args[1]?.toLowerCase();
                    if (['warn', 'mute', 'kick', 'ban'].includes(newAction)) {
                        antibotState.autoAction = newAction;
                        saveAntibotData(antibotState);
                        await sock.sendMessage(chatId, {
                            text: `⚙️ *Action Updated*\n\nNew action: *${newAction.toUpperCase()}*`,
                            ...getContextInfo()
                        }, { quoted: message });
                    } else {
                        await sock.sendMessage(chatId, {
                            text: `❌ Invalid action! Use: warn, mute, kick, ban\nExample: ${prefix}antibot action warn`,
                            ...getContextInfo()
                        }, { quoted: message });
                    }
                    break;
                }

                case 'list':
                case 'bots': {
                    const count = antibotState.detectedBots.size;
                    if (count === 0) {
                        await sock.sendMessage(chatId, {
                            text: '📋 *Detected Bots List*\n\nNo bots detected yet! 🎉',
                            ...getContextInfo()
                        }, { quoted: message });
                    } else {
                        const list = Array.from(antibotState.detectedBots).slice(0, 10).join('\n• ');
                        await sock.sendMessage(chatId, {
                            text: `📋 *Detected Bots List*\n\nTotal: ${count}\n\n• ${list}${count > 10 ? `\n... and ${count - 10} more` : ''}`,
                            ...getContextInfo()
                        }, { quoted: message });
                    }
                    break;
                }

                case 'status':
                case 'info': {
                    const status = antibotState.enabled ? '🟢 ENABLED' : '🔴 DISABLED';
                    await sock.sendMessage(chatId, {
                        text: `📊 *AntiBot Status*\n\nStatus: ${status}\nAction: ${antibotState.autoAction.toUpperCase()}\nProtected Groups: ${antibotState.protectedGroups.size}\nDetected Bots: ${antibotState.detectedBots.size}\n\nCommands:\n• ${prefix}antibot on/off\n• ${prefix}antibot action <warn/mute/kick/ban>\n• ${prefix}antibot list\n• ${prefix}antibot status\n• ${prefix}antibot clear`,
                        ...getContextInfo()
                    }, { quoted: message });
                    break;
                }

                case 'clear':
                    antibotState.detectedBots.clear();
                    antibotState.suspiciousActivities.clear();
                    saveAntibotData(antibotState);
                    await sock.sendMessage(chatId, {
                        text: '🧹 *AntiBot Data Cleared*',
                        ...getContextInfo()
                    }, { quoted: message });
                    break;

                default:
                    await sock.sendMessage(chatId, {
                        text: `🛡️ *AntiBot Protection*\n\nUsage: ${prefix}antibot <command>\n\nCommands:\n• on/off - Enable/disable\n• action <warn/mute/kick/ban> - Set action\n• list - Show detected bots\n• status - Show system status\n• clear - Clear all data\n\nCurrent Status:\nEnabled: ${antibotState.enabled ? 'Yes' : 'No'}\nAction: ${antibotState.autoAction}\nProtected: ${antibotState.protectedGroups.size} groups\nDetected: ${antibotState.detectedBots.size} bots`,
                        ...getContextInfo()
                    }, { quoted: message });
                    break;
            }
        } catch (error) {
            console.error('❌ AntiBot command error:', error.message);
            await sock.sendMessage(chatId, {
                text: '❌ Error executing antibot command!',
                ...getContextInfo()
            }, { quoted: message });
        }
    },

    // Main detection function called from main.js
    async handleMessage(sock, chatId, message) {
        try {
            if (!antibotState.enabled) return false;
            const isGroup = chatId.endsWith('@g.us');
            if (message.key.fromMe) return false;
            if (isGroup && !antibotState.protectedGroups.has(chatId)) return false;

            const senderId = message.key.participant || message.key.remoteJid;
            if (antibotState.detectedBots.has(senderId)) return true;

            const detection = await AntiBotSystem.detectBot(sock, chatId, senderId, message);
            if (detection.isBot) {
                console.log(`🚨 BOT DETECTED: ${senderId}, Score: ${detection.score}`);
                await AntiBotSystem.takeAction(sock, chatId, senderId, detection);
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ AntiBot detection error:', error.message);
            return false;
        }
    },

    // Get status
    getStatus() {
        return {
            enabled: antibotState.enabled,
            autoAction: antibotState.autoAction,
            protectedGroups: antibotState.protectedGroups.size,
            detectedBots: antibotState.detectedBots.size
        };
    }
};