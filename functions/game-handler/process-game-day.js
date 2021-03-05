/*
    Module import(s)
*/
const gameBoardcaster = require('../game-broadcaster');
const arrayHandler = require('../array-handler');
const gamesHandler = require('../games-handler');
const gameBroadcaster = require('../game-broadcaster');
const gameCompleteChecker = require('./checker-game-complete');
const gameDefaults = require('../game-defaults');
const gameEndProcessor = require('./process-game-end');
const gameNightProcessor = require('./process-game-night');

/*
    Function to process day data
*/
const processGameDay = (gameId) => {

    console.log(`[ Game Handler ][ Processing ][ Game Day ][ Game Id: ${gameId} ]`);

    // Get game object from hashmap and clear the timer on the game
    let game = gamesHandler.games[gameId];
    clearTimeout(game.private.gameTimeout);

    // Set default values
    let playerKilled = false;
    let targetId = null;
    let targetOccurrences = 0;
    let targetDraw = false;

    // Get a target from array of selected players
    for (let i = 0; i < Object.keys(game.private.playerData).length; i++) {

        let tempTargetId = Object.keys(game.private.playerData)[i];

        // Check wether to update the current target
        if (arrayHandler.getOccurrences(game.private.killedPlayerVotes, tempTargetId) == targetOccurrences) {
            targetDraw = true;
        } else if (arrayHandler.getOccurrences(game.private.killedPlayerVotes, tempTargetId) > targetOccurrences) {
            targetDraw = false;
            targetId = tempTargetId;
            targetOccurrences = arrayHandler.getOccurrences(game.private.killedPlayerVotes, tempTargetId);
        };
    };

    // Check that there is not a draw in votes
    // Check that there is a target id 
    if (!targetDraw && targetId != null) {
        game.private.playerData[targetId].alive = false;
        playerKilled = true;
    };

    // Reset game day time values 
    game.private.killedPlayerVotes = [];
    game.private.clientsVotedKill = [];

    // Change the current game status
    game.public.status = "inGameNightTime";

    // Check if game is complete 
    let gameComplete = gameCompleteChecker.isGameComplete(gameId);

    if (gameComplete.gameComplete) {

        // Process game end
        gameEndProcessor.processGameEnd(gameId, gameComplete);
    } else {

        // Update game timer
        game.private.gameTimeout = setTimeout(gameNightProcessor.processGameNight, gameDefaults.gameTimings.nightLength, gameId);

        // Broadcast game data to all clients
        gameBoardcaster.broadcastGameData(gameId);
        gameBoardcaster.broadcastCountdown(gameId, gameDefaults.gameTimings.nightLength, "inGameNightTime");
        gameBroadcaster.broadcastFullScreenMessageEndOfDayTime(gameId, playerKilled, targetId);
    };
};

/*
    Module export(s)
*/
module.exports = {
    processGameDay: processGameDay
};