/*
    Module import(s)
*/
const gamesHandler = require('../games-handler');
const playerCounter = require('./player-counter');

/*
    Function to check if the requirments for game end have been met
*/
const isGameComplete = (gameId) => {

    // Get the game object from the hashmap of games
    let game = gamesHandler.games[gameId];

    if (playerCounter.getNumberOfPersonType(gameId, 'personMafia', true) == 0) {

        return {
            gameComplete: true,
            draw: false,
            mafiaWin: false,
            messageLoser: "You and your allies were voted out. You lose.",
            messageWinner: "You managed to find all the mafia. You win."
        };
    } else if (Math.ceil(Object.keys(game.private.playerData).length / 2) <= playerCounter.getNumberOfPersonType(gameId, 'personMafia', true)) {

        let finalPersonDoctor = false;

        for (let i = 0; i < Object.keys(game.private.playerData).length; i++) {

            if (game.private.playerData[Object.keys(game.private.playerData)[i]].personType === "personDoctor") {

                finalPersonDoctor = true;
            };
        };

        if (finalPersonDoctor) {

            return {
                gameComplete: true,
                draw: true,
                messageAll: "Both the doctor and mafia managed to survive. Draw."
            };
        } else {

            return {
                gameComplete: true,
                draw: false,
                mafiaWin: true,
                messageLoser: "The mafia managed to stay under the radar. You lose.",
                messageWinner: "You managed to keep low and kill all the villagers. You win."
            };
        };
    } else {

        return {
            gameComplete: false
        };
    };
};

/*
    Module export(s)
*/
module.exports = {
    isGameComplete: isGameComplete
};