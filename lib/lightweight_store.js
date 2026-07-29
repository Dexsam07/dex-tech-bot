//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                             𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓                                                                                                     //
//                                                                  𝐕 : 1.0.0                                                                                                             //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2026                                                                                                        //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//* 
//  * file : lib/lightweight_store.js
//  * description : Lightweight message/store manager with atomic writes
//  * Credit To  DEX SHYAM TECH
// ⛥┌┤
// */

const fs = require('fs');
const path = require('path');

const STORE_FILE = path.join(__dirname, '../baileys_store.json');
const TEMP_FILE = STORE_FILE + '.tmp';

// ✅ Config: keep last 20 messages per chat (configurable)
let MAX_MESSAGES = 20;

// ✅ Try to read config from settings
try {
    const settings = require('../settings.js');
    if (settings.storeMaxMessages && typeof settings.storeMaxMessages === 'number') {
        MAX_MESSAGES = settings.storeMaxMessages;
    }
} catch (e) {
    // Use default if settings not available
}

const store = {
    messages: {},
    contacts: {},
    chats: {},

    // ✅ SAFE READ with auto-corruption recovery
    readFromFile(filePath = STORE_FILE) {
        try {
            if (fs.existsSync(filePath)) {
                const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                this.contacts = data.contacts || {};
                this.chats = data.chats || {};
                this.messages = data.messages || {};
                this.cleanupData();
                return true;
            }
            // File doesn't exist, create default
            this.writeToFile();
            return true;
        } catch (e) {
            console.warn('⚠️ Failed to read store file, resetting...', e.message);
            // If file is corrupted, reset
            this.messages = {};
            this.contacts = {};
            this.chats = {};
            this.writeToFile();
            return false;
        }
    },

    // ✅ ATOMIC WRITE (temp file + rename)
    writeToFile(filePath = STORE_FILE) {
        try {
            const data = JSON.stringify({
                contacts: this.contacts,
                chats: this.chats,
                messages: this.messages
            });
            // Write to temp file first
            fs.writeFileSync(TEMP_FILE, data);
            // Then rename (atomic operation)
            fs.renameSync(TEMP_FILE, filePath);
            return true;
        } catch (e) {
            console.warn('❌ Failed to write store file:', e.message);
            // Try to clean up temp file
            try { fs.unlinkSync(TEMP_FILE); } catch (_) {}
            return false;
        }
    },

    cleanupData() {
        // Convert old format messages to new format if needed
        if (this.messages) {
            Object.keys(this.messages).forEach(jid => {
                if (typeof this.messages[jid] === 'object' && !Array.isArray(this.messages[jid])) {
                    // Old format - convert to new format
                    const messages = Object.values(this.messages[jid]);
                    this.messages[jid] = messages.slice(-MAX_MESSAGES);
                }
                // Ensure it's an array and trim
                if (Array.isArray(this.messages[jid]) && this.messages[jid].length > MAX_MESSAGES) {
                    this.messages[jid] = this.messages[jid].slice(-MAX_MESSAGES);
                }
            });
        }
    },

    // ✅ BIND EVENTS (with memory optimization)
    bind(ev) {
        // Store incoming messages
        ev.on('messages.upsert', ({ messages }) => {
            messages.forEach(msg => {
                // Ignore status updates and protocol messages to save memory
                if (msg.key?.remoteJid === 'status@broadcast') return;
                if (msg.message?.protocolMessage) return;
                
                const jid = msg.key?.remoteJid;
                if (!jid) return;
                
                if (!this.messages[jid]) {
                    this.messages[jid] = [];
                }

                // Push new message (avoid duplicates)
                const exists = this.messages[jid].some(m => m.key?.id === msg.key?.id);
                if (!exists) {
                    this.messages[jid].push(msg);
                }

                // Trim old messages
                if (this.messages[jid].length > MAX_MESSAGES) {
                    this.messages[jid] = this.messages[jid].slice(-MAX_MESSAGES);
                }
            });
        });

        // Store contacts
        ev.on('contacts.update', (contacts) => {
            contacts.forEach(contact => {
                if (contact.id) {
                    this.contacts[contact.id] = {
                        id: contact.id,
                        name: contact.notify || contact.name || contact.verifiedName || '',
                        imgUrl: contact.imgUrl || ''
                    };
                }
            });
        });

        // Store chats
        ev.on('chats.set', (chats) => {
            this.chats = {};
            chats.forEach(chat => {
                this.chats[chat.id] = {
                    id: chat.id,
                    subject: chat.subject || chat.name || '',
                    unreadCount: chat.unreadCount || 0
                };
            });
        });

        // ✅ Auto-save periodically (every 30 seconds)
        const saveInterval = setInterval(() => {
            this.writeToFile();
        }, 30000);

        // Save on process exit
        const saveOnExit = () => {
            this.writeToFile();
            clearInterval(saveInterval);
        };
        process.on('exit', saveOnExit);
        process.on('SIGINT', saveOnExit);
        process.on('SIGTERM', saveOnExit);
    },

    // ✅ Load a specific message by ID
    async loadMessage(jid, id) {
        if (!jid || !id) return null;
        const chatMessages = this.messages[jid];
        if (!chatMessages || !Array.isArray(chatMessages)) return null;
        return chatMessages.find(m => m.key?.id === id) || null;
    },

    // ✅ Get store statistics
    getStats() {
        let totalMessages = 0;
        let totalContacts = Object.keys(this.contacts).length;
        let totalChats = Object.keys(this.chats).length;
        
        Object.values(this.messages).forEach(chatMessages => {
            if (Array.isArray(chatMessages)) {
                totalMessages += chatMessages.length;
            }
        });
        
        return {
            messages: totalMessages,
            contacts: totalContacts,
            chats: totalChats,
            maxMessagesPerChat: MAX_MESSAGES,
            memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB'
        };
    },

    // ✅ Clear all messages (free memory)
    clearMessages() {
        this.messages = {};
        this.writeToFile();
        console.log('🧹 Store messages cleared');
        return true;
    },

    // ✅ Clear specific chat messages
    clearChat(jid) {
        if (this.messages[jid]) {
            delete this.messages[jid];
            this.writeToFile();
            return true;
        }
        return false;
    }
};

module.exports = store;