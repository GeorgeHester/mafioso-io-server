/*
    Function to check if there is an occurence of a value in an object
*/
const checkObjectForClientId = (object, value) => {

    // Set default value
    let found = false;

    for (let i = 0; i < Object.keys(object).length; i++) {
        if (object[Object.keys(object)[i]].clientId == value) {
            found = true;
            break;
        };
    };

    return found;
};

/*
    Module export(s)
*/
module.exports = {
    checkObjectForClientId: checkObjectForClientId
};