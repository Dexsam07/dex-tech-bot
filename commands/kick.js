//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                             𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓                                                                                                     //
//                                                                  𝐕 : 1.0.0                                                                                                             //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2026                                                                                                        //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//* 
//  * command : kick
//  * description : Remove a user from the group (Admin only)
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
    name: 'kick',
    category: 'Admin',
    description: 'Remove a user from the group (Admin only)',
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
                await sock.sendMessage(chatId, { text: '❌ Bot must be an admin to kick!', ...getContextInfo() }, { quoted: message });
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
                await sock.sendMessage(chatId, { text: '❌ Only admins or owner can kick!', ...getContextInfo() }, { quoted: message });
                return;
            }

            // Target user
            let userToKick = null;
            if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) userToKick = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
            else if (message.message?.extendedTextMessage?.contextInfo?.participant) userToKick = message.message.extendedTextMessage.contextInfo.participant;

            if (!userToKick) {
                await sock.sendMessage(chatId, { text: '⚠️ Mention or reply to a user to kick.', ...getContextInfo() }, { quoted: message });
                return;
            }

            // Protect owner & bot
            if (userToKick === ownerJid) { await sock.sendMessage(chatId, { text: '🚫 Cannot kick the owner!', ...getContextInfo() }, { quoted: message }); return; }
            try { const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'; if (userToKick === botId) { await sock.sendMessage(chatId, { text: '😅 Cannot kick the bot!', ...getContextInfo() }, { quoted: message }); return; } } catch (_) {}

            // Perform kick
            await sock.groupParticipantsUpdate(chatId, [userToKick], 'remove');
            await sock.sendMessage(chatId, {
                text: `👢 *USER KICKED!*\n\n@${userToKick.split('@')[0]} has been removed from the group.`,
                mentions: [userToKick],
                ...getContextInfo()
            }, { quoted: message });
        } catch (error) {
            console.error('❌ Kick error:', error);
            await sock.sendMessage(chatId, { text: '❌ Failed to kick user. Check bot permissions.', ...getContextInfo() }, { quoted: message });
        }
    }
};