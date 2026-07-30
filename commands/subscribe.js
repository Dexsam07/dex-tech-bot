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
//* 
//  * project_name : DEX-TECH-BOT
//  * author : Shyam Choudhari
//  * youtube : https://www.youtube.com/dex_shyam_tech 
//  * description : DEX-TECH-BOT ,A Multi-Device whatsapp user bot.
//*
//*
//re-upload? recode? copy code? give credit to Shyam Choudhari 2025:)
//Instagram: @dex_shyam_42
//Telegram: t.me/dex_shyam_tools
//GitHub: dexsam07 
//WhatsApp: +639542842622
//want more free bot scripts? subscribe to my youtube channel: https://youtube.com/@dex_shyam_tech
//   * Created By Github: dexsam07.
//   * Credit To Shyam Choudhari 
//   * © 2025 DEX-TECH-BOT.
// ⛥┌┤
// */

async function subscribeCommand(sock, chatId, message) {
    const text = `╭──◆「 *PREMIUM SUB* 」◆\n` +
        `├\n` +
        `├◇ ⭐ Unlock all premium features\n` +
        `├◇ 🤖 AI | 🎨 Images | 🎵 Media\n` +
        `├\n` +
        `├◇ *💰 Plan:*\n` +
        `├  └ Monthly — ₦5000\n` +
        `├  └ Multi Currency Support\n` +
        `├\n` +
        `├◇ *💳 Payment Methods:*\n` +
        `├\n` +
        `├◇ *1️⃣ Pay Online (Selar)*\n` +
        `├  └ Card | Bank | USSD\n` +
        `├  └ https://selar.com/78a55u73jm\n` +
        `├\n` +
        `├◇ *2️⃣ Manual Transfer*\n` +
        `├  └ *Bank:* Palpay\n` +
        `├  └ *Acct:* 9095991180\n` +
        `├  └ *Name:* CHIMBIKO ROSBERY UZUKWU\n` +
        `├\n` +
        `├◇ *📞 Contact:* +918069675806\n` +
        `├◇ *📧 Send proof after payment*\n` +
        `├\n` +
        `╰─┬─★─☆─♪♪─◆\n\n` +
        `╭──◆「 *DEX-TECH-BOT* 」◆\n` +
        `╰──★─☆─♪♪─◆`;

    await sock.sendMessage(chatId, { text }, { quoted: message });
}

module.exports = subscribeCommand;
