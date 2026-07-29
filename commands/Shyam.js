//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                             𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓                                                                                                     //
//                                                                  𝐕 : 1.0.0                                                                                                             //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2026                                                                                                        //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//* 
//  * file : commands/Shyam.js
//  * description : Configuration commands for bot (Owner only)
//  * Credit To  DEX SHYAM TECH
// ⛥┌┤
// */

const fs = require('fs');
const path = require('path');
const settings = require('../settings');
const isOwnerOrSudo = require('../lib/isOwner');

// ========== PATHS ==========
const SETTINGS_PATH = path.join(__dirname, '../settings.js');

// ========== ATOMIC SAVE ==========
function saveDataAtomic(file, data) {
    try {
        const tempFile = file + '.tmp';
        fs.writeFileSync(tempFile, data, 'utf8');
        fs.renameSync(tempFile, file);
        return true;
    } catch (error) {
        console.error(`❌ Error saving ${file}:`, error.message);
        try { fs.unlinkSync(file + '.tmp'); } catch (_) {}
        return false;
    }
}

// ========== GET OLD SETTING ==========
function getOldSetting(settingKey) {
    try {
        if (!fs.existsSync(SETTINGS_PATH)) return 'Not set';
        const content = fs.readFileSync(SETTINGS_PATH, 'utf8');
        const pattern = new RegExp(`${settingKey}:\\s*(['"]([^'"]*)['"]|[^,\\n}]+)`, 'i');
        const match = content.match(pattern);
        if (match) {
            let value = match[0].replace(`${settingKey}:`, '').trim();
            if ((value.startsWith("'") && value.endsWith("'")) || 
                (value.startsWith('"') && value.endsWith('"'))) {
                value = value.substring(1, value.length - 1);
            }
            return value;
        }
        return 'Not set';
    } catch (_) { return 'Error'; }
}

// ========== UPDATE SETTINGS ==========
function updateSettings(settingKey, settingValue) {
    try {
        if (!fs.existsSync(SETTINGS_PATH)) return { success: false, oldValue: 'Not set' };
        
        let content = fs.readFileSync(SETTINGS_PATH, 'utf8');
        const oldValue = getOldSetting(settingKey);
        
        let newValue;
        if (typeof settingValue === 'boolean' || typeof settingValue === 'number') {
            newValue = settingValue;
        } else {
            newValue = `'${String(settingValue).replace(/'/g, "\\'")}'`;
        }
        
        const pattern = new RegExp(`(${settingKey}:\\s*)(['"][^'"]*['"]|[^,\\n}]+)`, 'i');
        if (pattern.test(content)) {
            content = content.replace(pattern, `$1${newValue}`);
        } else {
            // Add new property before module.exports
            if (content.includes('module.exports = {')) {
                content = content.replace('module.exports = {', `  ${settingKey}: ${newValue},\nmodule.exports = {`);
            } else {
                // Fallback: add at end before last }
                const lastBrace = content.lastIndexOf('}');
                if (lastBrace !== -1) {
                    content = content.substring(0, lastBrace) + `,\n  ${settingKey}: ${newValue}\n` + content.substring(lastBrace);
                }
            }
        }
        
        if (saveDataAtomic(SETTINGS_PATH, content)) {
            delete require.cache[require.resolve('../settings')];
            return { success: true, oldValue };
        }
        return { success: false, oldValue };
    } catch (error) {
        console.error(`❌ Error updating ${settingKey}:`, error);
        return { success: false, oldValue: 'Error' };
    }
}

// ========== RESTART ==========
function restartBot(delay = 3000) {
    console.log(`🔄 Bot will restart in ${delay/1000} seconds...`);
    setTimeout(() => {
        console.log('🔄 Restarting bot...');
        process.exit(1);
    }, delay);
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

// ========== COMMANDS ==========

module.exports = {
    name: 'config', // dummy name, but we'll export each command separately

    setBotName: {
        name: 'setbotname',
        category: 'Owner',
        description: 'Change bot display name',
        ownerOnly: true,
        groupOnly: false,
        execute: async (sock, message, args, senderId, chatId) => {
            try {
                if (!args || args.length === 0) {
                    const current = getOldSetting('botName');
                    await sock.sendMessage(chatId, {
                        text: `🤖 *Current Bot Name:* ${current}\n\nUsage: \`.setbotname <new name>\`\nExample: \`.setbotname Dex-Tech-Bot PRO\`\n\n⚠️ Bot will auto-restart after update.`,
                        ...getContextInfo()
                    }, { quoted: message });
                    return;
                }
                const newName = args.join(' ').trim();
                if (newName.length < 2) {
                    await sock.sendMessage(chatId, { text: '❌ Bot name must be at least 2 characters.', ...getContextInfo() }, { quoted: message });
                    return;
                }
                const result = updateSettings('botName', newName);
                if (result.success) {
                    await sock.sendMessage(chatId, {
                        text: `✅ *BOT NAME UPDATED!*\n\n📛 Old: ${result.oldValue}\n📛 New: ${newName}\n\n🔄 Bot will auto-restart in 3 seconds...`,
                        ...getContextInfo()
                    }, { quoted: message });
                    restartBot(3000);
                } else {
                    await sock.sendMessage(chatId, { text: '❌ Failed to update bot name.', ...getContextInfo() }, { quoted: message });
                }
            } catch (error) {
                console.error('❌ setBotName error:', error);
                await sock.sendMessage(chatId, { text: '❌ Error updating bot name.', ...getContextInfo() }, { quoted: message });
            }
        }
    },

    setBotOwner: {
        name: 'setbotowner',
        category: 'Owner',
        description: 'Change bot owner display name',
        ownerOnly: true,
        groupOnly: false,
        execute: async (sock, message, args, senderId, chatId) => {
            try {
                if (!args || args.length === 0) {
                    await sock.sendMessage(chatId, {
                        text: `👑 *Set Bot Owner Name*\n\nUsage: \`.setbotowner <new owner name>\`\nExample: \`.setbotowner Dex Shyam Tech\`\n\n⚠️ Bot will auto-restart after update.`,
                        ...getContextInfo()
                    }, { quoted: message });
                    return;
                }
                const newOwner = args.join(' ').trim();
                if (newOwner.length === 0) {
                    await sock.sendMessage(chatId, { text: '❌ Please enter a valid owner name.', ...getContextInfo() }, { quoted: message });
                    return;
                }
                const oldValue = getOldSetting('botOwner');
                const result = updateSettings('botOwner', newOwner);
                if (result.success) {
                    await sock.sendMessage(chatId, {
                        text: `✅ *BOT OWNER UPDATED!*\n\n👑 Old: ${oldValue}\n👑 New: ${newOwner}\n\n🔄 Bot will auto-restart in 3 seconds...`,
                        ...getContextInfo()
                    }, { quoted: message });
                    restartBot(3000);
                } else {
                    await sock.sendMessage(chatId, { text: '❌ Failed to update bot owner.', ...getContextInfo() }, { quoted: message });
                }
            } catch (error) {
                console.error('❌ setBotOwner error:', error);
                await sock.sendMessage(chatId, { text: '❌ Error updating bot owner.', ...getContextInfo() }, { quoted: message });
            }
        }
    },

    setOwnerNumber: {
        name: 'setownernumber',
        category: 'Owner',
        description: 'Change owner WhatsApp number',
        ownerOnly: true,
        groupOnly: false,
        execute: async (sock, message, args, senderId, chatId) => {
            try {
                if (!args || args.length === 0) {
                    const current = getOldSetting('ownerNumber');
                    await sock.sendMessage(chatId, {
                        text: `📞 *Current Owner Number:* ${current}\n\nUsage: \`.setownernumber <number>\`\nExample: \`.setownernumber 917384287404\`\n\n⚠️ Bot will auto-restart after update.`,
                        ...getContextInfo()
                    }, { quoted: message });
                    return;
                }
                const newNumber = args[0].replace(/[^0-9]/g, '');
                if (newNumber.length === 0 || newNumber.length < 10) {
                    await sock.sendMessage(chatId, { text: '❌ Invalid number. Must be at least 10 digits with country code.', ...getContextInfo() }, { quoted: message });
                    return;
                }
                const oldValue = getOldSetting('ownerNumber');
                const result = updateSettings('ownerNumber', newNumber);
                if (result.success) {
                    await sock.sendMessage(chatId, {
                        text: `✅ *OWNER NUMBER UPDATED!*\n\n📞 Old: ${oldValue}\n📞 New: ${newNumber}\n\n🔄 Bot will auto-restart in 5 seconds...`,
                        ...getContextInfo()
                    }, { quoted: message });
                    restartBot(5000);
                } else {
                    await sock.sendMessage(chatId, { text: '❌ Failed to update owner number.', ...getContextInfo() }, { quoted: message });
                }
            } catch (error) {
                console.error('❌ setOwnerNumber error:', error);
                await sock.sendMessage(chatId, { text: '❌ Error updating owner number.', ...getContextInfo() }, { quoted: message });
            }
        }
    },

    setYTChannel: {
        name: 'setytchannel',
        category: 'Owner',
        description: 'Change YouTube channel name',
        ownerOnly: true,
        groupOnly: false,
        execute: async (sock, message, args, senderId, chatId) => {
            try {
                if (!args || args.length === 0) {
                    let current = getOldSetting('ytChannel');
                    if (current === 'Not set' && global.ytch) current = global.ytch;
                    await sock.sendMessage(chatId, {
                        text: `📺 *Current YouTube Channel:* ${current}\n\nUsage: \`.setytchannel <channel name>\`\nExample: \`.setytchannel Dex Shyam Tech\`\n\n⚠️ Bot will auto-restart after update.`,
                        ...getContextInfo()
                    }, { quoted: message });
                    return;
                }
                const newYT = args.join(' ').trim();
                if (newYT.length === 0) {
                    await sock.sendMessage(chatId, { text: '❌ Please enter a valid channel name.', ...getContextInfo() }, { quoted: message });
                    return;
                }
                if (newYT.includes('youtube.com') || newYT.includes('youtu.be') || newYT.includes('http')) {
                    await sock.sendMessage(chatId, { text: '❌ Please enter channel NAME only, not a link.', ...getContextInfo() }, { quoted: message });
                    return;
                }
                let oldValue = getOldSetting('ytChannel');
                if (oldValue === 'Not set' && global.ytch) oldValue = global.ytch;
                const result = updateSettings('ytChannel', newYT);
                if (result.success) {
                    await sock.sendMessage(chatId, {
                        text: `✅ *YOUTUBE CHANNEL UPDATED!*\n\n📺 Old: ${oldValue}\n📺 New: ${newYT}\n\n🔄 Bot will auto-restart in 3 seconds...`,
                        ...getContextInfo()
                    }, { quoted: message });
                    restartBot(3000);
                } else {
                    await sock.sendMessage(chatId, { text: '❌ Failed to update YouTube channel.', ...getContextInfo() }, { quoted: message });
                }
            } catch (error) {
                console.error('❌ setYTChannel error:', error);
                await sock.sendMessage(chatId, { text: '❌ Error updating YouTube channel.', ...getContextInfo() }, { quoted: message });
            }
        }
    },

    setPackName: {
        name: 'setpackname',
        category: 'Owner',
        description: 'Change sticker pack name',
        ownerOnly: true,
        groupOnly: false,
        execute: async (sock, message, args, senderId, chatId) => {
            try {
                if (!args || args.length === 0) {
                    let current = getOldSetting('packname');
                    if (current === 'Not set' && global.packname) current = global.packname;
                    await sock.sendMessage(chatId, {
                        text: `📦 *Current Pack Name:* ${current}\n\nUsage: \`.setpackname <new pack name>\`\nExample: \`.setpackname Dex-Tech-Bot Stickers\`\n\n⚠️ Bot will auto-restart after update.`,
                        ...getContextInfo()
                    }, { quoted: message });
                    return;
                }
                const newPack = args.join(' ').trim();
                if (newPack.length === 0) {
                    await sock.sendMessage(chatId, { text: '❌ Please enter a valid pack name.', ...getContextInfo() }, { quoted: message });
                    return;
                }
                let oldValue = getOldSetting('packname');
                if (oldValue === 'Not set' && global.packname) oldValue = global.packname;
                const result = updateSettings('packname', newPack);
                if (result.success) {
                    await sock.sendMessage(chatId, {
                        text: `✅ *PACK NAME UPDATED!*\n\n📦 Old: ${oldValue}\n📦 New: ${newPack}\n\n🔄 Bot will auto-restart in 3 seconds...`,
                        ...getContextInfo()
                    }, { quoted: message });
                    restartBot(3000);
                } else {
                    await sock.sendMessage(chatId, { text: '❌ Failed to update pack name.', ...getContextInfo() }, { quoted: message });
                }
            } catch (error) {
                console.error('❌ setPackName error:', error);
                await sock.sendMessage(chatId, { text: '❌ Error updating pack name.', ...getContextInfo() }, { quoted: message });
            }
        }
    },

    setAuthor: {
        name: 'setauthor',
        category: 'Owner',
        description: 'Change sticker author name',
        ownerOnly: true,
        groupOnly: false,
        execute: async (sock, message, args, senderId, chatId) => {
            try {
                if (!args || args.length === 0) {
                    let current = getOldSetting('author');
                    if (current === 'Not set' && global.author) current = global.author;
                    await sock.sendMessage(chatId, {
                        text: `✍️ *Current Author:* ${current}\n\nUsage: \`.setauthor <new author name>\`\nExample: \`.setauthor Dex Shyam Tech\`\n\n⚠️ Bot will auto-restart after update.`,
                        ...getContextInfo()
                    }, { quoted: message });
                    return;
                }
                const newAuthor = args.join(' ').trim();
                if (newAuthor.length === 0) {
                    await sock.sendMessage(chatId, { text: '❌ Please enter a valid author name.', ...getContextInfo() }, { quoted: message });
                    return;
                }
                let oldValue = getOldSetting('author');
                if (oldValue === 'Not set' && global.author) oldValue = global.author;
                const result = updateSettings('author', newAuthor);
                if (result.success) {
                    await sock.sendMessage(chatId, {
                        text: `✅ *AUTHOR UPDATED!*\n\n✍️ Old: ${oldValue}\n✍️ New: ${newAuthor}\n\n🔄 Bot will auto-restart in 3 seconds...`,
                        ...getContextInfo()
                    }, { quoted: message });
                    restartBot(3000);
                } else {
                    await sock.sendMessage(chatId, { text: '❌ Failed to update author.', ...getContextInfo() }, { quoted: message });
                }
            } catch (error) {
                console.error('❌ setAuthor error:', error);
                await sock.sendMessage(chatId, { text: '❌ Error updating author.', ...getContextInfo() }, { quoted: message });
            }
        }
    },

    setTimezone: {
        name: 'settimezone',
        category: 'Owner',
        description: 'Change bot timezone',
        ownerOnly: true,
        groupOnly: false,
        execute: async (sock, message, args, senderId, chatId) => {
            try {
                if (!args || args.length === 0) {
                    const current = getOldSetting('timezone');
                    await sock.sendMessage(chatId, {
                        text: `🌍 *Current Timezone:* ${current}\n\nUsage: \`.settimezone <timezone>\`\nExample: \`.settimezone Asia/Kolkata\`\n\n⚠️ Bot will auto-restart after update.`,
                        ...getContextInfo()
                    }, { quoted: message });
                    return;
                }
                const newTimezone = args.join(' ').trim();
                if (newTimezone.length === 0 || !newTimezone.includes('/')) {
                    await sock.sendMessage(chatId, { text: '❌ Invalid timezone format. Use Continent/City (e.g., Asia/Kolkata).', ...getContextInfo() }, { quoted: message });
                    return;
                }
                const oldValue = getOldSetting('timezone');
                const result = updateSettings('timezone', newTimezone);
                if (result.success) {
                    await sock.sendMessage(chatId, {
                        text: `✅ *TIMEZONE UPDATED!*\n\n🌍 Old: ${oldValue}\n🌍 New: ${newTimezone}\n\n🔄 Bot will auto-restart in 3 seconds...`,
                        ...getContextInfo()
                    }, { quoted: message });
                    restartBot(3000);
                } else {
                    await sock.sendMessage(chatId, { text: '❌ Failed to update timezone.', ...getContextInfo() }, { quoted: message });
                }
            } catch (error) {
                console.error('❌ setTimezone error:', error);
                await sock.sendMessage(chatId, { text: '❌ Error updating timezone.', ...getContextInfo() }, { quoted: message });
            }
        }
    },

    configHelp: {
        name: 'confighelp',
        category: 'Owner',
        description: 'Show configuration commands',
        ownerOnly: true,
        groupOnly: false,
        execute: async (sock, message, args, senderId, chatId) => {
            try {
                const prefix = settings.prefix || '.';
                const helpText = `*🔧 DEX TECH BOT CONFIGURATION COMMANDS*\n\n` +
                    `These commands modify settings.js file directly:\n\n` +
                    `*🤖 Bot Identity:*\n` +
                    `• ${prefix}setbotname <name> - Change bot display name\n` +
                    `• ${prefix}setbotowner <name> - Change owner display name\n` +
                    `• ${prefix}setownernumber <num> - Change owner WhatsApp number\n\n` +
                    `*📺 Media:*\n` +
                    `• ${prefix}setytchannel <name> - Change YouTube channel NAME\n` +
                    `• ${prefix}setpackname <name> - Change sticker pack name\n` +
                    `• ${prefix}setauthor <name> - Change sticker author name\n\n` +
                    `*🌍 Preferences:*\n` +
                    `• ${prefix}settimezone <zone> - Change bot timezone\n\n` +
                    `*⚠️ IMPORTANT:*\n` +
                    `• ALL commands auto-restart the bot after update\n` +
                    `• Only the owner number can use these commands\n` +
                    `• Changes are saved to settings.js\n` +
                    `• No sudo users can access these commands\n\n` +
                    `🤖 ${settings.botName || '𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓'}`;
                await sock.sendMessage(chatId, {
                    text: helpText,
                    ...getContextInfo()
                }, { quoted: message });
            } catch (error) {
                console.error('❌ configHelp error:', error);
                await sock.sendMessage(chatId, { text: '❌ Error loading help.', ...getContextInfo() }, { quoted: message });
            }
        }
    }
};