/*
    Module import(s)
*/
const gameBoardcaster = require('../game-broadcaster');
const gamesHandler = require('../games-handler');
const clientsHandler = require('../clients-handler');

/*
    Function to process end data
*/
const processGameEnd = (gameId, gameComplete) => {

    console.log(`[ Game Handler ][ Processing ][ Game End ][ Game Id: ${gameId} ]`);

    // Get game object from hash map of games
    let game = gamesHandler.games[gameId];

    //Loop through all players and send relevant message
    for (let i = 0; i < Object.keys(game.private.playerData).length; i++) {

        let clientId = Object.keys(game.private.playerData)[i];

        if (gameComplete.draw) {

            clientsHandler.clients[clientId].connection.send(JSON.stringify({
                "method": "fullScreenMessage",
                "message": gameComplete.messageAll,
                "messageType": "success",
                "messagePersistent": true
            }));

            continue;
        };

        if (game.private.playerData[clientId].personType === 'personMafia') {

            if (gameComplete.mafiaWin) {

                clientsHandler.clients[clientId].connection.send(JSON.stringify({
                    "method": "fullScreenMessage",
                    "message": gameComplete.messageWinner,
                    "messageType": "success",
                    "messagePersistent": true
                }));

                continue;
            } else {

                clientsHandler.clients[clientId].connection.send(JSON.stringify({
                    "method": "fullScreenMessage",
                    "message": gameComplete.messageLoser,
                    "messageType": "fail",
                    "messagePersistent": true
                }));

                continue;
            };
        } else {

            if (gameComplete.mafiaWin) {

                clientsHandler.clients[clientId].connection.send(JSON.stringify({
                    "method": "fullScreenMessage",
                    "message": gameComplete.messageLoser,
                    "messageType": "fail",
                    "messagePersistent": true
                }));

                continue;
            } else {

                clientsHandler.clients[clientId].connection.send(JSON.stringify({
                    "method": "fullScreenMessage",
                    "message": gameComplete.messageWinner,
                    "messageType": "success",
                    "messagePersistent": true
                }));

                continue;
            };
        };
    };

    // Update game status
    game.public.status = "postGame";

    // Broadcast game data to all clients
    gameBoardcaster.broadcastGameData(gameId);

    // Delete game
};

/*
    Module export(s)
*/
module.exports = {
    processGameEnd: processGameEnd
};