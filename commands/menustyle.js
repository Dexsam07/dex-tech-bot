//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                             𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓                                                                                                     //
//                                                                  𝐕 : 1.0.0                                                                                                             //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2026                                                                                                        //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//* 
//  * command : menustyle
//  * description : Change menu display style (12 professional layouts)
//  * Credit To  DEX SHYAM TECH
// ⛥┌┤
// */

const fs = require('fs');
const path = require('path');
const settings = require('../settings');

// ========== CONFIG PATH ==========
const DATA_DIR = path.join(__dirname, '../data');
const CONFIG_PATH = path.join(DATA_DIR, 'menuStyle.json');

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ========== ATOMIC SAVE ==========
function saveDataAtomic(file, data) {
    try {
        const tempFile = file + '.tmp';
        fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
        fs.renameSync(tempFile, file);
        return true;
    } catch (error) {
        console.error(`❌ Error saving ${file}:`, error.message);
        try { fs.unlinkSync(file + '.tmp'); } catch (_) {}
        return false;
    }
}

// ========== SAFE LOAD ==========
function loadConfig() {
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
            const data = JSON.parse(raw);
            return data.style || 1;
        }
    } catch (error) {
        console.error('⚠️ Error loading menuStyle.json, resetting:', error.message);
        saveDataAtomic(CONFIG_PATH, { style: 1 });
    }
    return 1;
}

function saveConfig(style) {
    return saveDataAtomic(CONFIG_PATH, { style });
}

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

// ========== STYLES DEFINITION ==========
const STYLES = {
    1: { name: 'Original Classic', description: 'Boxed design with bold double-line borders' },
    2: { name: 'Archie Drop', description: 'Layered sections with arrow connectors and star dividers' },
    3: { name: 'Starlet', description: 'Flower-star borders with elegant spacing' },
    4: { name: 'Asterisk Ring', description: 'Circular ring markers with clean layout' },
    5: { name: 'Deco Line', description: 'Diamond-pattern decorative lines with cross dividers' },
    6: { name: 'Digital Glitch', description: 'Hexagonal tech-themed markers' },
    7: { name: 'Target Dashboard', description: 'Target point markers with arrow indicators' },
    8: { name: 'Target Point', description: 'Clean target points with play arrows' },
    9: { name: 'Orbit System', description: 'Orbital cross markers with arrow entries' },
    10: { name: 'Arrow Menu', description: 'Sharp arrow indicators with target headers' },
    11: { name: 'Target Profile', description: 'Target-framed profile section' },
    12: { name: 'APL Terminal', description: 'Up-arrow terminal style interface' }
};

// ========== PUBLIC FUNCTIONS ==========
function getCurrentStyle() {
    return loadConfig();
}

function setStyle(style) {
    return saveConfig(style);
}

// ========== COMMAND ==========
module.exports = {
    name: 'menustyle',
    category: 'Utility',
    description: 'Change menu display style (12 professional layouts)',
    groupOnly: false,
    ownerOnly: false,

    execute: async (sock, message, args, senderId, chatId) => {
        try {
            const prefix = settings.prefix || '.';
            const currentStyle = getCurrentStyle();
            const botName = settings.botName || '𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓';

            if (!args || args.length === 0) {
                let styleList = '';
                for (const [id, style] of Object.entries(STYLES)) {
                    const marker = parseInt(id) === currentStyle ? '✅' : '└';
                    styleList += `${marker} *${id}.* ${style.name}\n   _${style.description}_\n\n`;
                }

                await sock.sendMessage(chatId, {
                    text: `📋 *MENU STYLE SETTINGS*\n\n` +
                          `━━━━━━━━━━━━━━━━━━━━\n` +
                          `🟢 *Current Style:* ${STYLES[currentStyle]?.name || 'Original'} (#${currentStyle})\n\n` +
                          `━━━━━━━━━━━━━━━━━━━━\n` +
                          `📖 *Available Styles (12):*\n\n` +
                          `${styleList}` +
                          `━━━━━━━━━━━━━━━━━━━━\n` +
                          `📖 *Commands:*\n` +
                          `└ ${prefix}menustyle <1-12> - Change menu layout\n` +
                          `└ ${prefix}menustyle - Show this menu\n\n` +
                          `✨ *Example:*\n` +
                          `└ ${prefix}menustyle 3\n` +
                          `└ ${prefix}menustyle 7\n\n` +
                          `🎨 Also try ${prefix}menufont <1-12> for text fonts!\n\n` +
                          `🤖 ${botName}`,
                    ...getContextInfo()
                }, { quoted: message });
                return;
            }

            const styleId = parseInt(args[0]);

            if (!STYLES[styleId]) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *INVALID STYLE*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Choose a style from 1-12.\n\n💡 Use ${prefix}menustyle to see all options.`,
                    ...getContextInfo()
                }, { quoted: message });
                return;
            }

            if (styleId === currentStyle) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *ALREADY SET*\n\n━━━━━━━━━━━━━━━━━━━━\n📋 Style *${STYLES[styleId].name}* (#${styleId}) is already active.\n\n💡 Use ${prefix}menustyle <1-12> to switch.\n\n🎨 Also try ${prefix}menufont <1-12> for text fonts!`,
                    ...getContextInfo()
                }, { quoted: message });
                return;
            }

            const success = setStyle(styleId);
            if (!success) {
                await sock.sendMessage(chatId, {
                    text: '❌ Failed to update style. Please try again.',
                    ...getContextInfo()
                }, { quoted: message });
                return;
            }

            await sock.sendMessage(chatId, {
                text: `✅ *STYLE UPDATED*\n\n━━━━━━━━━━━━━━━━━━━━\n📋 *New Style:* ${STYLES[styleId].name} (#${styleId})\n📝 *${STYLES[styleId].description}*\n\n💡 Use ${prefix}menu to see your new layout.\n🎨 Use ${prefix}menufont <1-12> to change text font.\n\n🤖 ${botName}`,
                ...getContextInfo()
            }, { quoted: message });

        } catch (error) {
            console.error('❌ MenuStyle command error:', error.message);
            await sock.sendMessage(chatId, {
                text: '❌ An error occurred while changing the style. Please try again.',
                ...getContextInfo()
            }, { quoted: message });
        }
    }
};

// ========== EXPOSE FOR MENU COMMAND ==========
module.exports.getCurrentStyle = getCurrentStyle;
module.exports.STYLES = STYLES;