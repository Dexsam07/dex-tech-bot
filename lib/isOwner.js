//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                             𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓                                                                                                     //
//                                                                  𝐕 : 1.0.0                                                                                                             //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2026                                                                                                        //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//* 
//  * file : lib/isOwner.js
//  * description : Check if user is owner or sudo (simplified & fast)
//  * Credit To  DEX SHYAM TECH
// ⛥┌┤
// */

const settings = require('../settings');
const { isSudo } = require('./index');

/**
 * ✅ Normalize a JID to just the phone number (without @s.whatsapp.net or @lid)
 * @param {string} jid - WhatsApp JID
 * @returns {string} - Numeric phone number
 */
function normalizeJid(jid) {
    if (!jid) return '';
    // Remove @s.whatsapp.net, @lid, @g.us, etc.
    let num = jid.split('@')[0];
    // Remove :1 (if present)
    num = num.split(':')[0];
    return num;
}

/**
 * Check if a user is the bot owner or a sudo user
 * @param {string} senderId - User JID to check
 * @param {Object} sock - WhatsApp socket (optional, not used)
 * @param {string} chatId - Current chat (optional)
 * @returns {Promise<boolean>}
 */
async function isOwnerOrSudo(senderId, sock = null, chatId = null) {
    if (!senderId) return false;

    // ✅ 1. Normalize sender and owner numbers
    const senderNum = normalizeJid(senderId);
    const ownerNum = normalizeJid(settings.ownerNumber);

    // ✅ 2. Check if sender matches the main owner
    if (senderNum === ownerNum) {
        return true;
    }

    // ✅ 3. Check if sender matches any additional owners (if defined in settings)
    if (settings.owners && Array.isArray(settings.owners)) {
        for (const owner of settings.owners) {
            const ownerNorm = normalizeJid(owner);
            if (senderNum === ownerNorm) {
                return true;
            }
        }
    }

    // ✅ 4. Check if sender is the bot itself (sometimes needed)
    if (sock && sock.user && sock.user.id) {
        const botNum = normalizeJid(sock.user.id);
        if (senderNum === botNum) {
            return true;
        }
    }

    // ✅ 5. Check sudo status (from lib/index)
    try {
        const isSudoUser = await isSudo(senderId);
        if (isSudoUser) {
            return true;
        }
    } catch (e) {
        console.error('❌ Error checking sudo:', e.message);
    }

    // ❌ None matched
    return false;
}

module.exports = isOwnerOrSudo;