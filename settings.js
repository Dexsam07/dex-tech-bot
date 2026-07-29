//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                                                                                                                                                        //
//                                                             𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓                                                                                                     //
//                                                                                                                                                                                        //
//                                                                  𝐕 : 1.0.0                                                                                                             //
//                                                                                                                                                                                        //
//                                                                                                                                                                                        //
//                ██╗    ██╗ █████╗ ██╗     ██╗  ██╗   ██╗   ██╗ █████╗ ██╗   ██╗████████╗███████╗ ██████╗██╗  ██╗      ███╗   ███╗██████╗                                 //
//                ██║    ██║██╔══██╗██║     ██║  ╚██╗ ██╔╝   ██║██╔══██╗╚██╗ ██╔╝╚══██╔══╝██╔════╝██╔════╝██║  ██║      ████╗ ████║██╔══██╗                              //
//                ██║ █╗ ██║███████║██║     ██║   ╚████╔╝    ██║███████║ ╚████╔╝    ██║   █████╗  ██║     ███████║█████╗██╔████╔██║██║  ██║                               //
//                ██║███╗██║██╔══██║██║     ██║    ╚██╔╝██   ██║██╔══██║  ╚██╔╝     ██║   ██╔══╝  ██║     ██╔══██║╚════╝██║╚██╔╝██║██║  ██║                               //
//                ╚███╔███╔╝██║  ██║███████╗███████╗██║ ╚█████╔╝██║  ██║   ██║      ██║   ███████╗╚██████╗██║  ██║      ██║ ╚═╝ ██║██████╔╝                              //
//                 ╚══╝╚══╝ ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚════╝ ╚═╝  ╚═╝   ╚═╝      ╚═╝   ╚══════╝ ╚═════╝╚═╝  ╚═╝      ╚═╝     ╚═╝╚═════╝                                 //
//                                                                                                                                                                                        //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2026                                                                                                        //
//                                                                                                                                                                                        //
//                                                                                                                                                                                        //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//* 
//  * project_name : 𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓
//  * author : MIDNIGHT CYBER RIDER
//  * youtube : https://www.youtube.com/@dex_shyam_tech
//  * description : 𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓 ,A Multi-Device whatsapp user bot.
//*
//*
//re-upload? recode? copy code? give credit to Dex shyam tech 2026:)
//Instagram: 𝗠𝗢𝗡 𝗦𝗧𝗘𝗥tech
//Telegram: 
//GitHub: 
//WhatsApp: +639542842622
//want more free bot scripts? subscribe to my youtube channel: https://www.youtube.com/@gang_hacker
//   * Created By Github: 
//   * Credit To  DEX SHYAM TECH
//   * © 2026 𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓.
// ⛥┌┤
// */

// ========== 🔥 STEP 3: COMPLETE SETTINGS (GAAJU-XMD LEVEL) ==========
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// .env file load karo (agar hai toh)
dotenv.config();

// ========== 📦 ALL API KEYS & CONFIG (Kuch bhi missing nahi) ==========
module.exports = {
    // ===================== BOT INFO =====================
    version: "1.0.0",
    botName: "𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓",
    botOwner: "Shyam Choudhari",
    ownerNumber: process.env.OWNER_NUMBER || "917384287404",
    prefix: process.env.PREFIX || "",
    
    // ===================== TIMEZONE (INDIA) =====================
    timezone: process.env.TIMEZONE || "Asia/Kolkata",  // India timezone fixed
    timeFormat: "DD/MM/YYYY HH:mm:ss",

    // ===================== 📧 NEWSLETTER JID (TERA APNA - WAISE HI RAHEGA) =====================
    // ⚠️ WARNING: WhatsApp isko spoofing maan kar ban kar sakta hai, lekin teri marzi
    newsletterJid: "120363406449026172@newsletter",
    newsletterName: "Dex Shyam Tech",
    
    // ===================== 🔑 ALL API KEYS (ENVIRONMENT VARIABLES SE) =====================
    // Saari APIs jo GAAJU-XMD mein hain, sab yahan hain - kuch bhi missing nahi
    apis: {
        // Giphy (GIF search)
        giphy: {
            apiKey: process.env.GIPHY_API_KEY || "qnl7ssQChTdPjsKta2Ax2LMaGXz303tq"
        },
        
        // Remove Background
        removeBg: {
            apiKey: process.env.REMOVEBG_API_KEY || "dyrbNSNtMf1CE84he61DR7Wx"
        },
        
        // OpenWeather (Weather command)
        weather: {
            apiKey: process.env.WEATHER_API_KEY || "your_weather_api_key_here"
        },
        
        // Google Translate (Translate command)
        googleTranslate: {
            apiKey: process.env.GOOGLE_TRANSLATE_API_KEY || "your_google_translate_key_here"
        },
        
        // Gemini AI (Chatbot)
        gemini: {
            apiKey: process.env.GEMINI_API_KEY || "your_gemini_api_key_here"
        },
        
        // OpenAI (Alternative AI)
        openai: {
            apiKey: process.env.OPENAI_API_KEY || "your_openai_key_here"
        },
        
        // Stable Diffusion (Image Generation)
        stableDiffusion: {
            apiKey: process.env.STABLE_DIFFUSION_API_KEY || "your_stable_diffusion_key_here"
        },
        
        // ElevenLabs (Text to Speech)
        elevenLabs: {
            apiKey: process.env.ELEVENLABS_API_KEY || "your_elevenlabs_key_here"
        },
        
        // Spotify (Music)
        spotify: {
            clientId: process.env.SPOTIFY_CLIENT_ID || "",
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET || ""
        }
    },

    // ===================== 🛡️ ANTI-SPAM SETTINGS =====================
    antiSpam: {
        enabled: true,
        warnLimit: 3,
        muteDuration: 300, // 5 minutes
        kickThreshold: 5
    },

    // ===================== ⏰ AUTO-STATUS SETTINGS =====================
    autoStatus: {
        enabled: false,
        interval: 10, // minutes
        likeOn: true,
        selfOn: false,
        statusMessages: [
            "🌿 𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓 is online!",
            "🤖 Made with ❤️ by Shyam Choudhari",
            "🚀 WhatsApp Bot by 𝐃𝐄𝐗 𝐓𝐄𝐂𝐇"
        ]
    },

    // ===================== 💾 STORE SETTINGS =====================
    storeWriteInterval: 10000, // milliseconds
    sessionBackupInterval: 60 * 60 * 1000, // 1 hour

    // ===================== 🔄 RECONNECT SETTINGS =====================
    maxReconnectAttempts: 5,
    reconnectBaseDelay: 5000, // 5 seconds
    reconnectMaxDelay: 30000, // 30 seconds

    // ===================== ⚙️ OTHER SETTINGS =====================
    defaultQueryTimeout: 60000, // 1 minute
    connectTimeout: 60000, // 1 minute
    keepAliveInterval: 10000, // 10 seconds

    // ===================== 👤 OWNER JSON AUTO-CREATE =====================
    get owner() {
        try {
            const ownerPath = path.join(__dirname, 'data', 'owner.json');
            if (fs.existsSync(ownerPath)) {
                return JSON.parse(fs.readFileSync(ownerPath, 'utf8'));
            }
            // Auto-create owner.json if missing
            const defaultOwner = [{
                name: "Shyam Choudhari",
                number: this.ownerNumber,
                dev: true,
                admin: true
            }];
            if (!fs.existsSync(path.dirname(ownerPath))) {
                fs.mkdirSync(path.dirname(ownerPath), { recursive: true });
            }
            fs.writeFileSync(ownerPath, JSON.stringify(defaultOwner, null, 2));
            return defaultOwner;
        } catch (e) {
            return [{ name: "Shyam Choudhari", number: this.ownerNumber, dev: true, admin: true }];
        }
    }
};

// ========== ✅ VERIFICATION - Console mein sab dikhao ==========
console.log('✅ Settings loaded successfully!');
console.log(`🌍 Timezone: ${module.exports.timezone}`);
console.log(`📧 Newsletter: ${module.exports.newsletterJid}`);
console.log(`🔑 APIs loaded: ${Object.keys(module.exports.apis).join(', ')}`);
