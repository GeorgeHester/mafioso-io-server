/*
    Imported module(s)
*/
const { v4: uuidv4 } = require('uuid');

/*
    Function to generate new client data
*/
const generateNewClient = (clientName) => {

    // Makes sure the client name fits into constraints
    if (clientName.length > 10) {
        clientName = clientName.substring(0, 10);
    };

    // Returns new random client data
    return {
        "clientId": uuidv4(),
        "clientSecret": generateNewClientSecret(),
        "clientName": clientName
    };
};

/*
    Function to generate new client secret
*/
const generateNewClientSecret = () => {

    return uuidv4();
};

/*
    Exported module(s)
*/
module.exports = {
    generateNewClient: generateNewClient,
    generateNewClientSecret: generateNewClientSecret
};