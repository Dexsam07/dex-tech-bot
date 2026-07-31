//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                             𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓                                                                                                     //
//                                                                  𝐕 : 1.0.0                                                                                                             //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2026                                                                                                        //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//* 
//  * command : viewonce / vv
//  * description : View view-once (disappearing) images and videos by replying
//  * Credit To  DEX SHYAM TECH
// ⛥┌┤
// */

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const settings = require('../settings');

// ========== CONTEXT INFO (Dynamic) ==========
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

// ========== MAIN COMMAND ==========
async function viewonceCommand(sock, chatId, message) {
    try {
        // Show typing indicator
        await sock.sendPresenceUpdate('composing', chatId);

        // ✅ Step 1: Check if there's a quoted message
        const quotedContext = message.message?.extendedTextMessage?.contextInfo;
        if (!quotedContext || !quotedContext.quotedMessage) {
            await sock.sendMessage(chatId, {
                text: '❌ Please reply to a view-once image or video with `.vv`',
                ...getContextInfo()
            }, { quoted: message });
            return;
        }

        const quoted = quotedContext.quotedMessage;
        const quotedImage = quoted.imageMessage;
        const quotedVideo = quoted.videoMessage;

        // ✅ Step 2: Check if it's a view-once image
        if (quotedImage && quotedImage.viewOnce) {
            try {
                const stream = await downloadContentFromMessage(quotedImage, 'image');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                await sock.sendMessage(chatId, {
                    image: buffer,
                    caption: quotedImage.caption || '📸 View-once image',
                    ...getContextInfo()
                }, { quoted: message });
                return;
            } catch (downloadError) {
                console.error('❌ Image download error:', downloadError.message);
                await sock.sendMessage(chatId, {
                    text: '❌ Failed to download view-once image. It may have expired.',
                    ...getContextInfo()
                }, { quoted: message });
                return;
            }
        }

        // ✅ Step 3: Check if it's a view-once video
        if (quotedVideo && quotedVideo.viewOnce) {
            try {
                const stream = await downloadContentFromMessage(quotedVideo, 'video');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                await sock.sendMessage(chatId, {
                    video: buffer,
                    caption: quotedVideo.caption || '🎥 View-once video',
                    ...getContextInfo()
                }, { quoted: message });
                return;
            } catch (downloadError) {
                console.error('❌ Video download error:', downloadError.message);
                await sock.sendMessage(chatId, {
                    text: '❌ Failed to download view-once video. It may have expired.',
                    ...getContextInfo()
                }, { quoted: message });
                return;
            }
        }

        // ✅ Step 4: If not view-once
        await sock.sendMessage(chatId, {
            text: '❌ The quoted message is not a view-once media (image/video with "View Once" enabled).',
            ...getContextInfo()
        }, { quoted: message });

    } catch (error) {
        console.error('❌ viewonce command error:', error.message);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to process view-once media. Please try again.',
            ...getContextInfo()
        }, { quoted: message });
    }
}

module.exports = viewonceCommand;