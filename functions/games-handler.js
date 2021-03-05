/*
    Imported module(s)
*/
const clientsHandler = require('./clients-handler');

/*
    Games object
*/
const games = {};

/*
    Function to add game to games hash map
*/
const addGame = (gameId, game) => {

    games[gameId] = game;
};

/*
    Function to add client to game object 
*/
const addClient = (gameId, clientId) => {

    if (games[gameId] && clientsHandler.clients[clientId]) {

        if (games[gameId].private.cachePlayerData[clientId]) {

            games[gameId].private.playerData[clientId] = games[gameId].private.cachePlayerData[clientId];
            games[gameId].private.playerData[clientId].client

        } else if (!games[gameId].private.playerData[clientId]) {

            games[gameId].private.playerData[clientId] = {
                "clientName": clientsHandler.clients[clientId].clientName,
                "personType": "personUnknown",
                "alive": true
            };
        };
    };
};

/*
    Function to remove client from game object
*/
const removeClient = (gameId, clientId) => {

    if (games[gameId].private.playerData[clientId]) {

        delete games[gameId].private.playerData[clientId];

        if (games[gameId].public.hostId == clientId) {

            if (Object.keys(games[gameId].private.playerData).length > 0) {

                games[gameId].public.hostId = Object.keys(games[gameId].private.playerData)[0];
            } else {

                removeGame(gameId);
            };
        };
    };
};

/*
    Function to remove client from game object
*/
const cacheClient = (gameId, clientId) => {

    if (games[gameId].private.playerData[clientId]) {

        games[gameId].private.cachePlayerData[clientId] = games[gameId].private.playerData[clientId];
        delete games[gameId].private.playerData[clientId];

        if (games[gameId].public.hostId == clientId) {

            if (Object.keys(games[gameId].private.playerData).length > 0) {

                games[gameId].public.hostId = Object.keys(games[gameId].private.playerData)[0];
            } else {

                removeGame(gameId);
            };
        };
    };
};

/*
    Function to add client to game object
*/
const uncacheClient = (gameId, clientId) => {

    if (!games[gameId].private.cachePlayerData[clientId]) { return };

    games[gameId].private.playerData[clientId] = games[gameId].private.cachePlayerData[clientId];
    delete games[gameId].private.cachePlayerData[clientId];
};

/*
    Function to get game object
*/
const getGame = (gameId) => {

    if (!games[gameId]) { return };
    return games[gameId];
};

/*
    Function to update game object
*/
const updateGame = (gameId, game) => {

    if (!games[gameId]) { return };
    games[gameId] = game;
};

/*
    Function to remove game from games hash map
*/
const removeGame = (gameId) => {

    if (!games[gameId]) { return };
    delete games[gameId];
};

/*
    Exported module(s)
*/
module.exports = {
    games: games,
    addGame: addGame,
    addClient: addClient,
    removeGame: removeGame,
    removeClient: removeClient,
    cacheClient: cacheClient,
    uncacheClient: uncacheClient,
    getGame: getGame,
    updateGame: updateGame
};