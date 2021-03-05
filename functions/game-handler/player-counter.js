/*
    Module import(s)
*/
const gamesHandler = require('../games-handler');

/*
    Function that gets the total number of certain person type
*/
const getNumberOfPersonType = (gameId, personType, alive) => {

    // Get game object from hash map of games
    let game = gamesHandler.games[gameId];

    // Set default value
    let count = 0;

    // Loop through all players in the game
    for (let i = 0; i < Object.keys(game.private.playerData).length; i++) {

        // Checks if player has the correct person type
        if (game.private.playerData[Object.keys(game.private.playerData)[i]].personType == personType) {
            if (alive) {
                if (game.private.playerData[Object.keys(game.private.playerData)[i]].alive) {
                    count += 1;
                };
            } else {
                count += 1;
            };
        };
    };

    return count;
};

/*
    Module export(s)
*/
module.exports = {
    getNumberOfPersonType: getNumberOfPersonType
};