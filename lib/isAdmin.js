//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                             𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓                                                                                                     //
//                                                                  𝐕 : 1.0.0                                                                                                             //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2026                                                                                                        //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//* 
//  * file : lib/isAdmin.js
//  * description : Check if user/bot is admin in a group with caching
//  * Credit To  DEX SHYAM TECH
// ⛥┌┤
// */

const settings = require('../settings');

// ✅ Simple cache to reduce API calls (30 seconds TTL)
const groupCache = new Map();
const CACHE_DURATION = 30000; // 30 seconds

/**
 * Check if a user and the bot are admins in a group
 * @param {Object} sock - WhatsApp socket
 * @param {string} groupId - Group JID
 * @param {string} senderId - User JID to check
 * @returns {Promise<{isSenderAdmin: boolean, isBotAdmin: boolean}>}
 */
async function isAdmin(sock, groupId, senderId) {
    try {
        // ✅ Check cache first
        const cacheKey = groupId;
        if (groupCache.has(cacheKey)) {
            const cached = groupCache.get(cacheKey);
            if (Date.now() - cached.timestamp < CACHE_DURATION) {
                const isSenderAdmin = cached.admins.some(a => a === senderId);
                const isBotAdmin = cached.admins.some(a => a === sock.user.id);
                // ✅ Owner is always considered admin
                const ownerNumber = settings.ownerNumber + '@s.whatsapp.net';
                const isOwner = senderId === ownerNumber || senderId === sock.user.id;
                return {
                    isSenderAdmin: isSenderAdmin || isOwner,
                    isBotAdmin: isBotAdmin
                };
            }
        }

        // ✅ Fetch fresh group metadata
        const groupMetadata = await sock.groupMetadata(groupId);
        const participants = groupMetadata.participants || [];
        
        // Get all admin JIDs (superadmin and admin)
        const admins = participants
            .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
            .map(p => p.id);

        // ✅ Store in cache
        groupCache.set(cacheKey, {
            admins: admins,
            timestamp: Date.now()
        });

        const isSenderAdmin = admins.some(a => a === senderId);
        const isBotAdmin = admins.some(a => a === sock.user.id);

        // ✅ Owner is always considered admin (even if not in admins list)
        const ownerNumber = settings.ownerNumber + '@s.whatsapp.net';
        const isOwner = senderId === ownerNumber || senderId === sock.user.id;

        return {
            isSenderAdmin: isSenderAdmin || isOwner,
            isBotAdmin: isBotAdmin
        };
    } catch (error) {
        console.error('❌ Error checking admin status:', error.message);
        // Return false on error (safe fallback)
        return {
            isSenderAdmin: false,
            isBotAdmin: false
        };
    }
}

// ✅ Clean cache periodically to free memory
setInterval(() => {
    const now = Date.now();
    for (const [key, val] of groupCache) {
        if (now - val.timestamp > CACHE_DURATION) {
            groupCache.delete(key);
        }
    }
}, CACHE_DURATION * 2); // Clean every 60 seconds

module.exports = isAdmin;