//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                             𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓                                                                                                     //
//                                                                  𝐕 : 1.0.0                                                                                                             //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2026                                                                                                        //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//* 
//  * command : dice
//  * description : Roll a dice and get random result
//  * Credit To  DEX SHYAM TECH
// ⛥┌┤
// */

const settings = require('../settings');

// Dice faces (Unicode)
const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

// WhatsApp native dice sticker IDs (fallback)
const diceStickers = [
    { id: '1@1', url: 'https://raw.githubusercontent.com/wallyjaytechh/stickers/main/dice/1.webp' },
    { id: '2@1', url: 'https://raw.githubusercontent.com/wallyjaytechh/stickers/main/dice/2.webp' },
    { id: '3@1', url: 'https://raw.githubusercontent.com/wallyjaytechh/stickers/main/dice/3.webp' },
    { id: '4@1', url: 'https://raw.githubusercontent.com/wallyjaytechh/stickers/main/dice/4.webp' },
    { id: '5@1', url: 'https://raw.githubusercontent.com/wallyjaytechh/stickers/main/dice/5.webp' },
    { id: '6@1', url: 'https://raw.githubusercontent.com/wallyjaytechh/stickers/main/dice/6.webp' }
];

module.exports = {
    name: 'dice',
    category: 'Games',
    description: 'Roll a dice and get a random number (1-6)',
    groupOnly: false,
    ownerOnly: false,
    execute: async (sock, chatId, message, args) => {
        try {
            // Random number 1-6
            const result = Math.floor(Math.random() * 6);
            const diceFace = diceFaces[result];
            const diceNumber = result + 1;

            // Build context info from settings (no hardcoded JID)
            const contextInfo = {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: settings.newsletterJid || '120363406449026172@newsletter',
                    newsletterName: settings.newsletterName || 'Dex Shyam Tech',
                    serverMessageId: -1
                }
            };

            // Try to send native dice message
            try {
                await sock.sendMessage(chatId, {
                    dice: diceNumber,
                    contextInfo: contextInfo
                });
                return;
            } catch (diceError) {
                console.log('⚠️ Native dice failed, trying sticker fallback...');
            }

            // Fallback: send dice sticker
            try {
                await sock.sendMessage(chatId, {
                    sticker: { url: diceStickers[result].url },
                    contextInfo: contextInfo
                });
                return;
            } catch (stickerError) {
                console.log('⚠️ Sticker fallback failed, sending text...');
            }

            // Final fallback: plain text
            await sock.sendMessage(chatId, {
                text: `🎲 *DICE ROLL* 🎲\n\n${diceFace} Result: *${diceNumber}*\n\n👤 ${settings.botOwner || 'Dex Shyam Tech'} • 🤖 ${settings.botName || '𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓'}`,
                contextInfo: contextInfo
            });

        } catch (error) {
            console.error('❌ Dice command error:', error.message);
            await sock.sendMessage(chatId, {
                text: '❌ Error rolling the dice. Please try again.'
            });
        }
    }
};