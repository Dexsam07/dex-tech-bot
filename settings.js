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
require('dotenv').config();
const settings = {
  packname: 'Dex Shyam Tech',
  author: '‎ Shyam Choudhari',
  botName: "Dex-Tech-Bot",
  botOwner: '', 
  timezone: 'Aisa/kolkata',
  prefix: '.',
  ownerNumber: '', //Set your number here without + symbol, just add country code & number without any space
  giphyApiKey: 'qnl7ssQChTdPjsKta2Ax2LMaGXz303tq',
  commandMode: "public",
  maxStoreMessages: 20, 
  storeWriteInterval: 10000,
  description: "𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓 ,A Multi-Device whatsapp user bot",
  version: "1.0.0",
  updateZipUrl: "https://www.github.com/@dexsam07/refs/heads/main.zip",
  removeBgApi: {
    enabled: true,
    apiKey: "dyrbNSNtMf1CE84he61DR7Wx", // Your remove.bg API key That's currently mine it expire anytime remember to put yours if expired just go to remove.bg site sign up and get your api key 
    apiUrl: "https://api.remove.bg/v1.0/removebg"
  }
};

global.sessionid = process.env.SESSION_ID || "";
module.exports = settings;
