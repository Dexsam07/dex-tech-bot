 const settings = require('../settings');

async function ownerCommand(sock, chatId, message) {
    try {
        // HARDCODED - CANNOT BE CHANGED BY DEPLOYERS
        const ORIGINAL_CREATOR = {
            name: "Dex Shyam Tech",
            number: "917384287404", 
            social: {
                youtube: "youtube.com/@dex_shyam_tech",
                github: "github.com/"
            }
        };

        const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${ORIGINAL_CREATOR.name}
ORG:Dex Shyam Tech;
TITLE:Original Bot Developer
TEL;waid=${ORIGINAL_CREATOR.number}:+${ORIGINAL_CREATOR.number}
NOTE:© 2026 Dex Shyam Tech. Original creator.
END:VCARD`;

        await sock.sendMessage(chatId, {
            contacts: {
                displayName: `Original Developer`,
                contacts: [{ vcard }]
            }
        });

        await sock.sendMessage(chatId, {
            text: `🔐 *ORIGINAL DEVELOPER CONTACT* 🔐

*👨‍💻 Original Creator:* ${ORIGINAL_CREATOR.name}
*📞 Official Contact:* +${ORIGINAL_CREATOR.number}
*🤖 Original Bot:* ${settings.botName}

⭐ *This bot was originally developed by Dex Shyam Tech*
⭐ *Contact above number for genuine support*

🚫 *This bot might be deployed by someone else*
🚫 *But only the original developer can provide real support*

🌐 *Official Sources:*
📹 ${ORIGINAL_CREATOR.social.youtube}
🐙 ${ORIGINAL_CREATOR.social.github}

*© 2026 Dex Shyam Tech - All Rights Reserved*`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363410099245350@newsletter',
                    newsletterName: 'Dex Shyam Tech',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });

    } catch (error) {
        // Ultimate fallback - completely hardcoded
        await sock.sendMessage(chatId, {
            text: `👑 *ORIGINAL BOT DEVELOPER* 👑

*Dex Shyam Tech - 𝗠𝗢𝗡 𝗦𝗧𝗘𝗥  *
*Official WhatsApp:* 917384287404

*This bot was originally created by 𝗠𝗢𝗡 𝗦𝗧𝗘𝗥  *
*Contact the original developer for real support*

⚠️ *This may be a deployed copy by someone else*
⚠️ *Only original developer can provide updates*`
        }, { quoted: message });
    }
}

module.exports = ownerCommand;
