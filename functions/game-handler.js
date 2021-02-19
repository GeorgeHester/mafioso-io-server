const gameDefaults = require('./game-defaults');
const gameBoardcaster = require('./game-broadcaster');
const arrayHandler = require('./array-handler');
const gamesHandler = require('./games-handler');
const clientsHandler = require('./clients-handler');
const gameBroadcaster = require('./game-broadcaster');
/*
const processStartGame = (game, clients) => {

};*/

const processGameNightTime = (gameId) => {

    console.log(`[ Process ][ GameNightTime ][ ${gameId} ]`);

    let game = gamesHandler.games[gameId];
    clearTimeout(game.private.gameTimeout);

    let playerKilled = false;

    // Check that there is a player to reveal then add this to the array of revealed players
    if (game.private.revealedPlayer != null) {
        game.private.revealedPlayerTypes.push(game.private.revealedPlayer);
    };

    // Reset the revealed player value
    game.private.revealedPlayer = null;

    // Get a target from array
    let targetId = null;
    let targetOccurrences = 0;
    let targetDraw = false;

    for (let i = 0; i < Object.keys(game.private.playerData).length; i++) {

        let tempTargetId = Object.keys(game.private.playerData)[i];

        if (arrayHandler.getOccurrences(game.private.targetedPlayerVotes, tempTargetId) == targetOccurrences) {
            targetDraw = true;
        } else if (arrayHandler.getOccurrences(game.private.targetedPlayerVotes, tempTargetId) > targetOccurrences) {
            targetDraw = false;
            targetId = tempTargetId;
            targetOccurrences = arrayHandler.getOccurrences(game.private.targetedPlayerVotes, tempTargetId);
        };
    };

    // Remove target player from game
    if (!targetDraw && targetId != null) {
        if (targetId != game.private.immunisedPlayer) {
            game.private.playerData[targetId].alive = false;
            playerKilled = true;
        };
    };

    // Reset the target and immunised player value
    game.private.oldTemporaryTargetedPlayerVote = {};
    game.private.temporaryTargetedPlayerVotes = [];
    game.private.targetedPlayerVotes = [];
    game.private.clientsVotedTarget = [];
    game.private.immunisedPlayer = null;

    // Change the current game status
    game.public.status = "inGameDayTime";

    // Check if game is complete 
    let gameComplete = checkIfGameComplete(gameId);

    if (gameComplete.gameComplete) {
        processEndGame(gameId, gameComplete);
    } else {
        game.private.gameTimeout = setTimeout(processGameDayTime, 33000, gameId);

        // Broadcast game data to all clients
        gameBoardcaster.broadcastGameData(gameId);
        gameBoardcaster.broadcastCountdown(gameId, 33000, "inGameDayTime");
        gameBroadcaster.broadcastFullScreenMessageEndOfNightTime(gameId, playerKilled, targetId);
    };
};

const processGameDayTime = (gameId) => {

    console.log(`[ Process ][ GameDayTime ][ ${gameId} ]`);

    let game = gamesHandler.games[gameId];
    clearTimeout(game.private.gameTimeout);
    
    let playerKilled = false;

    // Get a target from array
    let targetId = null;
    let targetOccurrences = 0;
    let targetDraw = false;

    for (let i = 0; i < Object.keys(game.private.playerData).length; i++) {

        let tempTargetId = Object.keys(game.private.playerData)[i];

        if (arrayHandler.getOccurrences(game.private.killedPlayerVotes, tempTargetId) == targetOccurrences) {
            targetDraw = true;
        } else if (arrayHandler.getOccurrences(game.private.killedPlayerVotes, tempTargetId) > targetOccurrences) {
            targetDraw = false;
            targetId = tempTargetId;
            targetOccurrences = arrayHandler.getOccurrences(game.private.killedPlayerVotes, tempTargetId);
        };
    };

    // Remove target player from game
    if (!targetDraw && targetId != null) {
        game.private.playerData[targetId].alive = false;
        playerKilled = true;
    };

    // Reset the target player value
    game.private.killedPlayerVotes = [];
    game.private.clientsVotedKill = [];

    // Change the current game status
    game.public.status = "inGameNightTime";

    // Check if game is complete 
    let gameComplete = checkIfGameComplete(gameId);

    if (gameComplete.gameComplete) {
        processEndGame(gameId, gameComplete);
    } else {
        game.private.gameTimeout = setTimeout(processGameNightTime, 33000, gameId);

        // Broadcast game data to all clients
        gameBoardcaster.broadcastGameData(gameId);
        gameBoardcaster.broadcastCountdown(gameId, 33000, "inGameNightTime");
        gameBroadcaster.broadcastFullScreenMessageEndOfDayTime(gameId, playerKilled, targetId);
    };
};

const processEndGame = (gameId, gameComplete) => {

    let game = gamesHandler.games[gameId];

    for (let i = 0; i < Object.keys(game.private.playerData).length; i++) {

        let clientId = Object.keys(game.private.playerData)[i];

        if (gameComplete.draw) {
            clientsHandler.clients[clientId].connection.send(JSON.stringify({
                "method": "fullScreenMessage",
                "message": gameComplete.messageAll,
                "messageType": "success"
            }));
        };

        if (game.private.playerData[clientId] === "personMafia") {
            if (gameComplete.mafiaWin) {
                clientsHandler.clients[clientId].connection.send(JSON.stringify({
                    "method": "fullScreenMessage",
                    "message": gameComplete.messageWinner,
                    "messageType": "success"
                }));
            } else {
                clientsHandler.clients[clientId].connection.send(JSON.stringify({
                    "method": "fullScreenMessage",
                    "message": gameComplete.messageLoser,
                    "messageType": "fail"
                }));
            };
        } else {
            if (gameComplete.mafiaWin) {
                clientsHandler.clients[clientId].connection.send(JSON.stringify({
                    "method": "fullScreenMessage",
                    "message": gameComplete.messageLoser,
                    "messageType": "fail"
                }));
            } else {
                clientsHandler.clients[clientId].connection.send(JSON.stringify({
                    "method": "fullScreenMessage",
                    "message": gameComplete.messageWinner,
                    "messageType": "success"
                }));
            };
        };
    };

    console.log(game.public.status);
    game.public.status = "postGame";

    // Broadcast game data to all clients
    gameBoardcaster.broadcastGameData(gameId);

    // Delete game
};

const setPersonTypes = (gameId) => {

    console.log(`[ Set ][ PersonTypes ][ ${gameId} ]`);

    let game = gamesHandler.games[gameId];

    let playerCount = Object.keys(game.private.playerData).length;
    let personTypes = gameDefaults.personTypeRatios[playerCount];

    for (let i = 0; i < Object.keys(personTypes).length; i++) {

        let personType = Object.keys(personTypes)[i];

        for (let j = 0; j < personTypes[personType]; j++) {

            let playerSet = false;

            while (!playerSet) {

                let randomPlayer = Object.keys(game.private.playerData)[Math.floor((Math.random() * playerCount))];

                if (game.private.playerData[randomPlayer].personType === "personUnknown") {
                    game.private.playerData[randomPlayer].personType = personType;
                    playerSet = true;
                };
            };
        };
    };
};

const checkIfNightTimeComplete = (gameId) => {

    let game = gamesHandler.games[gameId];

    if (getAliveMafia(gameId) > game.private.clientsVotedTarget.length) { return false };
    if (game.private.immunisedPlayer == null) { return false };
    if (game.private.revealedPlayer == null) { return false };

    processGameNightTime(gameId);
};


const checkIfDayTimeComplete = (gameId) => {

    let game = gamesHandler.games[gameId];

    if (Object.keys(game.private.playerData).length > game.private.clientsVotedKill.length) { return false };

    processGameDayTime(gameId);
};

const checkIfGameComplete = (gameId) => {

    let game = gamesHandler.games[gameId];

    if (getAliveMafia(gameId) == 0) {

        return { gameComplete: true, draw: false, mafiaWin: false, messageLoser: "You and your allies were voted out. You lose.", messageWinner: "You managed to find all the mafia. You win." };
    } else if (Object.keys(game.private.playerData).length + 1 == getAliveMafia(gameId)) {
        let finalPersonDoctor = false;
        for (let i = 0; i < Object.keys(game.private.playerData).length; i++) {
            if (game.private.playerData[Object.keys(game.private.playerData)[i]].personType === "personDoctor") {
                finalPersonDoctor = true;
            };
        };
        if (finalPersonDoctor) {
            return { gameComplete: true, draw: true, messageAll: "It was a draw the doctor managed to survive and so did the mafia." };
        } else {
            return { gameComplete: true, draw: false, mafiaWin: true, messageLoser: "The mafia managed to fly under the radar. You lose.", messageWinner: "You managed to keep low and kill all the villagers. You win." };

        };
    } else {
        return { gameComplete: false };
    };
};

const getAliveMafia = (gameId) => {

    let game = gamesHandler.games[gameId];

    let count = 0;

    for (let i = 0; i < Object.keys(game.private.playerData).length; i++) {

        if (game.private.playerData[Object.keys(game.private.playerData)[i]].personType === "personMafia" && game.private.playerData[Object.keys(game.private.playerData)[i]].alive) {
            count += 1;
        };
    };

    return count;
};

module.exports = {
    //processStartGame: processStartGame,
    processGameNightTime: processGameNightTime,
    processGameDayTime: processGameDayTime,
    processEndGame: processEndGame,
    setPersonTypes: setPersonTypes,
    checkIfNightTimeComplete: checkIfNightTimeComplete,
    getAliveMafia: getAliveMafia,
    checkIfDayTimeComplete: checkIfDayTimeComplete
};