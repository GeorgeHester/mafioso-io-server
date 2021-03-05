/*
    Server defaults
*/
const serverPort = 8080;

/*
    Imported module(s)
*/
const http = require('http');
const webSocketServer = require('websocket').server;
const httpServer = http.createServer();

/*
    Imported Handler(s)
*/
const personTypeProcessor = require('./functions/game-handler/process-person-type');
const gameNightProcessor = require('./functions/game-handler/process-game-night');
const gameNightChecker = require('./functions/game-handler/checker-night-complete');
const gameDayChecker = require('./functions/game-handler/checker-day-complete');
const gamesHandler = require('./functions/games-handler');
const clientsHandler = require('./functions/clients-handler');
const connectionsHandler = require('./functions/connections-handler');
const gameDefaults = require('./functions/game-defaults');

/*
    Imported Generator(s)
*/
const clientGenerator = require('./functions/client-generator');
const gameGenerator = require('./functions/game-generator');

/*
    Imported Broadcaster(s)
*/
const gameBoardcaster = require('./functions/game-broadcaster');

/*
    Imported validator(s)
*/
const requestValidator = require('./functions/validate-handler');

/*
    Open http server on default port
*/
httpServer.listen(serverPort, () => {
    console.log(`[ Http Server ][ Listening ][ Port: ${serverPort} ]`)
});

/*
    Create a web socket on the http server
*/
const wsServer = new webSocketServer({
    "httpServer": httpServer
});

/*
    Event for when web socket recieves a request
*/
wsServer.on('request', (request) => {

    /*
        Get the connection from the request sent to the web socket
    */
    const connection = request.accept(null, request.origin);

    /*
        Open event
        UNUSED
    */
    /*connection.on('open', () => {

        console.log('[ Open ]');
        //console.log(`[ Socket Open ][ Address: ${connection.socket.remoteAddress}:${connection.socket.remotePort} ]`);
        console.log(connection.socket.localAddress);
        console.log(connection.socket.localPort);
    });*/

    /*
        Socket closeure event
    */
    connection.on('close', (event) => {

        console.log(`[ Client Disconnected ][ ${connection.socket.remoteAddress}:${connection.socket.remotePort} ]`);

        // Remove connection from connections hashmap
        let connectionAddress = `${connection.socket.remoteAddress}:${connection.socket.remotePort}`;
        //connectionsHandler.removeConnection(connectionAddress);
    });

    /*
        Socket message event
    */
    connection.on('message', (message) => {

        // Trys to parse message into json
        try {
            var jsonMessage = JSON.parse(message.utf8Data);
            console.log(`[ Web Socket ][ ${jsonMessage.method} ][ Ip: ${connection.socket.remoteAddress}:${connection.socket.remotePort} ]`);
        } catch (error) {
            console.error(`[ ERROR ][ Message ][ Not Json ]`);
            return;
        };

        /*console.log(`[ Message ]`);
        console.log(jsonMessage);*/

        //console.log(jsonMessage);

        /*
            Method for joining websocket
        */
        if (jsonMessage.method === 'connectClient') {

            // Check that the request is valid
            let valid = requestValidator.checkConnectClientRequest(jsonMessage);
            if (!valid) { return };

            // Generates new client data and stores in hashmap of clients
            let client = clientGenerator.generateNewClient(jsonMessage.clientName);
            clientsHandler.addClient(client.clientId, connection, client.clientSecret, client.clientName);

            // Generates new connection and stores in hashmap of connections
            let connectionAddress = `${connection.socket.remoteAddress}:${connection.socket.remotePort}`;
            connectionsHandler.addConnection(connectionAddress, client.clientId);

            // Send client data back to client
            connection.send(JSON.stringify({
                "method": "clientConnected",
                "clientId": client.clientId,
                "clientSecret": client.clientSecret,
            }));

            // Skip all other statements
            return;
        };

        /*
            Method for re joining websocket
        */
        if (jsonMessage.method === 'reconnectClient') {

            // Check that the request is valid
            let valid = requestValidator.checkReconnectClientRequest(jsonMessage);
            if (!valid) { return };

            let clientId = null;
            let clientSecret = null;

            if (clientsHandler.clients[jsonMessage.clientId]) {

                // Generates new client secret and stores in hashmap of clients
                let generatedClientSecret = clientGenerator.generateNewClientSecret();
                clientsHandler.addClient(jsonMessage.clientId, connection, generatedClientSecret, jsonMessage.clientName);

                clientId = jsonMessage.clientId;
                clientSecret = generatedClientSecret;
            } else {

                // Generates new client data and stores in hashmap of clients
                let client = clientGenerator.generateNewClient(jsonMessage.clientName);
                clientsHandler.addClient(client.clientId, connection, client.clientSecret, client.clientName);

                clientId = client.clientId;
                clientSecret = client.clientSecret;
            };

            // Generates new connection and stores in hashmap of connections
            let connectionAddress = `${connection.socket.remoteAddress}:${connection.socket.remotePort}`;
            connectionsHandler.addConnection(connectionAddress, clientId);

            // Send client data back to client
            connection.send(JSON.stringify({
                "method": "clientConnected",
                "clientId": clientId,
                "clientSecret": clientSecret,
            }));

            // Skip all other statements
            return;
        };

        /*
            Method for updating client name 
        */
        if (jsonMessage.method === 'updateClientName') {

            // Check that the request is valid
            let valid = requestValidator.checkUpdateClientNameRequest(jsonMessage);
            if (!valid) { return };

            // Update client name on clients
            clientsHandler.clients[jsonMessage.clientId].clientName = jsonMessage.clientName;

            // Skip all other statements
            return;
        };

        /*
            Method for creating a game
        */
        if (jsonMessage.method === 'createGame') {

            // Check that the request is valid
            let valid = requestValidator.checkCreateGameRequest(jsonMessage);
            if (!valid) {

                connection.send(JSON.stringify({
                    "method": "errorMessage",
                    "message": "Cannot create game.",
                    "messagePersistent": true
                }));

                return;
            };

            // Check the client isn't already in a game, if they are remove client from previous game
            if (clientsHandler.clients[jsonMessage.clientId].gameId != null) {
                gamesHandler.removeClient(clientsHandler.clients[jsonMessage.clientId].gameId, jsonMessage.clientId);
            };

            // Generates new game data and stores game in hashmap of games
            let game = gameGenerator.generateNewGame(jsonMessage.clientId);
            gamesHandler.addGame(game.public.id, game);

            // Stores game id in the client object
            clientsHandler.addClientGameId(jsonMessage.clientId, game.public.id);

            // Adds current client to game objcet
            gamesHandler.addClient(game.public.id, jsonMessage.clientId);

            // Send game data back to the client
            connection.send(JSON.stringify({
                "method": "gameCreated",
                "game": {
                    "public": game.public
                }
            }));

            // Skip all other statements
            return;
        };

        /*
            Method for joining a game
        */
        if (jsonMessage.method === 'joinGame') {

            // Check that the request is valid
            let valid = requestValidator.checkJoinGameRequest(jsonMessage);
            if (!valid) {

                connection.send(JSON.stringify({
                    "method": "errorMessage",
                    "message": "Cannot join or find game.",
                    "messagePersistent": true
                }));

                return;
            };

            if (jsonMessage.clientId != gamesHandler.games[jsonMessage.gameId].public.hostId) {

                // Check the client isn't already in a game, if they are remove client from previous game
                if (clientsHandler.clients[jsonMessage.clientId].gameId != null) {
                    gamesHandler.removeClient(clientsHandler.clients[jsonMessage.clientId].gameId, jsonMessage.clientId);
                };

                // Stores game id in the client object
                clientsHandler.addClientGameId(jsonMessage.clientId, jsonMessage.gameId);

                let game = gamesHandler.games[jsonMessage.gameId];

                if (game.private.cachePlayerData[jsonMessage.clientId]) {

                    // Unchaches client from game objcet
                    gamesHandler.uncacheClient(jsonMessage.gameId, jsonMessage.clientId);
                } else {

                    // Adds current client to game objcet
                    gamesHandler.addClient(jsonMessage.gameId, jsonMessage.clientId);
                }
            };

            // Broadcast game data to all clients
            gameBoardcaster.broadcastGameData(jsonMessage.gameId);

            // Skip all other statements
            return;
        };

        /*
            Method for stating a game
        */
        if (jsonMessage.method === 'startGame') {

            // Check that the request is valid
            let valid = requestValidator.checkStartGameRequest(jsonMessage);
            if (!valid) { return };

            // Update game object data
            personTypeProcessor.setPersonTypes(jsonMessage.gameId);
            gamesHandler.games[jsonMessage.gameId].public.status = "inGameNightTime";
            gamesHandler.games[jsonMessage.gameId].private.gameTimeout = setTimeout(gameNightProcessor.processGameNight, gameDefaults.gameTimings.nightLength, jsonMessage.gameId);

            // Broadcast game data to all clients
            gameBoardcaster.broadcastGameData(jsonMessage.gameId);
            gameBoardcaster.broadcastCountdown(jsonMessage.gameId, gameDefaults.gameTimings.nightLength, "inGameNightTime");
            gameBoardcaster.broadcastFullScreenMessage(jsonMessage.gameId, "default", "Game Started", false, gameDefaults.gameTimings.fullScreenMessageLength);

            // Skip all other statements
            return;
        };

        /*
            Handlers for night time events
        */

        /*
            Method for target voting
        */
        if (jsonMessage.method === 'voteTargetPlayer') {

            // Check that the request is valid
            let valid = requestValidator.checkVoteTargetPlayerRequest(jsonMessage);
            if (!valid) { return };

            // Add chosen client to targeted players
            if (gamesHandler.games[jsonMessage.gameId].private.oldTemporaryTargetedPlayerVote[jsonMessage.clientId]) {
                gamesHandler.games[jsonMessage.gameId].private.temporaryTargetedPlayerVotes.pop(gamesHandler.games[jsonMessage.gameId].private.oldTemporaryTargetedPlayerVote[jsonMessage.clientId]);
            };
            gamesHandler.games[jsonMessage.gameId].private.oldTemporaryTargetedPlayerVote[jsonMessage.clientId] = jsonMessage.chosenClientId;
            gamesHandler.games[jsonMessage.gameId].private.temporaryTargetedPlayerVotes.push(jsonMessage.chosenClientId);

            // Broadcast game data to mafia clients
            gameBoardcaster.broadcastGameDataMafiaVotes(jsonMessage.gameId);
        };

        /*
            Method for confirming target player
        */
        if (jsonMessage.method === 'confirmTargetPlayer') {

            // Check that the request is valid
            let valid = requestValidator.checkConfirmTargetPlayerRequest(jsonMessage);
            if (!valid) { return };

            // Add chosen client to targeted players and client to voted clients
            gamesHandler.games[jsonMessage.gameId].private.targetedPlayerVotes.push(jsonMessage.chosenClientId);
            gamesHandler.games[jsonMessage.gameId].private.clientsVotedTarget.push(jsonMessage.clientId);

            // Check if night time is complete
            gameNightChecker.isGameNightComplete(jsonMessage.gameId);
        };

        /*
            Method for confirming immunise player
        */
        if (jsonMessage.method === 'confirmImmunisePlayer') {

            // Check that the request is valid
            let valid = requestValidator.checkConfirmImmunisePlayerRequest(jsonMessage);
            if (!valid) { return };

            // Add chosen client to immunised player
            gamesHandler.games[jsonMessage.gameId].private.immunisedPlayer = jsonMessage.chosenClientId;

            // Check if night time is complete
            gameNightChecker.isGameNightComplete(jsonMessage.gameId);
        };

        /*
            Method for confirming reveal player
        */
        if (jsonMessage.method === 'confirmRevealPlayer') {

            // Check that the request is valid
            let valid = requestValidator.checkConfirmRevealPlayerRequest(jsonMessage);
            if (!valid) { return };

            // Add chosen client to reveled player
            gamesHandler.games[jsonMessage.gameId].private.revealedPlayer = jsonMessage.chosenClientId;

            // Check if night time is complete
            gameNightChecker.isGameNightComplete(jsonMessage.gameId);
        };

        /*
            Handlers for day time events
        */

        /*
            Method for voting off player
        */
        if (jsonMessage.method === 'confirmKillPlayer') {

            // Check that the request is valid
            let valid = requestValidator.checkConfirmKillPlayerRequest(jsonMessage);
            if (valid.error) {

                connection.send(JSON.stringify({
                    "method": "errorMessage",
                    "message": valid.error,
                    "messagePersistent": false
                }));

                return;
            };

            // Add chosen client to killed players and client to voted clients
            gamesHandler.games[jsonMessage.gameId].private.killedPlayerVotes.push(jsonMessage.chosenClientId);
            gamesHandler.games[jsonMessage.gameId].private.clientsVotedKill.push(jsonMessage.clientId);

            // Check if day time is complete
            gameDayChecker.isGameDayComplete(jsonMessage.gameId);
        };

        /*
            Method for sending game message
        */
        if (jsonMessage.method === 'sendMessage') {

            // Check that the request is valid
            let valid = requestValidator.checkConfirmRevealPlayerRequest(jsonMessage);
            if (!valid) { return };

            // Send new message to all clients
            for (let i = 0; i < Object.keys(games[jsonMessage.gameId].private.playerData).length; i++) {
                clients[Object.keys(games[jsonMessage.gameId].private.playerData)[i]].connection.send(JSON.stringify({
                    "method": "newMessage",
                    "messageData": {
                        "message": jsonMessage.message,
                        "clientId": jsonMessage.clientId,
                        "clientName": clients[Object.keys(games[jsonMessage.gameId].private.playerData)[i]].clientName
                    }
                }));
            };
        };
    });
});