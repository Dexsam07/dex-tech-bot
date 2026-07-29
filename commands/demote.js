//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                             𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓                                                                                                     //
//                                                                  𝐕 : 1.0.0                                                                                                             //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2026                                                                                                        //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//* 
//  * command : demote
//  * description : Demote a user from admin (Admin only)
//  * Credit To  DEX SHYAM TECH
// ⛥┌┤
// */

const isAdmin = require('../lib/isAdmin');
const settings = require('../settings');
const moment = require('moment-timezone');

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

// ========== DELAY HELPER ==========
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    name: 'demote',
    category: 'Admin',
    description: 'Demote a user from admin (Admin only)',
    groupOnly: true,
    ownerOnly: false,

    execute: async (sock, message, args, senderId, chatId) => {
        try {
            // ✅ Check if bot is admin
            const adminStatus = await isAdmin(sock, chatId, senderId);
            
            if (!adminStatus.isBotAdmin) {
                await sock.sendMessage(chatId, {
                    text: '❌ Bot must be an admin to demote users!',
                    ...getContextInfo()
                }, { quoted: message });
                return;
            }

            if (!adminStatus.isSenderAdmin) {
                await sock.sendMessage(chatId, {
                    text: '❌ Only group admins can use the demote command!',
                    ...getContextInfo()
                }, { quoted: message });
                return;
            }

            // ✅ Extract target user (mention or quoted)
            let userToDemote = [];

            if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
                userToDemote = message.message.extendedTextMessage.contextInfo.mentionedJid;
            }
            else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
                userToDemote = [message.message.extendedTextMessage.contextInfo.participant];
            }

            if (userToDemote.length === 0) {
                await sock.sendMessage(chatId, {
                    text: '⚠️ Please mention the user or reply to their message to demote!\nExample: `.demote @user`',
                    ...getContextInfo()
                }, { quoted: message });
                return;
            }

            // 🛡️ Protect owner from demotion
            const ownerJid = settings.ownerNumber.includes('@')
                ? settings.ownerNumber
                : `${settings.ownerNumber}@s.whatsapp.net`;
            
            const filteredUsers = userToDemote.filter(jid => {
                if (jid === ownerJid || jid === ownerJid.replace('@s.whatsapp.net', '@lid')) {
                    return false;
                }
                return true;
            });

            if (filteredUsers.length === 0) {
                await sock.sendMessage(chatId, {
                    text: '🚫 Cannot demote the bot owner!',
                    ...getContextInfo()
                }, { quoted: message });
                return;
            }

            // 🛡️ Protect bot from demotion
            try {
                const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                const finalUsers = filteredUsers.filter(jid => {
                    if (jid === botId || jid === botId.replace('@s.whatsapp.net', '@lid')) {
                        return false;
                    }
                    return true;
                });
                filteredUsers.length = 0;
                filteredUsers.push(...finalUsers);
            } catch (_) {}

            if (filteredUsers.length === 0) {
                await sock.sendMessage(chatId, {
                    text: '😅 Cannot demote the bot itself!',
                    ...getContextInfo()
                }, { quoted: message });
                return;
            }

            // ✅ Perform demotion
            try {
                await delay(1000);
                await sock.groupParticipantsUpdate(chatId, filteredUsers, 'demote');

                // Get usernames for each demoted user
                const usernames = await Promise.all(filteredUsers.map(async jid => {
                    return `@${jid.split('@')[0]}`;
                }));

                const timezone = settings.timezone || 'Asia/Kolkata';
                const currentTime = moment().tz(timezone).format('DD/MM/YYYY HH:mm:ss');

                const demotionMessage = `⬇️ *GROUP DEMOTION* ⬇️\n\n` +
                    `👤 *Demoted User${filteredUsers.length > 1 ? 's' : ''}:*\n` +
                    `${usernames.map(name => `• ${name}`).join('\n')}\n\n` +
                    `👑 *Demoted By:* @${senderId.split('@')[0]}\n\n` +
                    `📅 *Date:* ${currentTime}\n\n` +
                    `🤖 ${settings.botName || '𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓'}`;

                await sock.sendMessage(chatId, {
                    text: demotionMessage,
                    mentions: [...filteredUsers, senderId],
                    ...getContextInfo()
                }, { quoted: message });

            } catch (apiError) {
                if (apiError.data === 429) {
                    await delay(2000);
                    await sock.sendMessage(chatId, {
                        text: '⚠️ Rate limit reached. Please try again in a few seconds.',
                        ...getContextInfo()
                    }, { quoted: message });
                } else {
                    throw apiError;
                }
            }

        } catch (error) {
            console.error('❌ Demote command error:', error.message);
            await sock.sendMessage(chatId, {
                text: '❌ Failed to demote user(s). Make sure the bot is admin and has sufficient permissions.',
                ...getContextInfo()
            }, { quoted: message });
        }
    }
};

// ========== HANDLE DEMOTION EVENT (Auto-detect) ==========
async function handleDemotionEvent(sock, groupId, participants, author) {
    try {
        if (!Array.isArray(participants) || participants.length === 0) return;

        await delay(1000);

        const demotedUsernames = await Promise.all(participants.map(async jid => {
            const jidString = typeof jid === 'string' ? jid : (jid.id || jid.toString());
            return `@${jidString.split('@')[0]}`;
        }));

        let demotedBy;
        let mentionList = participants.map(jid => {
            return typeof jid === 'string' ? jid : (jid.id || jid.toString());
        });

        if (author && author.length > 0) {
            const authorJid = typeof author === 'string' ? author : (author.id || author.toString());
            demotedBy = `@${authorJid.split('@')[0]}`;
            mentionList.push(authorJid);
        } else {
            demotedBy = 'System';
        }

        await delay(1000);

        const timezone = settings.timezone || 'Asia/Kolkata';
        const currentTime = moment().tz(timezone).format('DD/MM/YYYY HH:mm:ss');

        const demotionMessage = `⬇️ *GROUP DEMOTION* ⬇️\n\n` +
            `👤 *Demoted User${participants.length > 1 ? 's' : ''}:*\n` +
            `${demotedUsernames.map(name => `• ${name}`).join('\n')}\n\n` +
            `👑 *Demoted By:* ${demotedBy}\n\n` +
            `📅 *Date:* ${currentTime}\n\n` +
            `🤖 ${settings.botName || '𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓'}`;

        await sock.sendMessage(groupId, {
            text: demotionMessage,
            mentions: mentionList,
            ...getContextInfo()
        });
    } catch (error) {
        console.error('❌ Error handling demotion event:', error.message);
        if (error.data === 429) {
            await delay(2000);
        }
    }
}

// ========== EXPORTS ==========
module.exports.handleDemotionEvent = handleDemotionEvent;