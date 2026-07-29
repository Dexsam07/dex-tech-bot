//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                             𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓                                                                                                     //
//                                                                  𝐕 : 1.0.0                                                                                                             //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2026                                                                                                        //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//* 
//  * file : commands/hangman.js
//  * description : Hangman word guessing game with dynamic config
//  * Credit To  DEX SHYAM TECH
// ⛥┌┤
// */

const settings = require('../settings');

// ========== WORD LIST (Cleaned: no single letters, no spaces) ==========
const rawWords = [
    'be', 'am', 'go', 'to', 'in', 'on', 'up', 'by', 'so', 'my', 'we', 'he', 'it', 'as', 'at', 'or', 'no', 'if', 'me', 'an', 'is', 'do', 'of', 'ok', 'us', 'hi', 'yo',
    'cat', 'dog', 'sun', 'run', 'big', 'red', 'you', 'and', 'the', 'but', 'not', 'yes', 'out', 'see', 'new', 'old', 'man', 'boy', 'girl', 'sky', 'sea', 'car', 'bus', 'pen',
    'able', 'bark', 'cold', 'dust', 'eave', 'frog', 'gold', 'hard', 'iris', 'joke', 'kite', 'lamp', 'mind', 'nose', 'open', 'port', 'quiz', 'road', 'sun', 'tree', 'undo', 'vast', 'wind', 'xray', 'yard', 'zone',
    'house', 'apple', 'world', 'music', 'river', 'light', 'green', 'peace', 'heart', 'smile', 'laugh', 'crown', 'storm', 'fruit', 'chair', 'table', 'dream', 'night', 'beach', 'cloud',
    'planet', 'coffee', 'summer', 'garden', 'jacket', 'bright', 'travel', 'friend', 'golden', 'silver', 'market', 'spring', 'laugh', 'stamp', 'dream', 'ship', 'shutter', 'start', 'stay',
    'vision', 'wonder', 'build', 'computer', 'elephant', 'language', 'sunshine', 'football', 'mountain', 'laughter', 'hospital', 'distance', 'knowledge', 'happiness', 'beautiful',
    'adventure', 'friendship', 'community', 'education', 'chocolate', 'discovery', 'butterfly', 'background', 'celebration', 'development', 'extraordinary', 'friendliness',
    'information', 'leadership', 'management', 'technology', 'understanding', 'telephone', 'application', 'determination', 'environment', 'university'
];

// ✅ Filter: length >= 2, remove spaces, lowercase
const words = rawWords
    .filter(w => w.trim().length >= 2)
    .map(w => w.trim().toLowerCase());

// ========== GAME STORE ==========
const hangmanGames = {};

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

// ========== START GAME ==========
function startHangman(sock, chatId) {
    try {
        const prefix = settings.prefix || '.';
        
        // Check if game already exists
        if (hangmanGames[chatId]) {
            sock.sendMessage(chatId, {
                text: `⚠️ A game is already in progress!\nType *${prefix}guess <letter>* to play.`,
                ...getContextInfo()
            });
            return;
        }

        const word = words[Math.floor(Math.random() * words.length)];
        const maskedWord = '_ '.repeat(word.length).trim().split(' ');

        hangmanGames[chatId] = {
            word: word,
            maskedWord: maskedWord,
            guessedLetters: [],
            wrongGuesses: 0,
            maxWrongGuesses: 6,
            startTime: Date.now()
        };

        const botName = settings.botName || '𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓';
        sock.sendMessage(chatId, {
            text: `🧩 *HANGMAN* 🧩\n\n🕵️ *Word:* ${maskedWord.join(' ')}\n💀 *Lives:* 6 ❤️\n\n💡 Guess a letter using:\n*${prefix}guess <letter>*\n\n🤖 ${botName}`,
            ...getContextInfo()
        });
    } catch (error) {
        console.error('❌ Hangman start error:', error);
        sock.sendMessage(chatId, {
            text: '❌ Failed to start hangman. Please try again.',
            ...getContextInfo()
        });
    }
}

// ========== GUESS LETTER ==========
function guessLetter(sock, chatId, letter) {
    try {
        const prefix = settings.prefix || '.';
        const game = hangmanGames[chatId];

        if (!game) {
            sock.sendMessage(chatId, {
                text: `❌ No game in progress.\nStart a new game with *${prefix}hangman*`,
                ...getContextInfo()
            });
            return;
        }

        // ✅ Validate input: single alphabet letter
        if (!letter || typeof letter !== 'string' || letter.length !== 1 || !/^[a-zA-Z]$/.test(letter)) {
            sock.sendMessage(chatId, {
                text: `❌ Invalid input! Please guess a *single letter* (A-Z).\nExample: *${prefix}guess A*`,
                ...getContextInfo()
            });
            return;
        }

        const lowerLetter = letter.toLowerCase();
        const { word, maskedWord, guessedLetters, maxWrongGuesses } = game;

        // Check if already guessed
        if (guessedLetters.includes(lowerLetter)) {
            sock.sendMessage(chatId, {
                text: `⚠️ You already guessed *"${lowerLetter}"*. Try another letter.\n📝 Guessed: ${guessedLetters.join(', ')}`,
                ...getContextInfo()
            });
            return;
        }

        // Add to guessed letters
        guessedLetters.push(lowerLetter);

        // Check if letter is in the word
        if (word.includes(lowerLetter)) {
            // Update masked word
            for (let i = 0; i < word.length; i++) {
                if (word[i] === lowerLetter) {
                    maskedWord[i] = lowerLetter;
                }
            }

            const remaining = maskedWord.filter(c => c === '_').length;
            const currentWord = maskedWord.join(' ');

            let msg = `✅ *Correct!* 🎯\n🕵️ *Word:* ${currentWord}`;

            // Check win
            if (!maskedWord.includes('_')) {
                const duration = Math.floor((Date.now() - game.startTime) / 1000);
                delete hangmanGames[chatId];
                msg = `🎉 *CONGRATULATIONS!* 🎉\n\nYou guessed the word *${word.toUpperCase()}*!\n⏱️ Time: ${duration} seconds\n\n👏 Well played!`;
                sock.sendMessage(chatId, { text: msg, ...getContextInfo() });
                return;
            }

            msg += `\n❓ *Remaining:* ${remaining} letters\n📝 *Guessed:* ${guessedLetters.join(', ')}`;
            sock.sendMessage(chatId, { text: msg, ...getContextInfo() });

        } else {
            // Wrong guess
            game.wrongGuesses += 1;
            const livesLeft = maxWrongGuesses - game.wrongGuesses;

            // Hangman visual
            const hangmanVisual = [
                '```\n  +---+\n  |   |\n      |\n      |\n      |\n      |\n=========```',
                '```\n  +---+\n  |   |\n  O   |\n      |\n      |\n      |\n=========```',
                '```\n  +---+\n  |   |\n  O   |\n  |   |\n      |\n      |\n=========```',
                '```\n  +---+\n  |   |\n  O   |\n /|   |\n      |\n      |\n=========```',
                '```\n  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n      |\n=========```',
                '```\n  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n      |\n=========```',
                '```\n  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n      |\n=========```'
            ];

            const visual = hangmanVisual[game.wrongGuesses] || hangmanVisual[0];
            const currentWord = maskedWord.join(' ');

            let msg = `❌ *Wrong guess!*\n${visual}\n🕵️ *Word:* ${currentWord}\n💀 *Lives left:* ${livesLeft} ❤️\n📝 *Guessed:* ${guessedLetters.join(', ')}`;

            // Check game over
            if (game.wrongGuesses >= maxWrongGuesses) {
                delete hangmanGames[chatId];
                msg = `💀 *GAME OVER* 💀\n${visual}\n\nThe word was: *${word.toUpperCase()}*\n\nBetter luck next time! 😅`;
                sock.sendMessage(chatId, { text: msg, ...getContextInfo() });
                return;
            }

            sock.sendMessage(chatId, { text: msg, ...getContextInfo() });
        }
    } catch (error) {
        console.error('❌ Hangman guess error:', error);
        sock.sendMessage(chatId, {
            text: '❌ Error processing your guess. Please try again.',
            ...getContextInfo()
        });
    }
}

// ========== EXPORTS ==========
module.exports = {
    startHangman,
    guessLetter
};