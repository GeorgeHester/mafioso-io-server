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
const gameDayProcessor = require('./process-game-day');

/*
    Function to process night data
*/
const processGameNight = (gameId) => {

    console.log(`[ Game Handler ][ Processing ][ Game Night ][ Game Id: ${gameId} ]`);

    // Get game object from hashmap and clear the timer on the game
    let game = gamesHandler.games[gameId];
    clearTimeout(game.private.gameTimeout);

    // Set default values
    let playerKilled = false;
    let targetId = null;
    let targetOccurrences = 0;
    let targetDraw = false;

    // Check that there is a player to reveal then add this to the array of revealed players
    if (game.private.revealedPlayer != null) {
        game.private.revealedPlayerTypes.push(game.private.revealedPlayer);
    };

    // Get a target from array of selected players
    for (let i = 0; i < Object.keys(game.private.playerData).length; i++) {

        let tempTargetId = Object.keys(game.private.playerData)[i];

        // Check wether to update the current target
        if (arrayHandler.getOccurrences(game.private.targetedPlayerVotes, tempTargetId) == targetOccurrences) {
            targetDraw = true;
        } else if (arrayHandler.getOccurrences(game.private.targetedPlayerVotes, tempTargetId) > targetOccurrences) {
            targetDraw = false;
            targetId = tempTargetId;
            targetOccurrences = arrayHandler.getOccurrences(game.private.targetedPlayerVotes, tempTargetId);
        };
    };

    // Check that there is not a draw in votes
    // Check that there is a target id 
    if (!targetDraw && targetId != null) {

        // Check that the target is not immunised 
        if (targetId != game.private.immunisedPlayer) {
            game.private.playerData[targetId].alive = false;
            playerKilled = true;
        };
    };

    // Reset game night time values 
    game.private.revealedPlayer = null;
    game.private.oldTemporaryTargetedPlayerVote = {};
    game.private.temporaryTargetedPlayerVotes = [];
    game.private.targetedPlayerVotes = [];
    game.private.clientsVotedTarget = [];
    game.private.immunisedPlayer = null;

    // Change the current game status
    game.public.status = "inGameDayTime";

    // Check if game is complete 
    let gameComplete = gameCompleteChecker.isGameComplete(gameId);

    if (gameComplete.gameComplete) {

        // Process game end
        gameEndProcessor.processGameEnd(gameId, gameComplete);
    } else {

        // Update game timer
        game.private.gameTimeout = setTimeout(gameDayProcessor.processGameDay, gameDefaults.gameTimings.dayLength, gameId);

        // Broadcast game data to all clients
        gameBoardcaster.broadcastGameData(gameId);
        gameBoardcaster.broadcastCountdown(gameId, gameDefaults.gameTimings.dayLength, "inGameDayTime");
        gameBroadcaster.broadcastFullScreenMessageEndOfNightTime(gameId, playerKilled, targetId);
    };
};

/*
    Module export(s)
*/
module.exports = {
    processGameNight: processGameNight
};