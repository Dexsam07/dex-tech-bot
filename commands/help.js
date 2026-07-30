//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                             𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓                                                                                                     //
//                                                                  𝐕 : 1.0.0                                                                                                             //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2026                                                                                                        //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//* 
//  * command : help / menu
//  * description : Professional interactive menu with all commands, stats, and bot comparison
//  * Credit To  DEX SHYAM TECH
// ⛥┌┤
// */

const fs = require('fs');
const path = require('path');
const settings = require('../settings');

// ========== SAFE IMPORTS (with fallback) ==========
let getCurrentFont = () => 1;
let applyFont = (text) => text;
let getCurrentStyle = () => 1;

try {
    const fontModule = require('./menufont');
    if (fontModule.getCurrentFont) getCurrentFont = fontModule.getCurrentFont;
    if (fontModule.applyFont) applyFont = fontModule.applyFont;
} catch (e) {
    console.warn('⚠️ menufont.js not loaded, using defaults');
}

try {
    const styleModule = require('./menustyle');
    if (styleModule.getCurrentStyle) getCurrentStyle = styleModule.getCurrentStyle;
} catch (e) {
    console.warn('⚠️ menustyle.js not loaded, using default style');
}

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

// ========== UTILITY FUNCTIONS (with fallbacks) ==========
function getDeploymentPlatform() {
    if (process.env.RENDER) return 'Render';
    if (process.env.CODESPACE_NAME) return 'Codespaces';
    if (process.env.PANEL_APP) return 'Panel';
    if (process.env.REPL_SLUG) return 'Replit';
    if (process.env.KOYEB_APP) return 'Koyeb';
    if (process.env.FLY_APP_NAME) return 'Fly.io';
    if (process.env.GLITCH_PROJECT_ID) return 'Glitch';
    if (process.env.VERCEL) return 'Vercel';
    if (process.env.HEROKU_APP_NAME) return 'Heroku';
    if (process.env.RAILWAY_ENVIRONMENT) return 'Railway';
    return 'Local Machine';
}

function getPrefix() { return settings.prefix || '.'; }

function getBotMode() {
    try {
        const p = path.join(__dirname, '../data/messageCount.json');
        if (fs.existsSync(p)) {
            const d = JSON.parse(fs.readFileSync(p, 'utf8'));
            if (typeof d.isPublic === 'boolean') return d.isPublic ? 'PUBLIC 🌐' : 'PRIVATE 🔒';
        }
        return 'PUBLIC 🌐';
    } catch (e) { return 'PUBLIC 🌐'; }
}

function getTimeBasedGreeting() {
    try {
        const now = new Date();
        const tz = settings.timezone || 'Asia/Kolkata';
        const hour = parseInt(now.toLocaleString('en-US', { timeZone: tz, hour12: false, hour: '2-digit' }));
        const time = now.toLocaleString('en-US', { timeZone: tz, hour12: true, hour: '2-digit', minute: '2-digit' });
        if (hour >= 5 && hour < 12) return { greeting: '🌅 Good Morning', emoji: '🌅', time, message: 'Have a wonderful day ahead!' };
        if (hour >= 12 && hour < 17) return { greeting: '☀️ Good Afternoon', emoji: '☀️', time, message: 'Hope you\'re having a great day!' };
        if (hour >= 17 && hour < 21) return { greeting: '🌇 Good Evening', emoji: '🌇', time, message: 'Hope you had a productive day!' };
        return { greeting: '🌙 Good Night', emoji: '🌙', time, message: 'Have a peaceful night!' };
    } catch (e) { return { greeting: '👋 Hello', emoji: '👋', time: new Date().toLocaleTimeString(), message: 'Nice to see you!' }; }
}

function getDayWithEmoji() {
    try {
        const now = new Date();
        const tz = settings.timezone || 'Asia/Kolkata';
        const day = now.toLocaleString('en-US', { timeZone: tz, weekday: 'long' });
        const map = { 'Monday': '📅', 'Tuesday': '🔥', 'Wednesday': '🌎', 'Thursday': '🚀', 'Friday': '🎉', 'Saturday': '🌈', 'Sunday': '☀️' };
        return { day, emoji: map[day] || '📅' };
    } catch (e) { return { day: 'Today', emoji: '📅' }; }
}

function getUserName(sock, userId) {
    try { return sock.getName(userId) || userId.split('@')[0] || 'User'; }
    catch (e) { return userId.split('@')[0] || 'User'; }
}

function getPlatformEmoji(platform) {
    const map = { 'Render': '☁️', 'Codespaces': '💻', 'Panel': '🛠️', 'Local Machine': '🏠', 'Replit': '⚡', 'Koyeb': '🚀', 'Fly.io': '✈️', 'Glitch': '🌀', 'Vercel': '▲', 'Heroku': '⚙️', 'Railway': '🚂' };
    return map[platform] || '❓';
}

function countTotalCommands() {
    try {
        const p = path.join(__dirname, '../main.js');
        if (!fs.existsSync(p)) return 180;
        const c = fs.readFileSync(p, 'utf8');
        const re = /case\s+userMessage\s*(===|\.startsWith\(|\.includes\(|\.match\()\s*['"`][^'"`]+['"`]/g;
        const matches = c.match(re);
        return matches ? matches.length : 180;
    } catch (e) { return 180; }
}

function getLocalizedTime() {
    try {
        const tz = settings.timezone || 'Asia/Kolkata';
        return new Date().toLocaleString('en-US', {
            timeZone: tz,
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (e) { return new Date().toLocaleString(); }
}

// ========== STATS (Atomic) ==========
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

function loadStats() {
    const statsPath = path.join(__dirname, '../data/userStats.json');
    const defaultStats = { totalUsers: 0, activeUsers: {}, platforms: {}, users: {}, lastUpdated: Date.now(), botName: settings.botName || 'Dex Shyam Tech', version: settings.version || '1.0.0' };
    try {
        if (fs.existsSync(statsPath)) {
            const raw = fs.readFileSync(statsPath, 'utf8');
            return JSON.parse(raw);
        }
    } catch (e) { console.error('⚠️ Stats file corrupt, resetting'); }
    return defaultStats;
}

function updateUserStats(userJid, platform) {
    const statsPath = path.join(__dirname, '../data/userStats.json');
    const dataDir = path.dirname(statsPath);
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    let stats = loadStats();
    const userPhone = userJid.split('@')[0];
    const userKey = `user_${userPhone}`;
    const currentTime = Date.now();
    const isNewUser = !stats.users[userKey];
    stats.users[userKey] = {
        phone: userPhone,
        platform: platform,
        lastActive: currentTime,
        firstSeen: isNewUser ? currentTime : (stats.users[userKey]?.firstSeen || currentTime),
        totalUses: (stats.users[userKey]?.totalUses || 0) + 1
    };
    if (isNewUser) {
        stats.platforms[platform] = (stats.platforms[platform] || 0) + 1;
        stats.totalUsers = Object.keys(stats.users).length;
    }
    stats.activeUsers[userKey] = currentTime;
    const thirtyMinutesAgo = currentTime - (30 * 60 * 1000);
    Object.keys(stats.activeUsers).forEach(key => {
        if (stats.activeUsers[key] < thirtyMinutesAgo) delete stats.activeUsers[key];
    });
    stats.lastUpdated = currentTime;
    saveDataAtomic(statsPath, stats);
    return { totalUsers: stats.totalUsers, activeUsers: Object.keys(stats.activeUsers).length, platforms: stats.platforms };
}

function getUserStats() {
    const stats = loadStats();
    const currentTime = Date.now();
    const thirtyMinutesAgo = currentTime - (30 * 60 * 1000);
    if (stats.activeUsers) {
        Object.keys(stats.activeUsers).forEach(key => {
            if (stats.activeUsers[key] < thirtyMinutesAgo) delete stats.activeUsers[key];
        });
    }
    return {
        totalUsers: stats.totalUsers || Object.keys(stats.users || {}).length,
        activeUsers: Object.keys(stats.activeUsers || {}).length,
        platforms: stats.platforms || {}
    };
}

// ========== BUILD MENU TEXT (Dynamic Style) ==========
function buildMenu(styleId, data) {
    const { userName, greeting, prefix, totalCommands, stats, dayInfo, currentBotMode, menuType, userPlatform, getLocalizedTime } = data;

    const infoLines = [
        `User  : @${userName}`,
        `Bot   : ${settings.botName || 'Dex Shyam Tech'}`,
        `Owner : ${settings.botOwner || 'Shyam Choudhari'}`,
        `Prefix: ${prefix}`,
        `Style : ${styleId}`,
        `Media : ${menuType}`,
        `TZone : ${settings.timezone}`,
        `Time  : ${greeting.time}`,
        `Day   : ${dayInfo.day}`,
        `Mode  : ${currentBotMode}`,
        `Cmds  : ${totalCommands}`,
        `Date  : ${getLocalizedTime()}`,
        `Active: ${stats.activeUsers}`,
        `Total : ${stats.totalUsers}`
    ];

    const allCommands = [
        ['🧠 AI', [`.flux`, `.gemini`, `.gpt`, `.imagine`, `.sora`]],
        ['🦹 ANIME', [`.cry`, `.facepalm`, `.hug`, `.kiss`, `.nom`, `.pat`, `.poke`, `.wink`]],
        ['📥 DOWNLOAD', [`.facebook`, `.instagram`, `.play`, `.song`, `.spotify`, `.tiktok`, `.video`, `.ytmp4`]],
        ['🔤 EPHOTO', [`.1917`, `.arena`, `.blackpink`, `.devil`, `.fire`, `.glitch`, `.hacker`, `.ice`, `.impressive`, `.leaves`, `.light`, `.matrix`, `.metallic`, `.neon`, `.purple`, `.sand`, `.snow`, `.thunder`]],
        ['😁 FUN', [`.character`, `.compliment`, `.flirt`, `.goodnight`, `.insult`, `.poet`, `.roseday`, `.simp`, `.wasted`]],
        ['🎮 GAMES', [`.answer`, `.buychips`, `.coindaily`, `.coinflip`, `.coinhelp`, `.coinleaderboard`, `.coinstats`, `.dare`, `.guess`, `.hangman`, `.tictactoe`, `.trivia`, `.truth`]],
        ['🌐 GENERAL', [`.8ball`, `.alive`, `.attp`, `.clear`, `.fact`, `.getjid`, `.help`, `.joke`, `.lyrics`, `.menu`, `.news`, `.owner`, `.ping`, `.quote`, `.ss`, `.trt`, `.tts`, `.url`, `.vv`, `.weather`]],
        ['💻 GITHUB', [`.git`, `.github`, `.repo`, `.sc`, `.script`]],
        ['👥 GROUP', [`.admins`, `.antibadword`, `.antibot`, `.antilink`, `.antitag`, `.ban`, `.chatbot`, `.delete`, `.demote`, `.goodbye`, `.groupinfo`, `.hidetag`, `.jid`, `.kick`, `.mute`, `.promote`, `.resetlink`, `.setgdesc`, `.setgname`, `.setgpp`, `.ship`, `.stupid`, `.tag`, `.tagall`, `.tagnotadmin`, `.unban`, `.unmute`, `.warn`, `.warnings`, `.welcome`]],
        ['🧩 MISC', [`.circle`, `.comrade`, `.gay`, `.glass`, `.heart`, `.horny`, `.its-so-stupid`, `.jail`, `.lgbt`, `.lolice`, `.namecard`, `.oogway`, `.oogway2`, `.passed`, `.tonikawa`, `.triggered`, `.tweet`, `.ytcomment`]],
        ['🔒 OWNER', [`.anticall`, `.antidelete`, `.antiforeign`, `.autoreact`, `.autoread`, `.autorecord`, `.autorecordtype`, `.autostatus`, `.autotyping`, `.block`, `.botinfo`, `.checkupdate`, `.clearsession`, `.cleartmp`, `.confighelp`, `.getpp`, `.join`, `.leave`, `.mention`, `.menufont`, `.menustyle`, `.mode`, `.pmblocker`, `.poll`, `.restart`, `.setauthor`, `.setbotname`, `.setbotowner`, `.setmention`, `.setownernumber`, `.setpackname`, `.setpp`, `.setprefix`, `.settings`, `.settimezone`, `.setytchannel`, `.sudo`, `.tempfile`, `.unblock`, `.update`, `.vote`]],
        ['🎨 STICKER', [`.blur`, `.crop`, `.emojimix`, `.igsc`, `.igs`, `.meme`, `.removebg`, `.remini`, `.simage`, `.sticker`, `.take`, `.tgsticker`]]
    ];

    const styles = {
        2: { top: '╭──❍「 USER INFO 」❍', line: '├•', secHdr: (s) => `╰─┬─★─☆─♪♪─❍\n╭─┴❍「 ${s} 」❍`, bot: '╰─┬─★─☆─♪♪─❍', bul: '├• ' },
        3: { top: '╭──✤「 USER PANEL 」✤', line: '├•', secHdr: (s) => `╰─✤─✤─✤─✤─✤─✤─✤─✤\n╭──✤「 ${s} 」✤`, bot: '╰─✤─✤─✤─✤─✤─✤─✤─✤', bul: '├• ' },
        4: { top: '╭──⍟「 BOT STATUS 」⍟', line: '⤚', secHdr: (s) => `╰─⍟─⍟─⍟─⍟─⍟─⍟─⍟─⍟\n╭──⍟「 ${s} 」⍟`, bot: '╰─⍟─⍟─⍟─⍟─⍟─⍟─⍟─⍟', bul: '⤚ ' },
        5: { top: '━━━❖━⦿━❖━⦿━❖━⦿━❖━⦿━━━\n╭──❖「 USER INFO 」❖', line: '⤚', secHdr: (s) => `╰─❖─❖─❖─❖─❖─❖─❖─❖\n╭──❖「 ${s} 」❖`, bot: '╰─❖─❖─❖─❖─❖─❖─❖─❖', bul: '⤚ ' },
        6: { top: '╭──⌬「 MAIN MENU 」⌬', line: '⤚', secHdr: (s) => `╰─⌬─⌬─⌬─⌬─⌬─⌬─⌬─⌬\n╭──⌬「 ${s} 」⌬`, bot: '╰─⌬─⌬─⌬─⌬─⌬─⌬─⌬─⌬', bul: '⤚ ' },
        7: { top: '╭──⏣「 DASHBOARD 」⏣', line: '⤷', secHdr: (s) => `╰─⏣─⏣─⏣─⏣─⏣─⏣─⏣─⏣\n╭──⏣「 ${s} 」⏣`, bot: '╰─⏣─⏣─⏣─⏣─⏣─⏣─⏣─⏣', bul: '⤷ ' },
        8: { top: '╭──⏣「 STATUS 」⏣', line: '▶', secHdr: (s) => `╰─⏣─⏣─⏣─⏣─⏣─⏣─⏣─⏣\n╭──⏣「 ${s} 」⏣`, bot: '╰─⏣─⏣─⏣─⏣─⏣─⏣─⏣─⏣', bul: '▶ ' },
        9: { top: '╭──⨁「 SYSTEM 」⨁', line: '⤷', secHdr: (s) => `╰─⨁─⨁─⨁─⨁─⨁─⨁─⨁─⨁\n╭──⨁「 ${s} 」⨁`, bot: '╰─⨁─⨁─⨁─⨁─⨁─⨁─⨁─⨁', bul: '⤷ ' },
        10: { top: '╭──⏣「 MENU HEADER 」⏣', line: '▸', secHdr: (s) => `╰─⏣─⏣─⏣─⏣─⏣─⏣─⏣─⏣\n╭──⏣「 ${s} 」⏣`, bot: '╰─⏣─⏣─⏣─⏣─⏣─⏣─⏣─⏣', bul: '▸ ' },
        11: { top: '╭──⏣「 PROFILE 」⏣', line: '▸', secHdr: (s) => `╰─⏣─⏣─⏣─⏣─⏣─⏣─⏣─⏣\n╭──⏣「 ${s} 」⏣`, bot: '╰─⏣─⏣─⏣─⏣─⏣─⏣─⏣─⏣', bul: '▸ ' },
        12: { top: '╭──⍋「 BOT INFO 」⍋', line: '▶', secHdr: (s) => `╰─⍋─⍋─⍋─⍋─⍋─⍋─⍋─⍋\n╭──⍋「 ${s} 」⍋`, bot: '╰─⍋─⍋─⍋─⍋─⍋─⍋─⍋─⍋', bul: '▶ ' }
    };

    const s = styles[styleId] || styles[2];

    let menu = `👋 Hello @${userName}! ${greeting.message}\n\n`;
    menu += `${greeting.greeting}! Here's your menu:\n\n`;
    menu += s.top + '\n';
    for (const l of infoLines) menu += s.line + ' ' + l + '\n';
    menu += s.bot + '\n\n';
    menu += `   ⬇️ ALL COMMANDS ⬇️\n\n`;
    for (const [title, cmds] of allCommands) {
        menu += s.secHdr(title) + '\n';
        for (const cmd of cmds) menu += s.bul + cmd + '\n';
    }
    menu += s.bot + '\n\n';
    menu += `📊 Total Commands: ${totalCommands}\n\n`;
    menu += `📊 Local Stats: ${stats.activeUsers} active now, ${stats.totalUsers} total users\n\n`;
    menu += `${greeting.emoji} ${greeting.greeting}, @${userName}! ${greeting.message}\n\n`;
    menu += `⬇️Join our channel below for updates⬇️`;
    return menu;
}

// ========== COMPARE WITH GAAJU-XMD (Optional Feature) ==========
function getComparisonText() {
    return `
╭──❍「 BOT COMPARISON 」❍
├• Feature         | Dex-Tech-Bot | GAAJU-XMD
├─────────────────────────────────────
├• Baileys        | ✅ rc.15    | ✅ rc.15
├• Session String  | ✅          | ✅
├• Atomic Saves    | ✅          | ❌
├• Dynamic Newsl.  | ✅          | ❌
├• India Timezone  | ✅          | ❌
├• Admin Cache     | ✅          | ❌
├• Smart Lock      | ✅          | ❌
├• Code Quality    | ⭐⭐⭐⭐⭐     | ⭐⭐
├• Security        | ⭐⭐⭐⭐⭐     | ⭐⭐⭐
╰─────────────────────────────────────
✅ Dex-Tech-Bot is more advanced, stable & secure.
`;
}

// ========== MAIN HELP FUNCTION ==========
async function helpCommand(sock, chatId, message, channelLink) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const userName = await getUserName(sock, senderId);
        const greeting = getTimeBasedGreeting();
        const dayInfo = getDayWithEmoji();
        const currentBotMode = getBotMode();
        const prefix = getPrefix();
        const userPlatform = getDeploymentPlatform();
        const totalCommands = countTotalCommands();
        const stats = getUserStats();
        let fontId = 1;
        let styleId = 1;
        try { fontId = getCurrentFont(); } catch (e) {}
        try { styleId = getCurrentStyle(); } catch (e) {}

        // Update stats
        updateUserStats(senderId, userPlatform);

        // Determine media type (with safe file check)
        let menuType = 'TEXT';
        const imagePath = path.join(__dirname, '../assets/bot_image.jpg');
        const videoPath = path.join(__dirname, '../assets/menu_video.mp4');
        const imageExists = fs.existsSync(imagePath);
        const videoExists = fs.existsSync(videoPath);
        if (imageExists && videoExists) menuType = Math.random() < 0.5 ? 'IMAGE' : 'VIDEO';
        else if (imageExists) menuType = 'IMAGE';
        else if (videoExists) menuType = 'VIDEO';

        const getLocalized = getLocalizedTime;

        let menuText;

        // Style 1: Classic hardcoded menu (with your branding) - FALLBACK SAFE
        try {
            if (styleId === 1) {
                const botName = settings.botName || 'Dex Shyam Tech';
                const botOwner = settings.botOwner || 'Shyam Choudhari';
                const ytChannel = settings.ytChannel || 'Dex Shyam Tech';
                const ownerNumber = settings.ownerNumber || '917384287404';
                const timezone = settings.timezone || 'Asia/Kolkata';
                const totalCmds = totalCommands;
                const active = stats.activeUsers;
                const total = stats.totalUsers;

                // Build platform stats
                let platformStatsText = '';
                const platforms = stats.platforms || {};
                const platformEntries = Object.entries(platforms).sort((a, b) => b[1] - a[1]);
                platformStatsText = platformEntries.length > 0
                    ? platformEntries.map(([p, c]) => `│     ${getPlatformEmoji(p)} ${p}: ${c} users`).join('\n')
                    : '│     📊 No platform data yet';

                const statsData = loadStats();
                const userKey = `user_${senderId.split('@')[0]}`;
                const userUsage = statsData.users?.[userKey]?.totalUses || 1;
                const usageText = `│     📈 Your Usage: ${userUsage} commands`;

                const now = getLocalized();

                // Build classic menu (long, but safe)
                menuText = `
👋 Hello @${userName}! ${greeting.message}

${greeting.greeting}! Here's your menu:

╭──⟢ ${botName} ⟣──╮
│ 👤 User: @${userName}
│ 🤖 Bot: ${botName}
│ 🧠 Version: ${settings.version || '1.0.0'}
│ 👑 Owner: ${botOwner}
│ 📺 Channel: ${ytChannel}
│ 📞 Number: +${ownerNumber}
│ 📥 Prefix: ${prefix}
│ 🎨 Style: ${styleId}
│ 🎬 Menu: ${menuType}
│ 🌍 TimeZone: ${timezone}
│ ⏰ Time: ${greeting.time}
│ ${dayInfo.emoji} Day: ${dayInfo.day}
│ 💻 Mode: ${currentBotMode}
│ 📊 Commands: ${totalCmds}
│ 📅 Date: ${now}
│ 📡 Platform: ${userPlatform}
│ 👥 Active Users: ${active}
│ 📈 Total Users: ${total}
${usageText}
│ 🌐 Users by Platform:
${platformStatsText}
│ 📡 Tracking: Local Storage ✅
╰────────────────────────╯
   ⬇️ ALL COMMANDS ⬇️

╭────────────────────────╮
│      👑 OWNER MENU
├────────────────────────┤
│ ⟢ ${prefix}anticall
│ ⟢ ${prefix}antidelete
│ ⟢ ${prefix}antiforeign
│ ⟢ ${prefix}autoreact
│ ⟢ ${prefix}autoread
│ ⟢ ${prefix}autorecord
│ ⟢ ${prefix}autorecordtype
│ ⟢ ${prefix}autostatus
│ ⟢ ${prefix}autostatuslike
│ ⟢ ${prefix}autotyping
│ ⟢ ${prefix}block
│ ⟢ ${prefix}botinfo
│ ⟢ ${prefix}checkupdate
│ ⟢ ${prefix}clearsession
│ ⟢ ${prefix}cleartmp
│ ⟢ ${prefix}confighelp
│ ⟢ ${prefix}getpp
│ ⟢ ${prefix}join
│ ⟢ ${prefix}leave
│ ⟢ ${prefix}mention
│ ⟢ ${prefix}menufont
│ ⟢ ${prefix}menustyle
│ ⟢ ${prefix}mode
│ ⟢ ${prefix}pmblocker
│ ⟢ ${prefix}poll
│ ⟢ ${prefix}restart
│ ⟢ ${prefix}setauthor
│ ⟢ ${prefix}setbotname
│ ⟢ ${prefix}setbotowner
│ ⟢ ${prefix}setmention
│ ⟢ ${prefix}setownernumber
│ ⟢ ${prefix}setpackname
│ ⟢ ${prefix}setpp
│ ⟢ ${prefix}setprefix
│ ⟢ ${prefix}settings
│ ⟢ ${prefix}settimezone
│ ⟢ ${prefix}setytchannel
│ ⟢ ${prefix}sudo
│ ⟢ ${prefix}tempfile
│ ⟢ ${prefix}unblock
│ ⟢ ${prefix}update
│ ⟢ ${prefix}updateinfo
│ ⟢ ${prefix}vote
╰────────────────────────╯

╭────────────────────────╮
│     👥 GROUP CMDS 👥
├────────────────────────┤
│ ⟢ ${prefix}admins
│ ⟢ ${prefix}antibadword
│ ⟢ ${prefix}antibot
│ ⟢ ${prefix}antilink
│ ⟢ ${prefix}antitag
│ ⟢ ${prefix}ban
│ ⟢ ${prefix}chatbot
│ ⟢ ${prefix}delete
│ ⟢ ${prefix}demote
│ ⟢ ${prefix}goodbye
│ ⟢ ${prefix}groupinfo
│ ⟢ ${prefix}hidetag
│ ⟢ ${prefix}jid
│ ⟢ ${prefix}kick
│ ⟢ ${prefix}mute
│ ⟢ ${prefix}promote
│ ⟢ ${prefix}resetlink
│ ⟢ ${prefix}setgdesc
│ ⟢ ${prefix}setgname
│ ⟢ ${prefix}setgpp
│ ⟢ ${prefix}ship
│ ⟢ ${prefix}stupid
│ ⟢ ${prefix}tag
│ ⟢ ${prefix}tagall
│ ⟢ ${prefix}tagnotadmin
│ ⟢ ${prefix}unban
│ ⟢ ${prefix}unmute
│ ⟢ ${prefix}warn
│ ⟢ ${prefix}warnings
│ ⟢ ${prefix}welcome
╰────────────────────────╯

╭────────────────────────╮
│    🎨 STICKER CMDS 🎨
├────────────────────────┤
│ ⟢ ${prefix}blur
│ ⟢ ${prefix}crop
│ ⟢ ${prefix}emojimix
│ ⟢ ${prefix}igsc
│ ⟢ ${prefix}igs
│ ⟢ ${prefix}meme
│ ⟢ ${prefix}removebg
│ ⟢ ${prefix}remini
│ ⟢ ${prefix}simage
│ ⟢ ${prefix}sticker
│ ⟢ ${prefix}take
│ ⟢ ${prefix}tgsticker
╰────────────────────────╯

╭────────────────────────╮
│   📩 WHATSAPP CMDS 📩
├────────────────────────┤
│ ⟢ ${prefix}clear
╰────────────────────────╯

╭────────────────────────╮
│      🖼️ PIES CMDS 🖼️
├────────────────────────┤
│ ⟢ ${prefix}china
│ ⟢ ${prefix}hijab
│ ⟢ ${prefix}indonesia
│ ⟢ ${prefix}japan
│ ⟢ ${prefix}korea
│ ⟢ ${prefix}pies
╰────────────────────────╯

╭────────────────────────╮
│      🎮 GAME CMDS 🎮
├────────────────────────┤
│ ⟢ ${prefix}answer
│ ⟢ ${prefix}buychips
│ ⟢ ${prefix}coindaily
│ ⟢ ${prefix}coinflip
│ ⟢ ${prefix}coinhelp
│ ⟢ ${prefix}coinleaderboard
│ ⟢ ${prefix}coinstats
│ ⟢ ${prefix}dare
│ ⟢ ${prefix}guess
│ ⟢ ${prefix}hangman
│ ⟢ ${prefix}tictactoe
│ ⟢ ${prefix}trivia
│ ⟢ ${prefix}truth
╰────────────────────────╯

╭────────────────────────╮
│        🧠 AI CMDS 🧠
├────────────────────────┤
│ ⟢ ${prefix}flux
│ ⟢ ${prefix}gemini
│ ⟢ ${prefix}gpt
│ ⟢ ${prefix}imagine
│ ⟢ ${prefix}sora
╰────────────────────────╯

╭────────────────────────╮
│       😁 FUN CMDS 😁
├────────────────────────┤
│ ⟢ ${prefix}character
│ ⟢ ${prefix}compliment
│ ⟢ ${prefix}flirt
│ ⟢ ${prefix}goodnight
│ ⟢ ${prefix}insult
│ ⟢ ${prefix}poet
│ ⟢ ${prefix}roseday
│ ⟢ ${prefix}simp
│ ⟢ ${prefix}wasted
╰────────────────────────╯

╭────────────────────────╮
│     🔤 EPHOTO CMDS 🔤
├────────────────────────┤
│ ⟢ ${prefix}1917
│ ⟢ ${prefix}arena
│ ⟢ ${prefix}blackpink
│ ⟢ ${prefix}devil
│ ⟢ ${prefix}fire
│ ⟢ ${prefix}glitch
│ ⟢ ${prefix}hacker
│ ⟢ ${prefix}ice
│ ⟢ ${prefix}impressive
│ ⟢ ${prefix}leaves
│ ⟢ ${prefix}light
│ ⟢ ${prefix}matrix
│ ⟢ ${prefix}metallic
│ ⟢ ${prefix}neon
│ ⟢ ${prefix}purple
│ ⟢ ${prefix}sand
│ ⟢ ${prefix}snow
│ ⟢ ${prefix}thunder
╰────────────────────────╯

╭────────────────────────╮
│   📥 DOWNLOAD CMDS 📥
├────────────────────────┤
│ ⟢ ${prefix}facebook
│ ⟢ ${prefix}instagram
│ ⟢ ${prefix}play
│ ⟢ ${prefix}song
│ ⟢ ${prefix}spotify
│ ⟢ ${prefix}tiktok
│ ⟢ ${prefix}video
│ ⟢ ${prefix}ytmp4
╰────────────────────────╯

╭────────────────────────╮
│      🧩 MISC CMDS 🧩
├────────────────────────┤
│ ⟢ ${prefix}circle
│ ⟢ ${prefix}comrade
│ ⟢ ${prefix}gay
│ ⟢ ${prefix}glass
│ ⟢ ${prefix}heart
│ ⟢ ${prefix}horny
│ ⟢ ${prefix}its-so-stupid
│ ⟢ ${prefix}jail
│ ⟢ ${prefix}lgbt
│ ⟢ ${prefix}lolice
│ ⟢ ${prefix}namecard
│ ⟢ ${prefix}oogway
│ ⟢ ${prefix}oogway2
│ ⟢ ${prefix}passed
│ ⟢ ${prefix}tonikawa
│ ⟢ ${prefix}triggered
│ ⟢ ${prefix}tweet
│ ⟢ ${prefix}ytcomment
╰────────────────────────╯

╭────────────────────────╮
│    🦹‍♀️ ANIME CMDS 🦹‍♀️
├────────────────────────┤
│ ⟢ ${prefix}cry
│ ⟢ ${prefix}facepalm
│ ⟢ ${prefix}hug
│ ⟢ ${prefix}kiss
│ ⟢ ${prefix}nom
│ ⟢ ${prefix}pat
│ ⟢ ${prefix}poke
│ ⟢ ${prefix}wink
╰────────────────────────╯

╭────────────────────────╮
│     💻 GITHUB CMDS 💻
├────────────────────────┤
│ ⟢ ${prefix}repo
╰────────────────────────╯

╭────────────────────────╮
│    🌐 GENERAL CMDS 🌐
├────────────────────────┤
│ ⟢ ${prefix}8ball
│ ⟢ ${prefix}alive
│ ⟢ ${prefix}attp
│ ⟢ ${prefix}fact
│ ⟢ ${prefix}getjid
│ ⟢ ${prefix}menu
│ ⟢ ${prefix}joke
│ ⟢ ${prefix}lyrics
│ ⟢ ${prefix}news
│ ⟢ ${prefix}owner
│ ⟢ ${prefix}ping
│ ⟢ ${prefix}quote
│ ⟢ ${prefix}screenshot
│ ⟢ ${prefix}translate
│ ⟢ ${prefix}tts
│ ⟢ ${prefix}url
│ ⟢ ${prefix}vv
│ ⟢ ${prefix}weather
╰────────────────────────╯

    🎯 ╰‣ 𝐏𝐎𝐖𝐄𝐑𝐃 𝐁𝐘 𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓 🎯

📊 Total Commands: ${totalCmds}

📊 Local Stats: ${active} active now, ${total} total users

${greeting.emoji} ${greeting.greeting}, @${userName}! ${greeting.message}

⬇️Join our channel below for updates⬇️`;
            } else {
                // Styles 2-12: dynamic build
                const menuData = {
                    userName,
                    greeting,
                    prefix,
                    totalCommands,
                    stats,
                    dayInfo,
                    currentBotMode,
                    menuType,
                    userPlatform,
                    getLocalizedTime: getLocalized
                };
                menuText = buildMenu(styleId, menuData);
            }
        } catch (buildError) {
            console.error('❌ Menu build error, using fallback:', buildError.message);
            // Minimal fallback menu
            menuText = `👋 Hello @${userName}! ${greeting.message}\n\n${greeting.greeting}! Here's your menu:\n\n` +
                `⚠️ Full menu temporarily unavailable. Use:\n` +
                `${prefix}ping - Check speed\n` +
                `${prefix}alive - Bot status\n` +
                `${prefix}owner - Contact owner\n` +
                `${prefix}help - Show this menu\n` +
                `\n🤖 ${settings.botName || '𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓'}`;
        }

        // Apply font (safe)
        let finalMessage = menuText;
        try {
            if (typeof applyFont === 'function') {
                finalMessage = applyFont(menuText, fontId);
            }
        } catch (fontError) {
            console.warn('⚠️ Font apply failed, using plain text');
        }

        // Send message with media fallback
        const context = getContextInfo();
        const mentions = [senderId];

        try {
            if (menuType === 'IMAGE' && imageExists) {
                await sock.sendMessage(chatId, {
                    image: fs.readFileSync(imagePath),
                    caption: finalMessage,
                    mentions: mentions,
                    ...context
                }, { quoted: message });
            } else if (menuType === 'VIDEO' && videoExists) {
                await sock.sendMessage(chatId, {
                    video: fs.readFileSync(videoPath),
                    caption: finalMessage,
                    mentions: mentions,
                    ...context
                }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, {
                    text: finalMessage,
                    mentions: mentions,
                    ...context
                }, { quoted: message });
            }
        } catch (mediaError) {
            console.error('⚠️ Media send failed, sending text only:', mediaError.message);
            await sock.sendMessage(chatId, {
                text: finalMessage,
                mentions: mentions,
                ...context
            }, { quoted: message });
        }

        // Optional audio (non-critical)
        try {
            const audioPath = path.join(__dirname, '../assets/menu_audio.mp3');
            if (fs.existsSync(audioPath)) {
                await sock.sendMessage(chatId, {
                    audio: fs.readFileSync(audioPath),
                    mimetype: 'audio/mpeg',
                    ptt: false
                }, { quoted: message });
            }
        } catch (audioError) {
            // Ignore audio failure
        }

    } catch (error) {
        console.error('❌ Help command fatal error:', error.message);
        try {
            await sock.sendMessage(chatId, {
                text: '❌ Failed to load menu. Please try again later.',
                ...getContextInfo()
            }, { quoted: message });
        } catch (finalError) {
            await sock.sendMessage(chatId, { text: '❌ Menu temporarily unavailable. Please try again later.' });
        }
    }
}

module.exports = helpCommand;