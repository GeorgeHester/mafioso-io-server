/*
    Function to get the number of occurences of a value in an array
*/
const getOccurrences = (array, value) => {

    // Set default value
    let count = 0;

    // Loop through each item in the array
    array.forEach((valueToCheck) => {

        // Increment count if the values match
        if (valueToCheck === value) {

            count += 1;
        };
    });

    return count;
};

/*
    Module export(s)
*/
module.exports = {
    getOccurrences: getOccurrences
};