//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                             𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓                                                                                                     //
//                                                                  𝐕 : 1.0.0                                                                                                             //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2026                                                                                                        //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//* 
//  * command : promote
//  * description : Promote a user to admin (Admin only)
//  * Credit To  DEX SHYAM TECH
// ⛥┌┤
// */

const settings = require('../settings');

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
    name: 'promote',
    category: 'Admin',
    description: 'Promote a user to admin (Admin only)',
    groupOnly: true,
    ownerOnly: false,
    execute: async (sock, message, args, senderId, chatId) => {
        try {
            // Bot admin check
            let isBotAdmin = false;
            try {
                const meta = await sock.groupMetadata(chatId);
                const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                const p = meta.participants.find(p => p.id === botId);
                isBotAdmin = p && (p.admin === 'admin' || p.admin === 'superadmin');
            } catch (_) {}
            if (!isBotAdmin) {
                await sock.sendMessage(chatId, { text: '❌ Bot must be an admin to promote!', ...getContextInfo() }, { quoted: message });
                return;
            }

            // Sender admin check
            let isSenderAdmin = false;
            try {
                const meta = await sock.groupMetadata(chatId);
                const p = meta.participants.find(p => p.id === senderId);
                isSenderAdmin = p && (p.admin === 'admin' || p.admin === 'superadmin');
            } catch (_) {}
            const ownerJid = settings.ownerNumber.includes('@') ? settings.ownerNumber : `${settings.ownerNumber}@s.whatsapp.net`;
            const isOwner = senderId === ownerJid || senderId === sock.user.id;
            if (!isSenderAdmin && !isOwner) {
                await sock.sendMessage(chatId, { text: '❌ Only admins or owner can promote!', ...getContextInfo() }, { quoted: message });
                return;
            }

            // Target user
            let userToPromote = null;
            if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) userToPromote = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
            else if (message.message?.extendedTextMessage?.contextInfo?.participant) userToPromote = message.message.extendedTextMessage.contextInfo.participant;

            if (!userToPromote) {
                await sock.sendMessage(chatId, { text: '⚠️ Mention or reply to a user to promote.', ...getContextInfo() }, { quoted: message });
                return;
            }

            // Prevent promoting owner/bot (pointless)
            if (userToPromote === ownerJid) { await sock.sendMessage(chatId, { text: '👑 Owner is already the highest admin!', ...getContextInfo() }, { quoted: message }); return; }
            try { const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'; if (userToPromote === botId) { await sock.sendMessage(chatId, { text: '😅 Bot is already admin!', ...getContextInfo() }, { quoted: message }); return; } } catch (_) {}

            // Perform promote
            await sock.groupParticipantsUpdate(chatId, [userToPromote], 'promote');
            await sock.sendMessage(chatId, {
                text: `⬆️ *USER PROMOTED!*\n\n@${userToPromote.split('@')[0]} is now an admin.`,
                mentions: [userToPromote],
                ...getContextInfo()
            }, { quoted: message });
        } catch (error) {
            console.error('❌ Promote error:', error);
            await sock.sendMessage(chatId, { text: '❌ Failed to promote user. Check bot permissions.', ...getContextInfo() }, { quoted: message });
        }
    }
};