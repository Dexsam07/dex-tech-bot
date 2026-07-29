//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                             𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓                                                                                                     //
//                                                                  𝐕 : 1.0.0                                                                                                             //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2026                                                                                                        //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//* 
//  * command : groupinfo
//  * description : Get detailed information about the current group
//  * Credit To  DEX SHYAM TECH
// ⛥┌┤
// */

const fs = require('fs');
const path = require('path');
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

// ========== HELPER: Get recent activity ==========
async function getRecentActivity(chatId) {
    try {
        const msgFile = path.join(__dirname, '../data/messageCount.json');
        if (fs.existsSync(msgFile)) {
            const data = JSON.parse(fs.readFileSync(msgFile, 'utf8'));
            const groupData = data.groups && data.groups[chatId];
            if (groupData) {
                const totalMessages = Object.values(groupData).reduce((sum, count) => sum + count, 0);
                const activeMembers = Object.keys(groupData).length;
                return `• Total Messages: ${totalMessages}\n• Active Members: ${activeMembers}`;
            }
        }
        return '• No activity data available';
    } catch (_) {
        return '• Activity data unavailable';
    }
}

// ========== HELPER: Send member breakdown ==========
async function sendMemberBreakdown(sock, chatId, groupMembers, originalMessage) {
    try {
        const superAdmins = groupMembers.filter(m => m.admin === 'superadmin');
        const admins = groupMembers.filter(m => m.admin === 'admin');
        const participants = groupMembers.filter(m => !m.admin);

        let memberList = '*👥 MEMBER BREAKDOWN*\n\n';

        if (superAdmins.length > 0) {
            memberList += '*👑 Super Admins:*\n';
            superAdmins.forEach((member, index) => {
                const name = member.name || member.id.split('@')[0];
                const phone = member.id.split('@')[0];
                memberList += `${index + 1}. ${name} (${phone})\n`;
            });
            memberList += '\n';
        }

        if (admins.length > 0) {
            memberList += '*⚡ Admins:*\n';
            admins.forEach((member, index) => {
                const name = member.name || member.id.split('@')[0];
                const phone = member.id.split('@')[0];
                memberList += `${index + 1}. ${name} (${phone})\n`;
            });
            memberList += '\n';
        }

        if (participants.length > 0) {
            memberList += '*👤 Participants:*\n';
            const displayParticipants = participants.slice(0, 20);
            displayParticipants.forEach((member, index) => {
                const name = member.name || member.id.split('@')[0];
                const phone = member.id.split('@')[0];
                memberList += `${index + 1}. ${name} (${phone})\n`;
            });
            if (participants.length > 20) {
                memberList += `\n... and ${participants.length - 20} more participants`;
            }
        }

        await sock.sendMessage(chatId, {
            text: memberList,
            ...getContextInfo()
        }, { quoted: originalMessage });
    } catch (error) {
        console.error('❌ Error sending member breakdown:', error.message);
    }
}

// ========== COMMAND ==========
module.exports = {
    name: 'groupinfo',
    category: 'Group',
    description: 'Get detailed information about the current group',
    groupOnly: true,
    ownerOnly: false,

    execute: async (sock, message, args, senderId, chatId) => {
        try {
            // Show typing indicator
            await sock.sendPresenceUpdate('composing', chatId);

            // ✅ Get group metadata
            const groupMetadata = await sock.groupMetadata(chatId);

            // ✅ Get group profile picture (if available)
            let groupProfilePic = null;
            try {
                groupProfilePic = await sock.profilePictureUrl(chatId, 'image');
            } catch (_) {}

            // ✅ Get group participants
            let groupMembers = [];
            try {
                // Use groupParticipants if available, fallback to metadata.participants
                if (typeof sock.groupParticipants === 'function') {
                    groupMembers = await sock.groupParticipants(chatId);
                } else {
                    groupMembers = groupMetadata.participants || [];
                }
            } catch (_) {
                groupMembers = groupMetadata.participants || [];
            }

            // ✅ Group description
            let groupDesc = groupMetadata.desc || 'No description';
            if (groupDesc.length > 100) {
                groupDesc = groupDesc.substring(0, 100) + '...';
            }

            // ✅ Count members by role
            let superAdmins = groupMembers.filter(m => m.admin === 'superadmin');
            let regularAdmins = groupMembers.filter(m => m.admin === 'admin');
            let participants = groupMembers.filter(m => !m.admin);

            // ✅ Creation date
            const creationDate = new Date(groupMetadata.creation * 1000);
            const timezone = settings.timezone || 'Asia/Kolkata';
            const formattedDate = moment(creationDate).tz(timezone).format('DD MMMM YYYY');

            // ✅ Settings
            const isRestricted = groupMetadata.restrict || false;
            const isAnnouncement = groupMetadata.announce || false;

            // ✅ Member counts
            const totalMembers = groupMetadata.size || groupMembers.length;
            const superAdminCount = superAdmins.length;
            const regularAdminCount = regularAdmins.length;
            const participantCount = participants.length;

            // ✅ Recent activity
            const recentActivity = await getRecentActivity(chatId);

            // ✅ Build info text
            const groupInfo =
                `🏷️ *GROUP INFORMATION*\n\n` +
                `📛 *Name:* ${groupMetadata.subject}\n` +
                `🆔 *ID:* ${chatId}\n` +
                `👥 *Total Members:* ${totalMembers}\n` +
                `📅 *Created:* ${formattedDate}\n` +
                `🖼️ *Profile Picture:* ${groupProfilePic ? '✅ Available' : '❌ No profile picture'}\n\n` +
                `👑 *Super Admins:* ${superAdminCount}\n` +
                `⚡ *Admins:* ${regularAdminCount}\n` +
                `👤 *Participants:* ${participantCount}\n\n` +
                `📝 *Description:*\n${groupDesc}\n\n` +
                `⚙️ *Settings:*\n` +
                `• ${isRestricted ? '🔒 Restricted (only admins can send messages)' : '🔓 Open (everyone can send messages)'}\n` +
                `• ${isAnnouncement ? '📢 Announcement Mode (only admins can send messages)' : '💬 Chat Mode (everyone can send messages)'}\n\n` +
                `📊 *Recent Activity:*\n${recentActivity}\n\n` +
                `🔗 *Group Link:* ${groupMetadata.inviteCode ? `https://chat.whatsapp.com/${groupMetadata.inviteCode}` : 'Not available'}\n\n` +
                `🤖 ${settings.botName || '𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓'}`;

            // ✅ Send with or without image
            if (groupProfilePic) {
                await sock.sendMessage(chatId, {
                    image: { url: groupProfilePic },
                    caption: groupInfo,
                    ...getContextInfo()
                }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, {
                    text: groupInfo,
                    ...getContextInfo()
                }, { quoted: message });
            }

            // ✅ Send member breakdown if group not too large
            if (groupMembers.length > 0 && groupMembers.length <= 50) {
                await sendMemberBreakdown(sock, chatId, groupMembers, message);
            }

        } catch (error) {
            console.error('❌ GroupInfo command error:', error.message);
            await sock.sendMessage(chatId, {
                text: '❌ Failed to fetch group information.\n\nMake sure the bot is an admin in the group and try again.',
                ...getContextInfo()
            }, { quoted: message });
        }
    }
};