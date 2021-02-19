const checkObjectForClientId = (object, value) => {
    let found = false;

    for (let i = 0; i < Object.keys(object).length; i++) {
        if (object[Object.keys(object)[i]].clientId == value) {
            found = true;
            break;
        };
    };

    return found;
};

module.exports = {
    checkObjectForClientId: checkObjectForClientId
};