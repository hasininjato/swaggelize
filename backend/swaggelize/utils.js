const fs = require('fs');
const path = require("path");

const readFileContent = (filePath) => {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (err) {
        console.error("Error reading file:", err.message);
        return null;
    }
}

const getFileInDirectory = (directoryPath) => {
    try {
        return fs.readdirSync(directoryPath)
            .filter(file => fs.statSync(path.join(directoryPath, file)).isFile());
    } catch (err) {
        console.error("Error reading directory:", err.message);
        return [];
    }
}

const getMethodsAndDescriptionFromComment = (comment) => {
    // Clean up the comment
    console.log(comment);
    return;
    const cleanedComment = comment
        .replace(/^\s*\*\s*/gm, '')  // Remove leading asterisks and spaces
        .replace(/@swag/g, '')  // Remove the @swag annotation
        .trim();  // Trim leading/trailing spaces

    const methodsLine = cleanedComment
        .split('\n')  // Split by lines
        .find(line => line.toLowerCase().includes('methods'));  // Find the line with 'methods'

    const methodsArray = methodsLine
        .replace('methods:', '')  // Remove the 'methods:' prefix
        .trim()  // Trim spaces
        .split(',')  // Split by comma
        .map(method => method.trim());  // Trim spaces around each method

    // Extract description
    const descriptionLine = cleanedComment
        .split('\n')  // Split by lines
        .find(line => line.toLowerCase().includes('description'));  // Find the line with 'description'

    let description = "";
    if (descriptionLine != undefined) {
        description = descriptionLine
            .replace('description:', '')  // Remove the 'description:' prefix
            .trim();  // Trim spaces
    }

    return {
        methods: methodsArray,
        description: description
    };
}

module.exports = {
    readFileContent,
    getFileInDirectory,
    getMethodsAndDescriptionFromComment
}