/*
    Imported module(s)
*/
const clientChecker = require('./client-checker');
const clientsHandler = require('./clients-handler');
const gamesHandler = require('./games-handler');

/*
    Verify connect client request is valid.
*/
const checkConnectClientRequest = (message) => {
    /*
        Checks:
            - Required parameters for request are present.
    */
    if (!message.clientName) { return false };
    return true;
};

/*
    Verify reconnect client request is valid.
*/
const checkReconnectClientRequest = (message) => {
    /*
        Checks:
            - Required parameters for request are present.
    */
    if (!message.clientId || !message.clientName) { return false };
    return true;
};

/*
    Verify create game request is valid.
*/
const checkCreateGameRequest = (message) => {
    /*
        Checks:
            - Required parameters for request are present.
            - The client exists.
            - The client has auth.
    */
    if (!message.clientId || !message.clientSecret) { return false };
    if (!clientsHandler.clients[message.clientId]) { return false };
    if (clientsHandler.clients[message.clientId].clientSecret != message.clientSecret) { return false };
    return true;
};

/*
    Verify update client name request is valid.
*/
const checkUpdateClientNameRequest = (message) => {
    /*
        Checks:
            - Required parameters for request are present.
            - The client exists.
            - The client has auth.
    */
    if (!message.clientId || !message.clientSecret || !message.clientName) { return false };
    if (!clientsHandler.clients[message.clientId]) { return false };
    if (clientsHandler.clients[message.clientId].clientSecret != message.clientSecret) { return false };
    return true;
};

/*
    Verify join game request is valid.
*/
const checkJoinGameRequest = (message) => {
    /*
        Checks:
            - Required parameters for request are present.
            - The game and client exist.
            - The client has auth.
            - The game status is correct.
            - The game is not full.
            - The client isn't already in the game.
    */
    if (!message.clientId || !message.clientSecret || !message.gameId) { return false };
    if (!gamesHandler.games[message.gameId] || !clientsHandler.clients[message.clientId]) { return false };
    if (clientsHandler.clients[message.clientId].clientSecret != message.clientSecret) { return false };
    if (gamesHandler.games[message.gameId].public.status != "preGame") { return false };
    if (Object.keys(gamesHandler.games[message.gameId].private.playerData).length > 9) { return false };
    if (clientChecker.checkObjectForClientId(gamesHandler.games[message.gameId].private.playerData, message.clientId) && gamesHandler.games[message.gameId].public.hostId != message.clientId) { return false };
    return true;
};

/*
    Verify start game request is valid.
*/
const checkStartGameRequest = (message) => {
    /*
        Checks:
            - Required parameters for request are present.
            - The game and client exist.
            - The client has auth.
            - The client is the game host.
            - The game status is correct.
            - There are enough players in the game.
    */
    if (!message.clientId || !message.clientSecret || !message.gameId) { return false };
    if (!gamesHandler.games[message.gameId] || !clientsHandler.clients[message.clientId]) { return false };
    if (clientsHandler.clients[message.clientId].clientSecret != message.clientSecret) { return false };
    if (gamesHandler.games[message.gameId].public.hostId != message.clientId) { return false };
    if (gamesHandler.games[message.gameId].public.status != "preGame") { return false };
    //if (Object.keys(gamesHandler.games[message.gameId].private.playerData).length < 5) { return false };
    return true;
};

/*
    Verify vote target player request is valid.
*/
const checkVoteTargetPlayerRequest = (message) => {
    /*
        Checks:
            - Required parameters for request are present.
            - The games and clients exist.
            - The clients exist in the game.
            - The client has auth.
            - The game status is correct.
            - The client is the right person type.
            - The chosen client is the right person type. 
    */
    if (!message.clientId || !message.clientSecret || !message.gameId || !message.chosenClientId) { return false };
    if (!gamesHandler.games[message.gameId] || !clientsHandler.clients[message.clientId] || !clientsHandler.clients[message.chosenClientId]) { return false };
    if (!gamesHandler.games[message.gameId].private.playerData[message.clientId] || !gamesHandler.games[message.gameId].private.playerData[message.chosenClientId]) { return false };
    if (clientsHandler.clients[message.clientId].clientSecret != message.clientSecret) { return false };
    if (gamesHandler.games[message.gameId].public.status != "inGameNightTime") { return false };
    if (gamesHandler.games[message.gameId].private.playerData[message.clientId].personType != "personMafia") { return false };
    if (gamesHandler.games[message.gameId].private.playerData[message.chosenClientId].personType == "personMafia") { return false };
    return true;
};

/*
    Verify confirm target player request is valid.
*/
const checkConfirmTargetPlayerRequest = (message) => {
    /*
        Checks:
            - Required parameters for request are present.
            - The games and clients exist.
            - The clients exist in the game.
            - The client has auth.
            - The game status is correct.
            - The client is the right person type.
            - The chosen client is the right person type. 
            - The client hasn't already voted.
    */
    if (!message.clientId || !message.clientSecret || !message.gameId || !message.chosenClientId) { return false };
    if (!gamesHandler.games[message.gameId] || !clientsHandler.clients[message.clientId] || !clientsHandler.clients[message.chosenClientId]) { return false };
    if (!gamesHandler.games[message.gameId].private.playerData[message.clientId] || !gamesHandler.games[message.gameId].private.playerData[message.chosenClientId]) { return false };
    if (clientsHandler.clients[message.clientId].clientSecret != message.clientSecret) { return false };
    if (gamesHandler.games[message.gameId].public.status != "inGameNightTime") { return false };
    if (gamesHandler.games[message.gameId].private.playerData[message.clientId].personType != "personMafia") { return false };
    if (gamesHandler.games[message.gameId].private.playerData[message.chosenClientId].personType == "personMafia") { return false };
    if (gamesHandler.games[message.gameId].private.clientsVotedTarget.includes(message.clientId)) { return false };
    return true;
};

/*
    Verify confirm immunise player request is valid.
*/
const checkConfirmImmunisePlayerRequest = (message) => {
    /*
        Checks:
            - Required parameters for request are present.
            - The games and clients exist.
            - The clients exist in the game.
            - The client has auth.
            - The game status is correct.
            - The client is the right person type.
            - The client hasn't already voted.
    */
    if (!message.clientId || !message.clientSecret || !message.gameId || !message.chosenClientId) { return false };
    if (!gamesHandler.games[message.gameId] || !clientsHandler.clients[message.clientId] || !clientsHandler.clients[message.chosenClientId]) { return false };
    if (!gamesHandler.games[message.gameId].private.playerData[message.clientId] || !gamesHandler.games[message.gameId].private.playerData[message.chosenClientId]) { return false };
    if (clientsHandler.clients[message.clientId].clientSecret != message.clientSecret) { return false };
    if (gamesHandler.games[message.gameId].public.status != "inGameNightTime") { return false };
    if (gamesHandler.games[message.gameId].private.playerData[message.clientId].personType != "personDoctor") { return false };
    if (gamesHandler.games[message.gameId].private.immunisedPlayer != null) { return false };
    return true;
};

/*
    Verify confirm reveal player request is valid.
*/
const checkConfirmRevealPlayerRequest = (message) => {
    /*
        Checks:
            - Required parameters for request are present.
            - The games and clients exist.
            - The clients exist in the game.
            - The client has auth.
            - The game status is correct.
            - The client is the right person type.
            - The chisen client hasn't already been revealed.
            - The client hasn't voted for themselves.
            - The client hasn't already voted.
    */
    if (!message.clientId || !message.clientSecret || !message.gameId || !message.chosenClientId) { return false };
    if (!gamesHandler.games[message.gameId] || !clientsHandler.clients[message.clientId] || !clientsHandler.clients[message.chosenClientId]) { return false };
    if (!gamesHandler.games[message.gameId].private.playerData[message.clientId] || !gamesHandler.games[message.gameId].private.playerData[message.chosenClientId]) { return false };
    if (clientsHandler.clients[message.clientId].clientSecret != message.clientSecret) { return false };
    if (gamesHandler.games[message.gameId].public.status != "inGameNightTime") { return false };
    if (gamesHandler.games[message.gameId].private.playerData[message.clientId].personType != "personDetective") { return false };
    if (gamesHandler.games[message.gameId].private.revealedPlayerTypes.includes(message.chosenClientId)) { return false };
    if (message.clientId === message.chosenClientId) { return false };
    if (gamesHandler.games[message.gameId].private.revealedPlayer != null) { return false };
    return true;
};

/*
    Verify confirm target player request is valid.
*/
const checkConfirmKillPlayerRequest = (message) => {
    /*
        Checks:
            - Required parameters for request are present.
            - The games and clients exist.
            - The clients exist in the game.
            - The client has auth.
            - The game status is correct.
            - The client is the right person type.
            - The chosen client is the right person type. 
            - The client hasn't already voted.
    */
    if (!message.clientId || !message.clientSecret || !message.gameId || !message.chosenClientId) { return { error: "Not all parameters are present" } };
    if (!gamesHandler.games[message.gameId] || !clientsHandler.clients[message.clientId] || !clientsHandler.clients[message.chosenClientId]) { return { error: "Game or clients don't exist" } };
    if (!gamesHandler.games[message.gameId].private.playerData[message.clientId] || !gamesHandler.games[message.gameId].private.playerData[message.chosenClientId]) { return { error: "Clients don't exist in the game" } };
    if (clientsHandler.clients[message.clientId].clientSecret != message.clientSecret) { return { error: "You do not have auth to make this request" } };
    if (gamesHandler.games[message.gameId].public.status != "inGameDayTime") { return { error: "The games current state isn't correct" } };
    if (gamesHandler.games[message.gameId].private.clientsVotedKill.includes(message.clientId)) { return { error: "You have already voted" } };
    return {error: false};
};

/*
    Verify confirm send message request is valid.
*/
const checkSendMessageRequest = (message) => {
    /*
        Checks:
            - Required parameters for request are present.
            - The game and client exist.
            - The client exist in the game.
            - The client has auth.
            - The game status is correct.
    */
    if (!message.clientId || !message.clientSecret || !message.gameId || !message.message) { return false };
    if (!gamesHandler.games[message.gameId] || !clientsHandler.clients[message.clientId]) { return false };
    if (!gamesHandler.games[message.gameId].private.playerData[message.clientId]) { return false };
    if (clientsHandler.clients[message.clientId].clientSecret != message.clientSecret) { return false };
    if (gamesHandler.games[message.gameId].public.status != "inGameDayTime") { return false };
    return true;
};

/*
    Exported module(s)
*/
module.exports = {
    checkVoteTargetPlayerRequest: checkVoteTargetPlayerRequest,
    checkCreateGameRequest: checkCreateGameRequest,
    checkJoinGameRequest: checkJoinGameRequest,
    checkStartGameRequest: checkStartGameRequest,
    checkConfirmTargetPlayerRequest: checkConfirmTargetPlayerRequest,
    checkConfirmImmunisePlayerRequest: checkConfirmImmunisePlayerRequest,
    checkConfirmRevealPlayerRequest: checkConfirmRevealPlayerRequest,
    checkConnectClientRequest: checkConnectClientRequest,
    checkSendMessageRequest: checkSendMessageRequest,
    checkReconnectClientRequest: checkReconnectClientRequest,
    checkConfirmKillPlayerRequest: checkConfirmKillPlayerRequest,
    checkUpdateClientNameRequest: checkUpdateClientNameRequest
};