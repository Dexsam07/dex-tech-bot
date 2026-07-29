//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                                                                                                                                                        //
//                                                             𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓                                                                                                     //
//                                                                                                                                                                                        //
//                                                                  𝐕 : 1.0.0                                                                                                             //
//                                                                                                                                                                                        //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2026                                                                                                        //
//                                                                                                                                                                                        //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//* 
//  * command : antilink
//  * description : Auto-delete group links
//  * Credit To  DEX SHYAM TECH
//  * © 2026 𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓.
// ⛥┌┤
// */

const fs = require('fs');
const path = require('path');
const settings = require('../settings');

// ✅ Antilink settings file path
const ANTILINK_FILE = path.join(__dirname, '../data/antilink.json');

// ✅ Ensure data folder exists
if (!fs.existsSync(path.dirname(ANTILINK_FILE))) {
    fs.mkdirSync(path.dirname(ANTILINK_FILE), { recursive: true });
}

// ✅ Read antilink settings
function getAntilinkSettings() {
    try {
        if (fs.existsSync(ANTILINK_FILE)) {
            return JSON.parse(fs.readFileSync(ANTILINK_FILE, 'utf8'));
        }
        return { enabled: false, groups: {} };
    } catch (e) {
        return { enabled: false, groups: {} };
    }
}

// ✅ Save antilink settings
function saveAntilinkSettings(data) {
    try {
        fs.writeFileSync(ANTILINK_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (e) {
        console.error('❌ Failed to save antilink settings:', e.message);
        return false;
    }
}

module.exports = {
    name: 'antilink',
    category: 'Group Management',
    description: 'Auto-delete group links',
    usage: '.antilink on/off',
    execute: async (dexbotInc, message, args, sender, from) => {
        try {
            // ✅ Check if command is used in a group
            if (!from.endsWith('@g.us')) {
                return await dexbotInc.sendMessage(from, { 
                    text: '❌ This command can only be used in groups.' 
                });
            }

            // ✅ Check if user is group admin or owner
            const groupMetadata = await dexbotInc.groupMetadata(from);
            const participants = groupMetadata.participants;
            const isAdmin = participants.find(p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin'));
            const isOwner = sender === (settings.ownerNumber + '@s.whatsapp.net');

            if (!isAdmin && !isOwner) {
                return await dexbotInc.sendMessage(from, { 
                    text: '❌ Only group admins or bot owner can use this command.' 
                });
            }

            // ✅ Get command arguments (fix - ab hardcoded slice nahi hai!)
            const prefix = settings.prefix || '.';
            const cmdName = 'antilink';
            // ✅ Properly extract arguments (dynamically)
            let argsArr = [];
            if (message.body) {
                const parts = message.body.trim().split(/\s+/);
                if (parts.length > 1) {
                    argsArr = parts.slice(1);
                }
            }

            if (argsArr.length === 0) {
                const status = getAntilinkSettings();
                const groupStatus = status.groups[from] || false;
                return await dexbotInc.sendMessage(from, {
                    text: `📋 *Antilink Status*\n\n` +
                          `🔹 Group: ${groupMetadata.subject || 'Unknown'}\n` +
                          `🔹 Status: ${groupStatus ? '🟢 ENABLED' : '🔴 DISABLED'}\n` +
                          `🔹 Usage: .antilink on/off`
                });
            }

            const action = argsArr[0].toLowerCase();

            if (action === 'on') {
                const data = getAntilinkSettings();
                data.groups[from] = true;
                if (saveAntilinkSettings(data)) {
                    await dexbotInc.sendMessage(from, {
                        text: `✅ *Antilink ENABLED* for this group.\n🔗 Links will be automatically deleted.`,
                        contextInfo: {
                            forwardingScore: 1,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: settings.newsletterJid || '120363406449026172@newsletter',
                                newsletterName: settings.newsletterName || 'Dex Shyam Tech',
                                serverMessageId: -1
                            }
                        }
                    });
                } else {
                    await dexbotInc.sendMessage(from, { text: '❌ Failed to enable antilink. Please try again.' });
                }
            } else if (action === 'off') {
                const data = getAntilinkSettings();
                data.groups[from] = false;
                if (saveAntilinkSettings(data)) {
                    await dexbotInc.sendMessage(from, {
                        text: `✅ *Antilink DISABLED* for this group.\nLinks will no longer be deleted.`,
                        contextInfo: {
                            forwardingScore: 1,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: settings.newsletterJid || '120363406449026172@newsletter',
                                newsletterName: settings.newsletterName || 'Dex Shyam Tech',
                                serverMessageId: -1
                            }
                        }
                    });
                } else {
                    await dexbotInc.sendMessage(from, { text: '❌ Failed to disable antilink. Please try again.' });
                }
            } else {
                await dexbotInc.sendMessage(from, {
                    text: `❌ Invalid argument. Use:\n.antilink on\n.antilink off`
                });
            }
        } catch (error) {
            console.error('❌ Antilink command error:', error.message);
            await dexbotInc.sendMessage(from, { 
                text: '❌ Error processing antilink command. Please try again.' 
            });
        }
    }
};