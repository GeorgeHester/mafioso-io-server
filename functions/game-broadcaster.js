/*
    Imported module(s)
*/
const arrayHandler = require('./array-handler');
const clientsHandler = require('./clients-handler');
const gamesHandler = require('../functions/games-handler');

const broadcastGameData = (gameId) => {

    let game = gamesHandler.games[gameId];

    if (game.public.status === "preGame") {

        for (let i = 0; i < Object.keys(game.private.playerData).length; i++) {

            let gamePublicTemp = game.public;
            gamePublicTemp.playerData = {};

            let gameClientId = Object.keys(game.private.playerData)[i];

            for (let j = 0; j < Object.keys(game.private.playerData).length; j++) {

                let loopGameClientId = Object.keys(game.private.playerData)[j];

                if (gameClientId === loopGameClientId) {

                    gamePublicTemp.playerData[loopGameClientId] = {
                        "clientName": "You",
                        "personType": "personUnknown",
                        "alive": game.private.playerData[loopGameClientId].alive
                    };
                } else {

                    gamePublicTemp.playerData[loopGameClientId] = {
                        "clientName": game.private.playerData[loopGameClientId].clientName,
                        "personType": "personUnknown",
                        "alive": game.private.playerData[loopGameClientId].alive
                    };
                };
            };

            clientsHandler.clients[gameClientId].connection.send(JSON.stringify({
                "method": "gameUpdated",
                "game": {
                    "public": gamePublicTemp
                }
            }));
        };
    } else if (game.public.status === "postGame") {

        for (let i = 0; i < Object.keys(game.private.playerData).length; i++) {

            let gamePublicTemp = game.public;
            gamePublicTemp.playerData = {};

            let gameClientId = Object.keys(game.private.playerData)[i];

            for (let j = 0; j < Object.keys(game.private.playerData).length; j++) {

                let loopGameClientId = Object.keys(game.private.playerData)[j];

                if (gameClientId === loopGameClientId) {

                    gamePublicTemp.playerData[loopGameClientId] = {
                        "clientName": "You",
                        "personType": game.private.playerData[loopGameClientId].personType,
                        "alive": game.private.playerData[loopGameClientId].alive
                    };
                } else {

                    gamePublicTemp.playerData[loopGameClientId] = {
                        "clientName": game.private.playerData[loopGameClientId].clientName,
                        "personType": game.private.playerData[loopGameClientId].personType,
                        "alive": game.private.playerData[loopGameClientId].alive
                    };
                };
            };

            clientsHandler.clients[gameClientId].connection.send(JSON.stringify({
                "method": "gameUpdated",
                "game": {
                    "public": gamePublicTemp
                }
            }));
        };
    } else if (game.public.status === "inGameNightTime" || game.public.status === "inGameDayTime") {

        for (let i = 0; i < Object.keys(game.private.playerData).length; i++) {

            let gamePublicTemp = game.public;
            gamePublicTemp.playerData = {};

            let gameClientId = Object.keys(game.private.playerData)[i];
            let gameClientPersonType = game.private.playerData[gameClientId].personType;

            for (let j = 0; j < Object.keys(game.private.playerData).length; j++) {

                let loopGameClientId = Object.keys(game.private.playerData)[j];

                if (gameClientId === loopGameClientId) {

                    gamePublicTemp.playerData[loopGameClientId] = {
                        "clientName": "You",
                        "personType": game.private.playerData[loopGameClientId].personType,
                        "alive": game.private.playerData[loopGameClientId].alive
                    };
                } else if (gameClientPersonType === "personDetective") {

                    if (game.private.revealedPlayerTypes.includes(loopGameClientId)) {

                        gamePublicTemp.playerData[loopGameClientId] = {
                            "clientName": game.private.playerData[loopGameClientId].clientName,
                            "personType": game.private.playerData[loopGameClientId].personType,
                            "alive": game.private.playerData[loopGameClientId].alive
                        };
                    } else {

                        gamePublicTemp.playerData[loopGameClientId] = {
                            "clientName": game.private.playerData[loopGameClientId].clientName,
                            "personType": "personUnknown",
                            "alive": game.private.playerData[loopGameClientId].alive
                        };
                    };
                } else if (gameClientPersonType === "personMafia") {

                    if (game.private.playerData[loopGameClientId].personType === "personMafia") {

                        gamePublicTemp.playerData[loopGameClientId] = {
                            "clientName": game.private.playerData[loopGameClientId].clientName,
                            "personType": "personMafia",
                            "alive": game.private.playerData[loopGameClientId].alive
                        };
                    } else {

                        gamePublicTemp.playerData[loopGameClientId] = {
                            "clientName": game.private.playerData[loopGameClientId].clientName,
                            "personType": "personUnknown",
                            "alive": game.private.playerData[loopGameClientId].alive
                        };
                    };
                } else {

                    gamePublicTemp.playerData[loopGameClientId] = {
                        "clientName": game.private.playerData[loopGameClientId].clientName,
                        "personType": "personUnknown",
                        "alive": game.private.playerData[loopGameClientId].alive
                    };
                };
            };

            clientsHandler.clients[gameClientId].connection.send(JSON.stringify({
                "method": "gameUpdated",
                "game": {
                    "public": gamePublicTemp
                }
            }));
        };
    };
};

const broadcastGameDataMafiaVotes = (gameId) => {

    let game = gamesHandler.games[gameId];

    if (game.public.status != "inGameNightTime") { return };

    for (let i = 0; i < Object.keys(game.private.playerData).length; i++) {

        let gameClientId = Object.keys(game.private.playerData)[i];
        let gameClientPersonType = game.private.playerData[gameClientId].personType;

        if (gameClientPersonType === "personMafia") {

            let gamePublicTemp = game.public;
            gamePublicTemp.playerData = {};

            for (let j = 0; j < Object.keys(game.private.playerData).length; j++) {

                let loopGameClientId = Object.keys(game.private.playerData)[j];

                if (gameClientId === loopGameClientId) {

                    gamePublicTemp.playerData[loopGameClientId] = {
                        "clientName": "You",
                        "personType": "personMafia",
                        "alive": game.private.playerData[loopGameClientId].alive
                    };
                } else {

                    if (game.private.playerData[loopGameClientId].personType === "personMafia") {

                        gamePublicTemp.playerData[loopGameClientId] = {
                            "clientName": game.private.playerData[loopGameClientId].clientName,
                            "personType": "personMafia",
                            "alive": game.private.playerData[loopGameClientId].alive
                        };
                    } else {

                        gamePublicTemp.playerData[loopGameClientId] = {
                            "clientName": game.private.playerData[loopGameClientId].clientName,
                            "personType": "personUnknown",
                            "alive": game.private.playerData[loopGameClientId].alive,
                            "votes": arrayHandler.getOccurrences(game.private.temporaryTargetedPlayerVotes, loopGameClientId)
                        };
                    };
                };
            };

            clientsHandler.clients[gameClientId].connection.send(JSON.stringify({
                "method": "gameUpdated",
                "game": {
                    "public": gamePublicTemp
                }
            }));

        };
    };
};

const broadcastMessage = (gameId, message) => {

    let game = gamesHandler.games[gameId];

    for (let i = 0; i < Object.keys(game.private.playerData).length; i++) {

        clientsHandler.clients[Object.keys(game.private.playerData)[i]].connection.send(JSON.stringify({
            "method": "gameMessage",
            "message": message
        }));
    };
};

const broadcastFullScreenMessage = (gameId, messageType, message, messagePersistent, messageTimeout) => {

    let game = gamesHandler.games[gameId];

    for (let i = 0; i < Object.keys(game.private.playerData).length; i++) {

        clientsHandler.clients[Object.keys(game.private.playerData)[i]].connection.send(JSON.stringify({
            "method": "fullScreenMessage",
            "message": message,
            "messageType": messageType,
            "messagePersistent": messagePersistent,
            "messageTimeout": messageTimeout
        }));
    };
};

const broadcastFullScreenMessageEndOfNightTime = (gameId, playerKilled, playerKilledId) => {

    let game = gamesHandler.games[gameId];

    let successMessage = `No one was killed in the night.`;
    let failMessage = `No one was killed in the night.`;
    let defaultMessage = `No one was killed in the night.`;

    let successMessageType = `default`;
    let failMessageType = `default`;
    let defaultMessageType = `default`;

    if (playerKilled) {

        successMessage = `You managed to kill ${game.private.playerData[playerKilledId].clientName}.`;
        failMessage = `You were killed.`;
        defaultMessage = `${game.private.playerData[playerKilledId].clientName} was killed in the dead of night by the mafia.`;

        successMessageType = `success`;
        failMessageType = `fail`;
        defaultMessageType = `default`;
    };

    for (let i = 0; i < Object.keys(game.private.playerData).length; i++) {

        let message = "";
        let messageType = "";

        if (Object.keys(game.private.playerData)[i] == playerKilledId) {
            message = failMessage;
            messageType = failMessageType;
        } else if (game.private.playerData[Object.keys(game.private.playerData)[i]].personType == "personMafia") {
            message = successMessage;
            messageType = successMessageType;
        } else {
            message = defaultMessage;
            messageType = defaultMessageType;
        };

        clientsHandler.clients[Object.keys(game.private.playerData)[i]].connection.send(JSON.stringify({
            "method": "fullScreenMessage",
            "message": message,
            "messageType": messageType
        }));
    };
};

const broadcastFullScreenMessageEndOfDayTime = (gameId, playerKilled, playerKilledId) => {

    let game = gamesHandler.games[gameId];

    let successMessage = `No one was voted out.`;
    let failMessage = `No one was voted out.`;
    let defaultMessage = `No one was voted out.`;

    let successMessageType = `default`;
    let failMessageType = `default`;
    let defaultMessageType = `default`;

    if (playerKilled) {

        successMessage = `${game.private.playerData[playerKilledId].clientName} was voted out.`;
        failMessage = `You were voted out.`;
        defaultMessage = `${game.private.playerData[playerKilledId].clientName} was voted out.`;

        successMessageType = `success`;
        failMessageType = `fail`;
        defaultMessageType = `default`;
    };

    for (let i = 0; i < Object.keys(game.private.playerData).length; i++) {

        let message = "";
        let messageType = "";

        if (Object.keys(game.private.playerData)[i] == playerKilledId) {
            message = failMessage;
            messageType = failMessageType;
        } else if (game.private.playerData[Object.keys(game.private.playerData)[i]].personType == "personMafia") {
            message = successMessage;
            messageType = successMessageType;
        } else {
            message = defaultMessage;
            messageType = defaultMessageType;
        };

        clientsHandler.clients[Object.keys(game.private.playerData)[i]].connection.send(JSON.stringify({
            "method": "fullScreenMessage",
            "message": message,
            "messageType": messageType
        }));
    };
};

const broadcastCountdown = (gameId, countdownTime, countdownMessageType) => {

    let game = gamesHandler.games[gameId];

    for (let i = 0; i < Object.keys(game.private.playerData).length; i++) {

        let countdownMessage = "";

        switch (countdownMessageType) {
            case "inGameNightTime":
                switch (game.private.playerData[Object.keys(game.private.playerData)[i]].personType) {
                    case "personVillager":
                        countdownMessage = "Wait for other players.";
                        break;
                    case "personDoctor":
                        countdownMessage = "Select one person to immunise.";
                        break;
                    case "personDetective":
                        countdownMessage = "Select one person to reveal.";
                        break;
                    case "personMafia":
                        countdownMessage = "Select one person to kill.";
                        break;
                };
                break;
            case "inGameDayTime":
                countdownMessage = "Select a person to vote out."
                break;
        };

        clientsHandler.clients[Object.keys(game.private.playerData)[i]].connection.send(JSON.stringify({
            "method": "countdownUpdated",
            "countdownTime": countdownTime,
            "countdownMessage": countdownMessage
        }));
    };
};

/*
    Exported module(s)
*/
module.exports = {
    broadcastGameData: broadcastGameData,
    broadcastGameDataMafiaVotes: broadcastGameDataMafiaVotes,
    broadcastCountdown: broadcastCountdown,
    broadcastMessage: broadcastMessage,
    broadcastFullScreenMessage: broadcastFullScreenMessage,
    broadcastFullScreenMessageEndOfNightTime: broadcastFullScreenMessageEndOfNightTime,
    broadcastFullScreenMessageEndOfDayTime: broadcastFullScreenMessageEndOfDayTime
};