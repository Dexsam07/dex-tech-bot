//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                                                                                                                                                        //
//                                                             𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓                                                                                                     //
//                                                                                                                                                                                        //
//                                                                  𝐕 : 1.0.0                                                                                                             //
//                                                                                                                                                                                        //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2026                                                                                                        //
//                                                                                                                                                                                        //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//* 
//  * command : ai
//  * description : Chat with AI bot
//  * Credit To  DEX SHYAM TECH
//  * © 2026 𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓.
// ⛥┌┤
// */

const axios = require('axios');
const settings = require('../settings');

// ✅ Multiple AI APIs with fallback
const AI_APIS = [
    {
        name: 'ZellAI',
        url: (query) => `https://zellapi.autos/ai/chatbot?text=${encodeURIComponent(query)}`,
        timeout: 10000 // 10 seconds timeout
    },
    {
        name: 'Gpt4o',
        url: (query) => `https://vihangayt.me/api/gpt4?q=${encodeURIComponent(query)}`,
        timeout: 12000
    },
    {
        name: 'Blackbox',
        url: (query) => `https://api.ryzen-3.space/api/blackbox?text=${encodeURIComponent(query)}`,
        timeout: 15000
    }
];

module.exports = {
    name: 'ai',
    category: 'Utility',
    description: 'Chat with AI bot',
    usage: '.ai <your question>',
    execute: async (dexbotInc, message, args, sender, from) => {
        try {
            // ✅ Check if query is provided
            const prefix = settings.prefix || '.';
            let query = '';
            if (message.body) {
                const parts = message.body.trim().split(/\s+/);
                if (parts.length > 1) {
                    query = parts.slice(1).join(' ');
                }
            }

            if (!query) {
                return await dexbotInc.sendMessage(from, {
                    text: `❌ Please provide a question.\nUsage: ${prefix}ai <your question>`
                });
            }

            // ✅ Send typing indicator
            await dexbotInc.sendPresenceUpdate('composing', from);

            // ✅ Try each API with timeout
            let lastError = null;
            for (const api of AI_APIS) {
                try {
                    const response = await axios.get(api.url(query), {
                        timeout: api.timeout || 10000,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    });

                    let reply = null;
                    // ✅ Parse different API response formats
                    if (api.name === 'ZellAI') {
                        reply = response.data?.result || response.data?.message || response.data?.response || null;
                    } else if (api.name === 'Gpt4o') {
                        reply = response.data?.result || response.data?.message || response.data?.response || null;
                    } else if (api.name === 'Blackbox') {
                        reply = response.data?.result || response.data?.response || response.data?.message || null;
                    }

                    if (reply) {
                        // ✅ Success - send reply
                        await dexbotInc.sendMessage(from, {
                            text: `🤖 *AI Response:*\n\n${reply}\n\n🔹 Powered by: ${api.name}`
                        });
                        return; // ✅ Exit successfully
                    }
                } catch (err) {
                    lastError = err;
                    console.warn(`⚠️ ${api.name} API failed:`, err.message);
                    continue; // Try next API
                }
            }

            // ✅ All APIs failed
            await dexbotInc.sendMessage(from, {
                text: `❌ All AI APIs are currently unavailable.\nPlease try again later.\n\nLast error: ${lastError?.message || 'Unknown error'}`
            });

        } catch (error) {
            console.error('❌ AI command error:', error.message);
            await dexbotInc.sendMessage(from, {
                text: `❌ Error processing AI request. Please try again.\n\nError: ${error.message}`
            });
        }
    }
};