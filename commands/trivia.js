//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                             𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓                                                                                                     //
//                                                                  𝐕 : 1.0.0                                                                                                             //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2026                                                                                                        //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//* 
//  * file : commands/trivia.js
//  * description : Trivia quiz game with Open Trivia DB API
//  * Credit To  DEX SHYAM TECH
// ⛥┌┤
// */

const axios = require('axios');
const settings = require('../settings');

// ========== GAME STORE ==========
const triviaGames = {};

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

// ========== START TRIVIA ==========
function startTrivia(sock, chatId) {
    try {
        const prefix = settings.prefix || '.';

        if (triviaGames[chatId]) {
            sock.sendMessage(chatId, {
                text: '⚠️ A trivia game is already in progress!\nType *' + prefix + 'answer <your answer>* to play.',
                ...getContextInfo()
            });
            return;
        }

        // Fetch question from API
        axios.get('https://opentdb.com/api.php?amount=1&type=multiple')
            .then(response => {
                const questionData = response.data.results[0];

                // Decode HTML entities (like &quot;)
                const decode = (str) => {
                    return str.replace(/&quot;/g, '"')
                              .replace(/&#039;/g, "'")
                              .replace(/&amp;/g, '&')
                              .replace(/&lt;/g, '<')
                              .replace(/&gt;/g, '>');
                };

                const question = decode(questionData.question);
                const correctAnswer = decode(questionData.correct_answer);
                const incorrectAnswers = questionData.incorrect_answers.map(decode);

                const options = [correctAnswer, ...incorrectAnswers].sort();

                triviaGames[chatId] = {
                    question: question,
                    correctAnswer: correctAnswer,
                    options: options
                };

                const botName = settings.botName || '𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓';
                const optionList = options.map((opt, idx) => `${idx + 1}. ${opt}`).join('\n');

                sock.sendMessage(chatId, {
                    text: `🧠 *TRIVIA TIME* 🧠\n\n📋 *Question:*\n${question}\n\n📌 *Options:*\n${optionList}\n\n💡 Use *${prefix}answer <option text or number>* to respond.\n\n🤖 ${botName}`,
                    ...getContextInfo()
                });
            })
            .catch(error => {
                console.error('❌ Trivia API error:', error.message);
                sock.sendMessage(chatId, {
                    text: '❌ Failed to fetch trivia question. Please try again later.',
                    ...getContextInfo()
                });
            });
    } catch (error) {
        console.error('❌ Trivia start error:', error);
        sock.sendMessage(chatId, {
            text: '❌ Error starting trivia. Please try again.',
            ...getContextInfo()
        });
    }
}

// ========== ANSWER TRIVIA ==========
function answerTrivia(sock, chatId, answer) {
    try {
        const prefix = settings.prefix || '.';

        if (!triviaGames[chatId]) {
            sock.sendMessage(chatId, {
                text: `❌ No trivia game in progress.\nStart a new game with *${prefix}trivia*`,
                ...getContextInfo()
            });
            return;
        }

        if (!answer || typeof answer !== 'string' || answer.trim() === '') {
            sock.sendMessage(chatId, {
                text: `❌ Please provide an answer.\nExample: *${prefix}answer Option 1* or *${prefix}answer 1*`,
                ...getContextInfo()
            });
            return;
        }

        const game = triviaGames[chatId];
        const userAnswer = answer.trim();
        let isCorrect = false;

        // Check if user answered with number (1-4)
        const optionIndex = parseInt(userAnswer) - 1;
        if (!isNaN(optionIndex) && optionIndex >= 0 && optionIndex < game.options.length) {
            const selectedOption = game.options[optionIndex];
            isCorrect = selectedOption.toLowerCase() === game.correctAnswer.toLowerCase();
        } else {
            // Match by text
            isCorrect = userAnswer.toLowerCase() === game.correctAnswer.toLowerCase();
        }

        const correctAnswer = game.correctAnswer;
        const botName = settings.botName || '𝐃𝐄𝐗 𝐓𝐄𝐂𝐇 𝐁𝐎𝐓';

        if (isCorrect) {
            sock.sendMessage(chatId, {
                text: `✅ *CORRECT!* 🎉\n\nThe answer was: *${correctAnswer}*\n\n👏 Well done!\n🤖 ${botName}`,
                ...getContextInfo()
            });
        } else {
            sock.sendMessage(chatId, {
                text: `❌ *WRONG ANSWER* 😞\n\nCorrect answer was: *${correctAnswer}*\n\nBetter luck next time!\n🤖 ${botName}`,
                ...getContextInfo()
            });
        }

        delete triviaGames[chatId];
    } catch (error) {
        console.error('❌ Trivia answer error:', error);
        sock.sendMessage(chatId, {
            text: '❌ Error processing your answer. Please try again.',
            ...getContextInfo()
        });
    }
}

// ========== EXPORTS ==========
module.exports = {
    startTrivia,
    answerTrivia
};