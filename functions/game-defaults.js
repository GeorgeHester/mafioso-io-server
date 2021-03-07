/*
    Storage for all game personn type ratios
*/
const personTypeRatios = {
    1: {
        "personVillager": 1,
        "personMafia": 0,
        "personDoctor": 0,
        "personDetective": 0
    },
    2: {
        "personVillager": 1,
        "personMafia": 1,
        "personDoctor": 0,
        "personDetective": 0
    },
    4: {
        "personVillager": 1,
        "personMafia": 1,
        "personDoctor": 1,
        "personDetective": 1
    },
    5: {
        "personVillager": 2,
        "personMafia": 1,
        "personDoctor": 1,
        "personDetective": 1
    },
    6: {
        "personVillager": 3,
        "personMafia": 1,
        "personDoctor": 1,
        "personDetective": 1
    },
    7: {
        "personVillager": 3,
        "personMafia": 2,
        "personDoctor": 1,
        "personDetective": 1
    },
    8: {
        "personVillager": 4,
        "personMafia": 2,
        "personDoctor": 1,
        "personDetective": 1
    },
    9: {
        "personVillager": 4,
        "personMafia": 3,
        "personDoctor": 1,
        "personDetective": 1
    },
    10: {
        "personVillager": 5,
        "personMafia": 3,
        "personDoctor": 1,
        "personDetective": 1
    }
};

/*
    Storage for all game timeouts
*/
const gameTimings = {
    dayLength: 33000,
    nightLength: 33000,
    fullScreenMessageLength: 3000
};

/*
    Module export(s)
*/
module.exports = {
    personTypeRatios: personTypeRatios,
    gameTimings: gameTimings
};
