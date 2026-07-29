//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                             𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓                                                                                                     //
//                                                                  𝐕 : 1.0.0                                                                                                             //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2026                                                                                                        //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//* 
//  * file : commands/tictactoe.js
//  * description : TicTacToe game with dynamic newsletter & prefix
//  * Credit To  DEX SHYAM TECH
// ⛥┌┤
// */

const TicTacToe = require('../lib/tictactoe');
const settings = require('../settings');

// Store games globally
const games = {};

// ✅ Helper: Build context info dynamically from settings
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

// ============================================================
//  TICTACTOE COMMAND (Start / Join Game)
// ============================================================
async function tictactoeCommand(sock, chatId, senderId, text) {
    try {
        const prefix = settings.prefix || '.';

        // Check if player is already in a game
        if (Object.values(games).find(room =>
            room.id.startsWith('tictactoe') &&
            [room.game.playerX, room.game.playerO].includes(senderId)
        )) {
            await sock.sendMessage(chatId, {
                text: '❌ You are still in a game. Type *surrender* to quit.',
                ...getContextInfo()
            });
            return;
        }

        // Look for existing room
        let room = Object.values(games).find(room =>
            room.state === 'WAITING' &&
            (text ? room.name === text : true)
        );

        if (room) {
            // Join existing room
            room.o = chatId;
            room.game.playerO = senderId;
            room.state = 'PLAYING';

            const arr = room.game.render().map(v => ({
                'X': '❎',
                'O': '⭕',
                '1': '1️⃣',
                '2': '2️⃣',
                '3': '3️⃣',
                '4': '4️⃣',
                '5': '5️⃣',
                '6': '6️⃣',
                '7': '7️⃣',
                '8': '8️⃣',
                '9': '9️⃣',
            }[v]));

            const str = `
🎮 *TicTacToe Game Started!*

*Waiting for @${room.game.currentTurn.split('@')[0]} to play...*

${arr.slice(0, 3).join('')}
${arr.slice(3, 6).join('')}
${arr.slice(6).join('')}

🔴 *Room ID: ${room.id}*
🔵 *Rules:*
• Make 3 in a row (horizontal, vertical, diagonal)
• Type a *number (1-9)* to place your symbol
• Type *surrender* to give up
`;

            await sock.sendMessage(chatId, {
                text: str,
                mentions: [room.game.currentTurn, room.game.playerX, room.game.playerO],
                ...getContextInfo()
            });

        } else {
            // Create new room
            room = {
                id: 'tictactoe-' + (+new Date),
                x: chatId,
                o: '',
                game: new TicTacToe(senderId, 'o'),
                state: 'WAITING'
            };

            if (text) room.name = text;

            await sock.sendMessage(chatId, {
                text: `⏳ *Waiting for opponent*\n\nType *${prefix}ttt ${text || ''}* to join!`,
                ...getContextInfo()
            });

            games[room.id] = room;
        }

    } catch (error) {
        console.error('❌ Error in tictactoe command:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Error starting game. Please try again.',
            ...getContextInfo()
        });
    }
}

// ============================================================
//  HANDLE MOVE (Play / Surrender)
// ============================================================
async function handleTicTacToeMove(sock, chatId, senderId, text) {
    try {
        // Find player's game
        const room = Object.values(games).find(room =>
            room.id.startsWith('tictactoe') &&
            [room.game.playerX, room.game.playerO].includes(senderId) &&
            room.state === 'PLAYING'
        );

        if (!room) return;

        const isSurrender = /^(surrender|give up)$/i.test(text);

        if (!isSurrender && !/^[1-9]$/.test(text)) return;

        // Allow surrender anytime, otherwise check turn
        if (senderId !== room.game.currentTurn && !isSurrender) {
            await sock.sendMessage(chatId, {
                text: '❌ Not your turn!',
                ...getContextInfo()
            });
            return;
        }

        let ok = isSurrender ? true : room.game.turn(
            senderId === room.game.playerO,
            parseInt(text) - 1
        );

        if (!ok) {
            await sock.sendMessage(chatId, {
                text: '❌ Invalid move! That position is already taken.',
                ...getContextInfo()
            });
            return;
        }

        let winner = room.game.winner;
        let isTie = room.game.turns === 9;

        const arr = room.game.render().map(v => ({
            'X': '❎',
            'O': '⭕',
            '1': '1️⃣',
            '2': '2️⃣',
            '3': '3️⃣',
            '4': '4️⃣',
            '5': '5️⃣',
            '6': '6️⃣',
            '7': '7️⃣',
            '8': '8️⃣',
            '9': '9️⃣',
        }[v]));

        // Handle Surrender
        if (isSurrender) {
            winner = senderId === room.game.playerX ? room.game.playerO : room.game.playerX;
            await sock.sendMessage(chatId, {
                text: `🏳️ @${senderId.split('@')[0]} has surrendered! @${winner.split('@')[0]} wins!`,
                mentions: [senderId, winner],
                ...getContextInfo()
            });
            delete games[room.id];
            return;
        }

        let gameStatus;
        if (winner) {
            gameStatus = `🎉 @${winner.split('@')[0]} wins the game!`;
        } else if (isTie) {
            gameStatus = `🤝 Game ended in a draw!`;
        } else {
            gameStatus = `🎲 Turn: @${room.game.currentTurn.split('@')[0]} (${senderId === room.game.playerX ? '❎' : '⭕'})`;
        }

        const str = `
🎮 *TicTacToe Game*

${gameStatus}

${arr.slice(0, 3).join('')}
${arr.slice(3, 6).join('')}
${arr.slice(6).join('')}

➡️ Player ❎: @${room.game.playerX.split('@')[0]}
➡️ Player ⭕: @${room.game.playerO.split('@')[0]}

${!winner && !isTie ? '• Type a *number (1-9)* to move\n• Type *surrender* to give up' : ''}
`;

        const mentions = [
            room.game.playerX,
            room.game.playerO,
            ...(winner ? [winner] : [room.game.currentTurn])
        ];

        await sock.sendMessage(room.x, {
            text: str,
            mentions: mentions,
            ...getContextInfo()
        });

        if (room.x !== room.o) {
            await sock.sendMessage(room.o, {
                text: str,
                mentions: mentions,
                ...getContextInfo()
            });
        }

        if (winner || isTie) {
            delete games[room.id];
        }

    } catch (error) {
        console.error('❌ Error in tictactoe move:', error);
    }
}

// ============================================================
//  EXPORTS
// ============================================================
module.exports = {
    tictactoeCommand,
    handleTicTacToeMove
};