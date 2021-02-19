/*
    Imported module(s)
*/

/*
    Clients object
*/
const clients = {};

/*
    Function to add client to clients hash map
*/
const addClient = (clientId, connection, clientSecret, clientName) => {

    clients[clientId] = {
        connection: connection,
        clientName: clientName,
        clientSecret: clientSecret,
        gameId: null
    };
};

/*
    Function to send message to client
*/

/*
    Function to add game id to a client object
*/
const addClientGameId = (clientId, gameId) => {

    if (!clients[clientId]) { return };
    clients[clientId].gameId = gameId;
};

/*
    Function to remove client from clients hash map
*/
const removeClient = (clientId) => {

    if (!clients[clientId]) { return };
    delete clients[clientId];
};

/*
    Exported module(s)
*/
module.exports = {
    clients: clients,
    addClient: addClient,
    addClientGameId: addClientGameId,
    removeClient: removeClient
}