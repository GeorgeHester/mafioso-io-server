/*
    Module import(s)
*/
const gamesHandler = require('../games-handler');
const gameDefaults = require('../game-defaults');

/*
    Function thats gives every player a random person type
*/
const setPersonTypes = (gameId) => {

    console.log(`[ Game Handler ][ Processing ][ Person Types ][ Game Id: ${gameId} ]`);

    // Get game object from hashmap and clear the timer on the game
    let game = gamesHandler.games[gameId];

    // Get number of players an the corresponding random object
    let playerCount = Object.keys(game.private.playerData).length;
    let personTypes = gameDefaults.personTypeRatios[playerCount];

    // Loop through all person types
    for (let i = 0; i < Object.keys(personTypes).length; i++) {

        // Get number of the person type required 
        let personType = Object.keys(personTypes)[i];

        // Loop through number of the person type required 
        for (let j = 0; j < personTypes[personType]; j++) {

            // Loop till a valid random player is picked to have the type
            let playerSet = false;

            while (!playerSet) {

                // Get random player
                let randomPlayer = Object.keys(game.private.playerData)[Math.floor((Math.random() * playerCount))];

                // Check if they already have a person type assigned
                if (game.private.playerData[randomPlayer].personType === "personUnknown") {

                    // Set player type and exit loop
                    game.private.playerData[randomPlayer].personType = personType;
                    playerSet = true;
                };
            };
        };
    };
};

/*
    Module export(s)
*/
module.exports = {
    setPersonTypes: setPersonTypes
};