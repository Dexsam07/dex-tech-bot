//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                             𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓                                                                                                     //
//                                                                  𝐕 : 1.0.0                                                                                                             //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2026                                                                                                        //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//* 
//  * command : viewonce
//  * description : View once (view-once) images and videos by replying to them
//  * Credit To  DEX SHYAM TECH
// ⛥┌┤
// */

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const settings = require('../settings');

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

// ========== COMMAND ==========
module.exports = {
    name: 'viewonce',
    category: 'Utility',
    description: 'View once (view-once) images and videos by replying to them',
    groupOnly: false,
    ownerOnly: false,

    execute: async (sock, message, args, senderId, chatId) => {
        try {
            // Show typing indicator
            await sock.sendPresenceUpdate('composing', chatId);

            // Get quoted message
            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quoted) {
                await sock.sendMessage(chatId, {
                    text: '❌ Please reply to a view-once image or video.\n\nUsage: *Reply to a view-once message with .viewonce*',
                    ...getContextInfo()
                }, { quoted: message });
                return;
            }

            // Check for view-once image
            const imageMsg = quoted.imageMessage;
            const videoMsg = quoted.videoMessage;

            if (imageMsg && imageMsg.viewOnce) {
                // Download image
                const stream = await downloadContentFromMessage(imageMsg, 'image');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                await sock.sendMessage(chatId, {
                    image: buffer,
                    fileName: 'viewonce_image.jpg',
                    caption: imageMsg.caption || '📸 View-once image',
                    ...getContextInfo()
                }, { quoted: message });
                return;
            }

            if (videoMsg && videoMsg.viewOnce) {
                // Download video
                const stream = await downloadContentFromMessage(videoMsg, 'video');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                await sock.sendMessage(chatId, {
                    video: buffer,
                    fileName: 'viewonce_video.mp4',
                    caption: videoMsg.caption || '🎥 View-once video',
                    ...getContextInfo()
                }, { quoted: message });
                return;
            }

            // If not view-once
            await sock.sendMessage(chatId, {
                text: '❌ The quoted message is not a view-once media.\nReply to a view-once image or video with `.viewonce`.',
                ...getContextInfo()
            }, { quoted: message });

        } catch (error) {
            console.error('❌ ViewOnce command error:', error.message);
            await sock.sendMessage(chatId, {
                text: '❌ Failed to retrieve view-once media. Make sure the media is still available and you are replying to it.',
                ...getContextInfo()
            }, { quoted: message });
        }
    }
};