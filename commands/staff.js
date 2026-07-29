//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                             𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓                                                                                                     //
//                                                                  𝐕 : 1.0.0                                                                                                             //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2026                                                                                                        //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//* 
//  * command : staff
//  * description : List all group admins and group owners
//  * Credit To  DEX SHYAM TECH
// ⛥┌┤
// */

const settings = require('../settings');

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

// ========== COMMAND ==========
module.exports = {
    name: 'staff',
    category: 'Group',
    description: 'List all group admins and group owners',
    groupOnly: true,
    ownerOnly: false,

    execute: async (sock, message, args, senderId, chatId) => {
        try {
            // ✅ Show typing indicator
            await sock.sendPresenceUpdate('composing', chatId);

            // ✅ Get group metadata
            const groupMetadata = await sock.groupMetadata(chatId);

            // ✅ Get group profile picture
            let pp;
            try {
                pp = await sock.profilePictureUrl(chatId, 'image');
            } catch (_) {
                pp = 'https://i.imgur.com/2wzGhpF.jpeg'; // Default fallback
            }

            // ✅ Get participants and admins
            const participants = groupMetadata.participants || [];
            const superAdmins = participants.filter(p => p.admin === 'superadmin');
            const regularAdmins = participants.filter(p => p.admin === 'admin');
            const allAdmins = [...superAdmins, ...regularAdmins];

            // ✅ Build admin lists with mentions
            let adminList = '';
            const mentions = [];

            if (superAdmins.length > 0) {
                adminList += '*👑 GROUP OWNERS*\n';
                superAdmins.forEach((admin, index) => {
                    const name = admin.name || admin.id.split('@')[0];
                    adminList += `${index + 1}. @${admin.id.split('@')[0]} (${name})\n`;
                    mentions.push(admin.id);
                });
                adminList += '\n';
            }

            if (regularAdmins.length > 0) {
                adminList += '*⚡ ADMINISTRATORS*\n';
                regularAdmins.forEach((admin, index) => {
                    const name = admin.name || admin.id.split('@')[0];
                    adminList += `${index + 1}. @${admin.id.split('@')[0]} (${name})\n`;
                    mentions.push(admin.id);
                });
            }

            // ✅ Group owner
            const owner = groupMetadata.owner || superAdmins[0]?.id || chatId.split('-')[0] + '@s.whatsapp.net';
            if (!mentions.includes(owner) && owner) mentions.push(owner);

            // ✅ Build staff text
            const text =
                `🏷️ *GROUP STAFF* 🏷️\n\n` +
                `📛 *Group:* ${groupMetadata.subject}\n` +
                `👥 *Total Members:* ${participants.length}\n` +
                `👑 *Group Owners:* ${superAdmins.length}\n` +
                `⚡ *Administrators:* ${regularAdmins.length}\n` +
                `🔰 *Total Staff:* ${allAdmins.length}\n\n` +
                `${adminList.trim()}\n\n` +
                `💡 Use *${settings.prefix || '.'}help* for more commands\n\n` +
                `🤖 ${settings.botName || '𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓'}`;

            // ✅ Send with image and mentions
            await sock.sendMessage(chatId, {
                image: { url: pp },
                caption: text,
                mentions: mentions,
                ...getContextInfo()
            }, { quoted: message });

        } catch (error) {
            console.error('❌ Staff command error:', error.message);
            await sock.sendMessage(chatId, {
                text: '❌ Failed to fetch staff list.\n\nMake sure the bot is an admin in the group and try again.',
                ...getContextInfo()
            }, { quoted: message });
        }
    }
};