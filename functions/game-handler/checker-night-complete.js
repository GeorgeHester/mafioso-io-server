/*
    Module import(s)
*/
const gamesHandler = require('../games-handler');
const playerCounter = require('./player-counter');
const gameNightProcessor = require('./process-game-night');

/*
    Function to check if the requirments for game night have been met
*/
const isGameNightComplete = (gameId) => {

    // Get game object from hash map of games
    let game = gamesHandler.games[gameId];

    // Check if requirements are met
    if (playerCounter.getNumberOfPersonType(gameId, 'personMafia', true) > game.private.clientsVotedTarget.length) { return false };
    if (game.private.immunisedPlayer == null) { return false };
    if (game.private.revealedPlayer == null) { return false };

    // call function to process game
    gameNightProcessor.processGameNight(gameId);
};

/*
    Module export(s)
*/
module.exports = {
    isGameNightComplete: isGameNightComplete
};