//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                             𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓                                                                                                     //
//                                                                  𝐕 : 1.0.0                                                                                                             //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2026                                                                                                        //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//* 
//  * command : clear
//  * description : Clear all messages in the current chat (Owner only)
//  * Credit To  DEX SHYAM TECH
// ⛥┌┤
// */

const settings = require('../settings');
const isOwnerOrSudo = require('../lib/isOwner');

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

async function clearCommand(sock, chatId, message) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);

        if (!message.key.fromMe && !isOwner) {
            await sock.sendMessage(chatId, {
                text: '❌ This command is only for the bot owner!',
                ...getContextInfo()
            }, { quoted: message });
            return;
        }

        // Show typing indicator
        await sock.sendPresenceUpdate('composing', chatId);

        // ✅ CORRECT SYNTAX for clearing chat
        await sock.chatModify(
            {
                delete: true,
                lastMessages: [
                    {
                        id: message.key.id,
                        timestamp: message.messageTimestamp
                    }
                ]
            },
            chatId
        );

        // Send confirmation (will be deleted as well, but we send a new message)
        await sock.sendMessage(chatId, {
            text: '✅ Chat cleared successfully!',
            ...getContextInfo()
        });

    } catch (error) {
        console.error('❌ Clear command error:', error.message);
        await sock.sendMessage(chatId, {
            text: `❌ Failed to clear chat.\nError: ${error.message}`,
            ...getContextInfo()
        }, { quoted: message });
    }
}

module.exports = clearCommand;