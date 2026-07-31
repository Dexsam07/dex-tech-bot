//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                             𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓                                                                                                     //
//                                                                  𝐕 : 1.0.0                                                                                                             //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2026                                                                                                        //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//* 
//  * command : github / git / repo
//  * description : Show GitHub repository information for DEX TECH BOT
//  * Credit To  DEX SHYAM TECH
// ⛥┌┤
// */

const moment = require('moment-timezone');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const settings = require('../settings');

// ========== DYNAMIC CONTEXT ==========
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
async function githubCommand(sock, chatId, message) {
    try {
        // Show typing indicator
        await sock.sendPresenceUpdate('composing', chatId);

        // ✅ FIX: GitHub API URL (not YouTube)
        const repo = 'Dexsam07/dex-tech-bot';
        const apiUrl = `https://api.github.com/repos/${repo}`;

        const res = await fetch(apiUrl, {
            headers: {
                'User-Agent': 'DEX-TECH-BOT',
                'Accept': 'application/vnd.github.v3+json'
            },
            timeout: 10000
        });

        if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);

        const json = await res.json();

        // Create professional formatted message
        const timezone = settings.timezone || 'Asia/Kolkata';
        let txt = `*🤖 DEX TECH BOT REPOSITORY* 🤖\n\n`;
        txt += `📛 *Repository:* ${json.name || 'dex-tech-bot'}\n`;
        txt += `📖 *Description:* ${json.description || 'A Multi-Device WhatsApp User Bot'}\n`;
        txt += `👁️ *Watchers:* ${json.watchers_count?.toLocaleString() || '0'}\n`;
        txt += `💾 *Size:* ${(json.size / 1024).toFixed(2)} MB\n`;
        txt += `🕒 *Last Updated:* ${json.updated_at ? moment(json.updated_at).tz(timezone).format('DD MMM YYYY - HH:mm:ss') : 'Unknown'}\n`;
        txt += `🌐 *URL:* ${json.html_url || 'https://github.com/Dexsam07/dex-tech-bot'}\n`;
        txt += `🔀 *Forks:* ${json.forks_count?.toLocaleString() || '0'}\n`;
        txt += `⭐ *Stars:* ${json.stargazers_count?.toLocaleString() || '0'}\n`;
        txt += `🐛 *Open Issues:* ${json.open_issues_count?.toLocaleString() || '0'}\n`;
        txt += `🌿 *Branch:* ${json.default_branch || 'main'}\n`;
        txt += `📄 *Language:* ${json.language || 'JavaScript'}\n\n`;
        txt += `📊 *Statistics:*\n`;
        txt += `├─ ⭐ Stars: ${json.stargazers_count?.toLocaleString() || '0'}\n`;
        txt += `├─ 🔄 Forks: ${json.forks_count?.toLocaleString() || '0'}\n`;
        txt += `├─ 👁️ Watchers: ${json.watchers_count?.toLocaleString() || '0'}\n`;
        txt += `└─ 🐛 Issues: ${json.open_issues_count?.toLocaleString() || '0'}\n\n`;
        txt += `🔗 *Quick Links:*\n`;
        txt += `• 📂 [View Repository](${json.html_url || 'https://github.com/Dexsam07/dex-tech-bot'})\n`;
        txt += `• 🐛 [Report Issues](${json.html_url ? json.html_url + '/issues' : 'https://github.com/Dexsam07/dex-tech-bot/issues'})\n`;
        txt += `• 📺 [Deployment Tutorial](https://youtu.be/Hmp17yyU9Xc?si=cNmiNPD8_gfH7WRY)\n\n`;
        txt += `*© ${settings.botOwner || 'Dex Shyam Tech'} 2026 | All Rights Reserved*`;

        // Try local image
        let imageBuffer;
        const imgPath = path.join(__dirname, '../assets/bot_image.jpg');
        if (fs.existsSync(imgPath)) {
            imageBuffer = fs.readFileSync(imgPath);
        } else if (json.owner?.avatar_url) {
            // Fallback to owner avatar
            try {
                const avatarRes = await fetch(json.owner.avatar_url);
                imageBuffer = await avatarRes.buffer();
            } catch (e) {}
        }

        const context = getContextInfo();

        if (imageBuffer) {
            await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: txt,
                ...context
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, {
                text: txt,
                ...context
            }, { quoted: message });
        }

        console.log('✅ GitHub info sent successfully');

    } catch (error) {
        console.error('❌ GitHub command error:', error.message);

        // Fallback: send basic info without API
        const fallbackText = `🤖 *DEX TECH BOT REPOSITORY* 🤖\n\n` +
            `📛 *Repository:* dex-tech-bot\n` +
            `👤 *Owner:* Dexsam07\n` +
            `📖 *Description:* A Multi-Device WhatsApp User Bot\n` +
            `🌐 *URL:* https://github.com/Dexsam07/dex-tech-bot\n\n` +
            `💡 *Unable to fetch live stats at the moment.*\n` +
            `🔗 *Visit:* https://github.com/Dexsam07/dex-tech-bot\n\n` +
            `© ${settings.botOwner || 'Dex Shyam Tech'} 2026`;

        await sock.sendMessage(chatId, {
            text: fallbackText,
            ...getContextInfo()
        }, { quoted: message });
    }
}

// ========== HELPER: Get repo stats (optional) ==========
async function getRepoStats() {
    try {
        const res = await fetch('https://api.github.com/repos/Dexsam07/dex-tech-bot', {
            headers: { 'User-Agent': 'DEX-TECH-BOT' }
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        console.error('Error fetching repo stats:', error);
        return null;
    }
}

module.exports = githubCommand;
module.exports.getRepoStats = getRepoStats;