//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                             𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓                                                                                                     //
//                                                                  𝐕 : 1.0.0                                                                                                             //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2026                                                                                                        //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//* 
//  * file : commands/chipsystem.js
//  * description : Chip economy system with atomic data saving
//  * Credit To  DEX SHYAM TECH
// ⛥┌┤
// */

const moment = require('moment-timezone');
const fs = require('fs');
const path = require('path');

// ========== PATHS (using path.join for safety) ==========
const DATA_DIR = path.join(__dirname, '../data');
const CHIPS_FILE = path.join(DATA_DIR, 'chips.json');
const OWNER_FILE = path.join(DATA_DIR, 'owner.json');
const TRANSACTIONS_FILE = path.join(DATA_DIR, 'transactions.json');
const SETTINGS_FILE = path.join(__dirname, '../settings.js');

const packageJson = require('../package.json');
const OWNER_PASSWORD = packageJson.build.number.toString();

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ========== ATOMIC SAVE (temp + rename) ==========
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

// ========== SAFE LOAD (with auto-recovery) ==========
function loadData(file, defaultValue = {}) {
    try {
        if (fs.existsSync(file)) {
            const raw = fs.readFileSync(file, 'utf8');
            return JSON.parse(raw);
        }
    } catch (error) {
        console.error(`⚠️ Error loading ${file}, resetting to default:`, error.message);
        saveDataAtomic(file, defaultValue);
    }
    return defaultValue;
}

// ========== WRAPPER (backward compatible) ==========
function saveData(file, data) {
    return saveDataAtomic(file, data);
}

// ========== SETTINGS ==========
function getSettings() {
    try {
        return require(SETTINGS_FILE);
    } catch (error) {
        return {
            ownerNumber: '917384287404',
            botOwner: 'DEX SHYAM TECH',
            timezone: 'Asia/Kolkata'
        };
    }
}

// ========== OWNER CHECK ==========
async function isOwner(sock, userId) {
    try {
        const settings = getSettings();
        const ownerId = settings.ownerNumber.includes('@')
            ? settings.ownerNumber
            : `${settings.ownerNumber}@s.whatsapp.net`;
        return userId === ownerId || userId === sock.user.id;
    } catch (error) {
        return false;
    }
}

// ========== HELPERS ==========
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function verifyPassword(inputPassword) {
    return inputPassword === OWNER_PASSWORD;
}

function getUserId(message) {
    return message.key.participant || message.key.remoteJid;
}

// ========== CHIP FUNCTIONS ==========
function getUserChips(userId) {
    const chipsData = loadData(CHIPS_FILE, {});
    if (!chipsData[userId]) {
        chipsData[userId] = {
            chips: 1000,
            lastDaily: null,
            totalWon: 0,
            totalLost: 0,
            chipsBought: 0,
            chipsReceived: 0
        };
        saveData(CHIPS_FILE, chipsData);
    }
    return chipsData[userId].chips;
}

function updateUserChips(userId, amount, reason = 'admin') {
    const chipsData = loadData(CHIPS_FILE, {});
    if (!chipsData[userId]) {
        chipsData[userId] = {
            chips: 1000,
            lastDaily: null,
            totalWon: 0,
            totalLost: 0,
            chipsBought: 0,
            chipsReceived: 0
        };
    }
    if (reason === 'purchase') {
        chipsData[userId].chipsBought = (chipsData[userId].chipsBought || 0) + amount;
    } else if (reason === 'admin') {
        chipsData[userId].chipsReceived = (chipsData[userId].chipsReceived || 0) + amount;
    }
    chipsData[userId].chips += amount;
    if (chipsData[userId].chips < 0) chipsData[userId].chips = 0;
    saveData(CHIPS_FILE, chipsData);
    return chipsData[userId].chips;
}

async function getUserInfo(sock, userNumber) {
    try {
        let cleanNumber = userNumber.replace(/[^0-9]/g, '');
        if (!cleanNumber.startsWith('234') && cleanNumber.length === 10 && cleanNumber.startsWith('0')) {
            cleanNumber = '234' + cleanNumber.slice(1);
        }
        const jid = `${cleanNumber}@s.whatsapp.net`;
        const contact = await sock.getContact(jid).catch(() => null);
        return {
            jid: jid,
            number: cleanNumber,
            name: contact?.notify || contact?.name || `User (${cleanNumber})`,
            exists: !!contact
        };
    } catch (error) {
        return {
            jid: `${userNumber.replace(/[^0-9]/g, '')}@s.whatsapp.net`,
            number: userNumber.replace(/[^0-9]/g, ''),
            name: `User (${userNumber})`,
            exists: false
        };
    }
}

// ========== COMMANDS ==========

async function unlimitedChipsCommand(sock, chatId, message, args) {
    try {
        const userId = getUserId(message);
        if (!(await isOwner(sock, userId))) {
            await sock.sendMessage(chatId, { text: '❌ This command is only for the bot owner!' }, { quoted: message });
            return;
        }
        if (args.length === 0) {
            await sock.sendMessage(chatId, {
                text: '🔐 *UNLIMITED CHIPS*\n\nPlease enter password:\n`.unlimitedchips [password]`\n\nExample: `.unlimitedchips admin123`'
            }, { quoted: message });
            return;
        }
        const password = args[0];
        if (!verifyPassword(password)) {
            await sock.sendMessage(chatId, { text: '❌ Incorrect password! Access denied.' }, { quoted: message });
            return;
        }
        const unlimitedAmount = 1000000;
        const newBalance = updateUserChips(userId, unlimitedAmount, 'admin');
        await sock.sendMessage(chatId, {
            text: `🎉 *UNLIMITED CHIPS ACTIVATED!*\n\n💰 +${formatNumber(unlimitedAmount)} chips added!\n\nNew Balance: 💰 ${formatNumber(newBalance)} chips\n\nYou now have unlimited chips to test the bot!`
        }, { quoted: message });
    } catch (error) {
        console.error('Error in unlimitedchips:', error);
        await sock.sendMessage(chatId, { text: '❌ Error processing command.' }, { quoted: message });
    }
}

async function buyChipsCommand(sock, chatId, message) {
    try {
        const settings = getSettings();
        const ownerNumber = settings.ownerNumber || '917384287404';
        const ownerName = settings.botOwner || 'Bot Owner';
        const whatsappLink = `https://wa.me/${ownerNumber}`;
        const response =
            `💰 *BUY CHIPS - PREMIUM PACKAGES* 💰\n\n` +
            `*Contact Owner:*\n👑 ${ownerName}\n📞 +${ownerNumber}\n🔗 ${whatsappLink}\n\n` +
            `*Chip Packages:*\n🎁 *Starter Pack:* 5,000 chips - ₦500 / $1\n` +
            `🏆 *Pro Pack:* 25,000 chips - ₦2,000 / $4\n` +
            `👑 *VIP Pack:* 100,000 chips - ₦5,000 / $10\n` +
            `💎 *Ultimate Pack:* 1,000,000 chips - ₦20,000 / $40\n\n` +
            `*How to Buy:*\n1. Message the owner using the link above\n2. Specify which package you want\n3. Make payment\n4. Owner will add chips to your account\n\n` +
            `*Payment Methods:*\n• Bank Transfer (Nigeria)\n• PayPal\n• Cryptocurrency (BTC, USDT)\n• Mobile Money\n\n` +
            `*Note:* Once payment is confirmed, chips will be added instantly!`;
        await sock.sendMessage(chatId, { text: response }, { quoted: message });
    } catch (error) {
        console.error('Error in buychips:', error);
        await sock.sendMessage(chatId, { text: '❌ Error fetching purchase information.' }, { quoted: message });
    }
}

async function addChipsCommand(sock, chatId, message, args) {
    try {
        const userId = getUserId(message);
        if (!(await isOwner(sock, userId))) {
            await sock.sendMessage(chatId, { text: '❌ This command is only for the bot owner!' }, { quoted: message });
            return;
        }
        if (args.length < 3) {
            await sock.sendMessage(chatId, {
                text: '🔐 *ADD CHIPS TO USER*\n\nUsage:\n`.addchips [password] [user-number] [amount]`\n\nExample:\n`.addchips admin123 917384287404 5000`'
            }, { quoted: message });
            return;
        }
        const password = args[0];
        const userNumber = args[1];
        const amount = parseInt(args[2]);
        if (!verifyPassword(password)) {
            await sock.sendMessage(chatId, { text: '❌ Incorrect password! Access denied.' }, { quoted: message });
            return;
        }
        if (isNaN(amount) || amount <= 0) {
            await sock.sendMessage(chatId, { text: '❌ Please enter a valid chip amount (positive number).' }, { quoted: message });
            return;
        }
        if (amount > 10000000) {
            await sock.sendMessage(chatId, { text: '❌ Maximum chip addition is 10,000,000 at once.' }, { quoted: message });
            return;
        }
        const userInfo = await getUserInfo(sock, userNumber);
        const newBalance = updateUserChips(userInfo.jid, amount, 'purchase');
        const transaction = {
            date: new Date().toISOString(),
            from: 'owner',
            to: userInfo.jid,
            amount: amount,
            newBalance: newBalance
        };
        const transactions = loadData(TRANSACTIONS_FILE, []);
        transactions.push(transaction);
        saveData(TRANSACTIONS_FILE, transactions);
        await sock.sendMessage(chatId, {
            text: `✅ *CHIPS ADDED SUCCESSFULLY!*\n\n👤 *User:* ${userInfo.name}\n📞 *Number:* ${userInfo.number}\n💰 *Amount Added:* ${formatNumber(amount)} chips\n💵 *New Balance:* ${formatNumber(newBalance)} chips\n\n⏰ *Time:* ${moment().tz(getSettings().timezone || 'Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')}\n📝 *Transaction ID:* TX${Date.now()}`
        }, { quoted: message });
        try {
            await sock.sendMessage(userInfo.jid, {
                text: `🎉 *CHIPS RECEIVED!* 🎉\n\n💰 *Amount:* +${formatNumber(amount)} chips\n💵 *New Balance:* ${formatNumber(newBalance)} chips\n\nThank you for your purchase! Enjoy playing! 🎮\n\nUse \`.coinstats\` to check your balance.`
            });
        } catch (_) {}
    } catch (error) {
        console.error('Error in addchips:', error);
        await sock.sendMessage(chatId, { text: '❌ Error adding chips. Check the user number and try again.' }, { quoted: message });
    }
}

async function checkBalanceCommand(sock, chatId, message, args) {
    try {
        const userId = getUserId(message);
        if (!(await isOwner(sock, userId))) {
            await sock.sendMessage(chatId, { text: '❌ This command is only for the bot owner!' }, { quoted: message });
            return;
        }
        if (args.length < 2) {
            await sock.sendMessage(chatId, {
                text: '🔐 *CHECK USER BALANCE*\n\nUsage:\n`.checkbalance [password] [user-number]`\n\nExample:\n`.checkbalance admin123 917384287404`'
            }, { quoted: message });
            return;
        }
        const password = args[0];
        const userNumber = args[1];
        if (!verifyPassword(password)) {
            await sock.sendMessage(chatId, { text: '❌ Incorrect password! Access denied.' }, { quoted: message });
            return;
        }
        const userInfo = await getUserInfo(sock, userNumber);
        const userChips = getUserChips(userInfo.jid);
        await sock.sendMessage(chatId, {
            text: `📊 *USER BALANCE REPORT*\n\n👤 *User:* ${userInfo.name}\n📞 *Number:* ${userInfo.number}\n🆔 *JID:* ${userInfo.jid}\n💰 *Chip Balance:* ${formatNumber(userChips)}\n📅 *Account Exists:* ${userInfo.exists ? '✅ Yes' : '⚠️ Not in contacts'}\n\n*Last Updated:* ${moment().tz(getSettings().timezone || 'Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')}`
        }, { quoted: message });
    } catch (error) {
        console.error('Error in checkbalance:', error);
        await sock.sendMessage(chatId, { text: '❌ Error checking user balance.' }, { quoted: message });
    }
}

async function resetChipsCommand(sock, chatId, message, args) {
    try {
        const userId = getUserId(message);
        if (!(await isOwner(sock, userId))) {
            await sock.sendMessage(chatId, { text: '❌ This command is only for the bot owner!' }, { quoted: message });
            return;
        }
        if (args.length < 3) {
            await sock.sendMessage(chatId, {
                text: '⚠️ *RESET USER CHIPS*\n\nUsage:\n`.resetchips [password] [user-number] [new-amount]`\n\nExample:\n`.resetchips admin123 917384287404 1000`\n\n*Warning:* This will completely reset user chips to the specified amount!'
            }, { quoted: message });
            return;
        }
        const password = args[0];
        const userNumber = args[1];
        const newAmount = parseInt(args[2]);
        if (!verifyPassword(password)) {
            await sock.sendMessage(chatId, { text: '❌ Incorrect password! Access denied.' }, { quoted: message });
            return;
        }
        if (isNaN(newAmount) || newAmount < 0) {
            await sock.sendMessage(chatId, { text: '❌ Please enter a valid chip amount (0 or more).' }, { quoted: message });
            return;
        }
        const userInfo = await getUserInfo(sock, userNumber);
        const chipsData = loadData(CHIPS_FILE, {});
        if (!chipsData[userInfo.jid]) {
            chipsData[userInfo.jid] = {
                chips: 1000,
                lastDaily: null,
                totalWon: 0,
                totalLost: 0,
                chipsBought: 0,
                chipsReceived: 0
            };
        }
        const oldBalance = chipsData[userInfo.jid].chips;
        chipsData[userInfo.jid].chips = newAmount;
        saveData(CHIPS_FILE, chipsData);
        await sock.sendMessage(chatId, {
            text: `🔄 *USER CHIPS RESET*\n\n👤 *User:* ${userInfo.name}\n📞 *Number:* ${userInfo.number}\n💰 *Old Balance:* ${formatNumber(oldBalance)} chips\n💰 *New Balance:* ${formatNumber(newAmount)} chips\n📉 *Change:* ${formatNumber(newAmount - oldBalance)} chips\n\n*Reset Time:* ${moment().tz(getSettings().timezone || 'Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')}\n⚠️ *Note:* User statistics remain unchanged.`
        }, { quoted: message });
    } catch (error) {
        console.error('Error in resetchips:', error);
        await sock.sendMessage(chatId, { text: '❌ Error resetting user chips.' }, { quoted: message });
    }
}

async function viewTransactionsCommand(sock, chatId, message, args) {
    try {
        const userId = getUserId(message);
        if (!(await isOwner(sock, userId))) {
            await sock.sendMessage(chatId, { text: '❌ This command is only for the bot owner!' }, { quoted: message });
            return;
        }
        if (args.length < 1) {
            await sock.sendMessage(chatId, {
                text: '🔐 *VIEW TRANSACTIONS*\n\nUsage:\n`.transactions [password]`\n\nExample:\n`.transactions admin123`'
            }, { quoted: message });
            return;
        }
        const password = args[0];
        if (!verifyPassword(password)) {
            await sock.sendMessage(chatId, { text: '❌ Incorrect password! Access denied.' }, { quoted: message });
            return;
        }
        const transactions = loadData(TRANSACTIONS_FILE, []);
        if (transactions.length === 0) {
            await sock.sendMessage(chatId, { text: '📋 *TRANSACTION HISTORY*\n\nNo transactions found yet.' }, { quoted: message });
            return;
        }
        const recent = transactions.slice(-10).reverse();
        let response = `📋 *RECENT TRANSACTIONS* (Last 10)\n\n`;
        let totalChips = 0;
        recent.forEach((tx, i) => {
            const date = moment(tx.date).tz(getSettings().timezone || 'Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
            const shortJid = tx.to.split('@')[0];
            response += `${i+1}. ${date}\n   👤 ${shortJid}\n   💰 +${formatNumber(tx.amount)} chips\n   💵 New: ${formatNumber(tx.newBalance)} chips\n   ─────────────────\n`;
            totalChips += tx.amount;
        });
        response += `\n📊 *SUMMARY*\nTotal Transactions: ${transactions.length}\nTotal Chips Distributed: ${formatNumber(totalChips)}\n\nUse \`.transactions all [password]\` for full list`;
        await sock.sendMessage(chatId, { text: response }, { quoted: message });
    } catch (error) {
        console.error('Error in transactions:', error);
        await sock.sendMessage(chatId, { text: '❌ Error fetching transactions.' }, { quoted: message });
    }
}

module.exports = {
    unlimitedChipsCommand,
    buyChipsCommand,
    addChipsCommand,
    checkBalanceCommand,
    resetChipsCommand,
    viewTransactionsCommand
};