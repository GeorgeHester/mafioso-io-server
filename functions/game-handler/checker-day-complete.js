/*
    Module import(s)
*/
const gamesHandler = require('../games-handler');
const gameDayProcessor = require('./process-game-day');

/*
    Function to check if the requirments for game day have been met
*/
const isGameDayComplete = (gameId) => {

    // Get game object from hash map of games
    let game = gamesHandler.games[gameId];

    // Check if requirements are met
    if (Object.keys(game.private.playerData).length > game.private.clientsVotedKill.length) { return false };

    // call function to process game
    gameDayProcessor.processGameDay(gameId);
};

/*
    Module export(s)
*/
module.exports = {
    isGameDayComplete: isGameDayComplete
};