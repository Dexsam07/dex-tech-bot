//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                             𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓                                                                                                     //
//                                                                  𝐕 : 1.0.0                                                                                                             //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2026                                                                                                        //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//* 
//  * command : owner
//  * description : Show original bot developer contact information
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

// ========== ORIGINAL CREATOR (Hardcoded - Cannot be changed) ==========
const ORIGINAL_CREATOR = {
    name: "Dex Shyam Tech",
    number: "917384287404",
    social: {
        youtube: "https://youtube.com/@dex_shyam_tech",
        instagram: "https://instagram.com/dex_shyam_42",
        github: "https://github.com/Dexsam07",
        channel: "https://whatsapp.com/channel/0029VbBgXTsKwqSKZKy38w2o"
    }
};

// ========== COMMAND ==========
module.exports = {
    name: 'owner',
    category: 'General',
    description: 'Show original bot developer contact information',
    groupOnly: false,
    ownerOnly: false,

    execute: async (sock, message, args, senderId, chatId) => {
        try {
            // ✅ Send typing indicator
            await sock.sendPresenceUpdate('composing', chatId);

            // ✅ Create vCard
            const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${ORIGINAL_CREATOR.name}
ORG:Dex Shyam Tech;
TITLE:Original Bot Developer
TEL;waid=${ORIGINAL_CREATOR.number}:+${ORIGINAL_CREATOR.number}
NOTE:© 2026 Dex Shyam Tech. Original creator.
END:VCARD`;

            // ✅ Send contact card first
            await sock.sendMessage(chatId, {
                contacts: {
                    displayName: `Original Developer`,
                    contacts: [{ vcard }]
                }
            });

            // ✅ Send detailed info
            const botName = settings.botName || '𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓';
            const ownerMsg = `👑 *ORIGINAL DEVELOPER* 👑\n\n` +
                `*👨‍💻 Creator:* ${ORIGINAL_CREATOR.name}\n` +
                `*📞 Contact:* +${ORIGINAL_CREATOR.number}\n` +
                `*🤖 Bot:* ${botName}\n\n` +
                `⭐ *This bot was originally developed by ${ORIGINAL_CREATOR.name}*\n` +
                `⭐ *Contact the original developer for genuine support*\n\n` +
                `🚫 *This bot may be deployed by someone else*\n` +
                `🚫 *Only the original developer can provide real support and updates*\n\n` +
                `🌐 *Official Sources:*\n` +
                `📺 YouTube: ${ORIGINAL_CREATOR.social.youtube}\n` +
                `📸 Instagram: ${ORIGINAL_CREATOR.social.instagram}\n` +
                `🐙 GitHub: ${ORIGINAL_CREATOR.social.github}\n` +
                `📢 Channel: ${ORIGINAL_CREATOR.social.channel}\n\n` +
                `📌 *Contact the original developer for:*\n` +
                `• Technical support\n` +
                `• Bug reports\n` +
                `• Feature requests\n` +
                `• Custom development\n\n` +
                `*© 2026 ${ORIGINAL_CREATOR.name} - All Rights Reserved*`;

            await sock.sendMessage(chatId, {
                text: ownerMsg,
                ...getContextInfo()
            }, { quoted: message });

        } catch (error) {
            console.error('❌ Owner command error:', error.message);

            // ✅ Ultimate fallback - completely hardcoded
            try {
                await sock.sendMessage(chatId, {
                    text: `👑 *ORIGINAL BOT DEVELOPER* 👑\n\n` +
                        `*Dex Shyam Tech*\n` +
                        `*Official WhatsApp:* +917384287404\n\n` +
                        `*This bot was originally created by Dex Shyam Tech*\n` +
                        `*Contact the original developer for real support*\n\n` +
                        `⚠️ *This may be a deployed copy by someone else*\n` +
                        `⚠️ *Only original developer can provide updates and support*\n\n` +
                        `📺 *YouTube:* youtube.com/@dex_shyam_tech\n` +
                        `📸 *Instagram:* instagram.com/dex_shyam_42\n\n` +
                        `*© 2026 Dex Shyam Tech - All Rights Reserved*`,
                    ...getContextInfo()
                }, { quoted: message });
            } catch (finalError) {
                // Last resort - just send plain text
                await sock.sendMessage(chatId, {
                    text: `👑 Original Developer: Dex Shyam Tech\n📞 Contact: +917384287404\n© 2026 Dex Shyam Tech`
                });
            }
        }
    }
};