//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                             𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓                                                                                                     //
//                                                                  𝐕 : 1.0.0                                                                                                             //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2026                                                                                                        //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//* 
//  * command : setprefix
//  * description : Change the bot's command prefix (Owner only)
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

// ========== UPDATE SETTINGS.JS PREFIX ==========
function updateSettingsPrefix(newPrefix) {
    const settingsPath = path.join(__dirname, '../settings.js');
    let content = fs.readFileSync(settingsPath, 'utf8');

    // Regex to match prefix: '...', prefix: "...", etc.
    const regex = /(prefix:\s*)(['"`])([^'"`]*)(['"`])/;
    const match = content.match(regex);
    
    if (!match) {
        // If prefix line not found, maybe it's on its own line? Try another pattern.
        const altRegex = /prefix:\s*['"`][^'"`]*['"`]/;
        if (altRegex.test(content)) {
            const prefixValue = newPrefix === 'none' ? "''" : `'${newPrefix}'`;
            content = content.replace(altRegex, `prefix: ${prefixValue}`);
            fs.writeFileSync(settingsPath, content, 'utf8');
            return true;
        }
        return false;
    }

    const prefixValue = newPrefix === 'none' ? "''" : `'${newPrefix}'`;
    content = content.replace(regex, `$1${prefixValue}`);
    fs.writeFileSync(settingsPath, content, 'utf8');
    return true;
}

// ========== COMMAND ==========
module.exports = {
    name: 'setprefix',
    category: 'Owner',
    description: 'Change the bot\'s command prefix (Owner only)',
    groupOnly: false,
    ownerOnly: true,

    execute: async (sock, message, args, senderId, chatId) => {
        try {
            // Clear settings cache so changes take effect immediately
            delete require.cache[require.resolve('../settings')];
            const currentSettings = require('../settings');

            // ✅ Owner check (extra security)
            const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
            if (!isOwner && !message.key.fromMe) {
                await sock.sendMessage(chatId, {
                    text: '❌ Only bot owner can change the prefix!',
                    ...getContextInfo()
                }, { quoted: message });
                return;
            }

            // ✅ Show current prefix if no arguments
            if (args.length === 0) {
                const currentPrefix = currentSettings.prefix || '.';
                const prefixDisplay = currentPrefix === '' ? 'none (no prefix)' : `"${currentPrefix}"`;

                await sock.sendMessage(chatId, {
                    text: `🔤 *PREFIX SETTINGS* 🔤\n\n` +
                          `*Current Prefix:* ${prefixDisplay}\n\n` +
                          `📋 *Usage:*\n` +
                          `• \`${currentPrefix}setprefix <new-prefix>\` - Change prefix\n` +
                          `• \`${currentPrefix}setprefix .\` - Reset to default\n` +
                          `• \`${currentPrefix}setprefix none\` - No prefix (commands work without prefix)\n\n` +
                          `💡 *Examples:*\n` +
                          `• \`${currentPrefix}setprefix !\` - Change to !\n` +
                          `• \`${currentPrefix}setprefix /\` - Change to /\n` +
                          `• \`${currentPrefix}setprefix $\` - Change to $\n` +
                          `• \`${currentPrefix}setprefix none\` - No prefix needed\n\n` +
                          `⚠️ Commands work immediately, but for full effect use \`.restart\` after changing prefix.\n\n` +
                          `🤖 ${settings.botName || '𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓'}`,
                    ...getContextInfo()
                }, { quoted: message });
                return;
            }

            const newPrefix = args[0].toLowerCase();

            // Handle "none" prefix (empty string)
            if (newPrefix === 'none') {
                if (currentSettings.prefix === '') {
                    await sock.sendMessage(chatId, {
                        text: '⚠️ Prefix is already set to "none" (no prefix)!',
                        ...getContextInfo()
                    }, { quoted: message });
                    return;
                }

                try {
                    updateSettingsPrefix('none');
                    // Reload settings to show new prefix
                    delete require.cache[require.resolve('../settings')];
                    const updatedSettings = require('../settings');

                    await sock.sendMessage(chatId, {
                        text: `✅ *Prefix removed!*\n\n` +
                              `Now commands work **without any prefix**.\n\n` +
                              `*Examples:*\n` +
                              `• Instead of \`${currentSettings.prefix || '.'}menu\` just type \`menu\`\n` +
                              `• Instead of \`${currentSettings.prefix || '.'}help\` just type \`help\`\n` +
                              `• Instead of \`${currentSettings.prefix || '.'}ping\` just type \`ping\`\n\n` +
                              `✨ *Try it now:* Type \`menu\` (without any prefix)\n\n` +
                              `🔁 *For full effect:* Use \`.restart\` to apply changes completely\n` +
                              `(Bot will auto-reconnect after restart)\n\n` +
                              `🤖 ${settings.botName || '𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓'}`,
                        ...getContextInfo()
                    }, { quoted: message });
                } catch (error) {
                    await sock.sendMessage(chatId, {
                        text: `❌ Failed to update prefix: ${error.message}`,
                        ...getContextInfo()
                    }, { quoted: message });
                }
                return;
            }

            // Validate regular prefix
            if (newPrefix.length > 3) {
                await sock.sendMessage(chatId, {
                    text: '❌ Prefix must be 3 characters or less!',
                    ...getContextInfo()
                }, { quoted: message });
                return;
            }

            const validPrefix = /^[!$%&*+\-./:<=>?@^_~a-zA-Z0-9]{1,3}$/.test(newPrefix);
            if (!validPrefix) {
                await sock.sendMessage(chatId, {
                    text: '❌ Prefix can only contain letters, numbers, or special symbols!\n\n' +
                          '*Allowed characters:*\n' +
                          '! $ % & * + - . / : < = > ? @ ^ _ ~\n' +
                          'and letters a-z, A-Z, numbers 0-9',
                    ...getContextInfo()
                }, { quoted: message });
                return;
            }

            // Check if prefix is already the same
            if (currentSettings.prefix === newPrefix) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ Prefix is already "${newPrefix}"!`,
                    ...getContextInfo()
                }, { quoted: message });
                return;
            }

            // Update prefix
            try {
                updateSettingsPrefix(newPrefix);
                // Reload settings
                delete require.cache[require.resolve('../settings')];
                const updatedSettings = require('../settings');

                await sock.sendMessage(chatId, {
                    text: `✅ *Prefix changed successfully!*\n\n` +
                          `*Old prefix:* "${currentSettings.prefix || '.'}"\n` +
                          `*New prefix:* "${newPrefix}"\n\n` +
                          `💡 *Examples:*\n` +
                          `• \`${newPrefix}menu\` - Show menu\n` +
                          `• \`${newPrefix}help\` - Show help\n` +
                          `• \`${newPrefix}ping\` - Check bot speed\n` +
                          `• \`${newPrefix}owner\` - Contact owner\n\n` +
                          `✨ *Commands work immediately!*\n` +
                          `Try: \`${newPrefix}menu\`\n\n` +
                          `🔁 *For full effect:* Use \`.restart\` to apply changes completely\n` +
                          `• Startup messages will show new prefix\n` +
                          `• \`.botinfo\` will show correct prefix\n` +
                          `• Bot will auto-reconnect after restart\n\n` +
                          `🤖 ${settings.botName || '𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓'}`,
                    ...getContextInfo()
                }, { quoted: message });

            } catch (error) {
                await sock.sendMessage(chatId, {
                    text: `❌ Failed to change prefix: ${error.message}`,
                    ...getContextInfo()
                }, { quoted: message });
            }
        } catch (error) {
            console.error('❌ Setprefix command error:', error.message);
            await sock.sendMessage(chatId, {
                text: '❌ Failed to process prefix command. Please try again.',
                ...getContextInfo()
            }, { quoted: message });
        }
    }
};