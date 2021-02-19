const getOccurrences = (array, value) => {
    let count = 0;
    array.forEach((valueToCheck) => {
        if (valueToCheck === value) {
            count += 1;
        };
    });
    return count;
};

module.exports = {
    getOccurrences: getOccurrences
};