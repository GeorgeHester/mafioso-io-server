/*
    Imported module(s)
*/
const clientsHandler = require("./clients-handler");
const gamesHandler = require("./games-handler");

/*
    Connections object
*/
const connections = {};

/*
    Function to add connection to connections hash map
*/
const addConnection = (connectionAddress, clientId) => {

    connections[connectionAddress] = clientId;
};

/*
    Function to remove connection from connections hash map
*/
const removeConnection = (connectionAddress) => {

    if (connections[connectionAddress]) {

        let clientId = connections[connectionAddress];

        if (clientsHandler.clients[clientId]) {

            if (clientsHandler.clients[clientId].gameId != null) {

                let gameId = clientsHandler.clients[clientId].gameId;

                if (gamesHandler.games[gameId].private.status == 'preGame' || gamesHandler.games[gameId].private.status == 'postGame') {

                    gamesHandler.removeClient(gameId, clientId);
                } else {

                    gamesHandler.cacheClient(gameId, clientId);
                };
            };

            clientsHandler.removeClient(connections[connectionAddress]);
        };

        delete connections[connectionAddress];
    };
};

/*
    Exported module(s)
*/
module.exports = {
    connections: connections,
    addConnection: addConnection,
    removeConnection: removeConnection
}