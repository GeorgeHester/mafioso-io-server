/*
    Imported module(s)
*/
const { v4: uuidv4 } = require('uuid');

/*
    Function to generate new game data
*/
const generateNewGame = (clientId) => {

    // Generates new game object
    // Return game data
    return {
        "public": {
            "id": uuidv4(),
            "status": "preGame",
            "hostId": clientId
        },
        "private": {
            // Base game data
            "playerData": {},
            "cachePlayerData": {},
            "hostId": clientId,
            "gameTimeout": null,
            // Game data for detective
            "revealedPlayerTypes": [],
            "revealedPlayer": null,
            // Game data for mafia
            "oldTemporaryTargetedPlayerVote": {},
            "temporaryTargetedPlayerVotes": [],
            "targetedPlayerVotes": [],
            "clientsVotedTarget": [],
            // Game data for all
            "killedPlayerVotes": [],
            "clientsVotedKill": [],
            // Game data for doctor 
            "immunisedPlayer": null
        }
    };
};

/*
    Module export(s)
*/
module.exports = {
    generateNewGame: generateNewGame
};