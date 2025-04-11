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
    const cleanedComment = comment
        .replace(/^\s*\*\s*/gm, '')  // Remove leading asterisks and spaces
        .replace(/@swag/g, '')  // Remove the @swag annotation
        .trim();  // Trim leading/trailing spaces

    const methodsLine = cleanedComment
        .split('\n')  // Split by lines
        .find(line => line.toLowerCase().includes('methods'));  // Find the line with 'methods'

    let methodsArray = [];
    if (methodsLine !== undefined) {
        methodsArray = methodsLine
            .replace('methods:', '')  // Remove the 'methods:' prefix
            .trim()  // Trim spaces
            .split(',')  // Split by comma
            .map(method => method.trim());  // Trim spaces around each method
    }

    // Extract description
    const descriptionLine = cleanedComment
        .split('\n')  // Split by lines
        .find(line => line.toLowerCase().includes('description'));  // Find the line with 'description'

    let description = "";
    if (descriptionLine !== undefined) {
        description = descriptionLine
            .replace('description:', '')  // Remove the 'description:' prefix
            .trim();  // Trim spaces
    }

    const relationsLine = cleanedComment
        .split('\n')  // Split by lines
        .find(line => line.toLowerCase().includes('relations'));  // Find the line with 'description'
    let relations = "";
    if (relationsLine !== undefined) {
        relations = relationsLine
            .replace('relations:', '')  // Remove the 'description:' prefix
            .trim();  // Trim spaces
    }

    return {
        methods: methodsArray,
        description: description,
        relations: relations
    };
}

const getRelationsFromComment = (comment) => {
    // Clean up the comment
    const cleanedComment = comment
        .replace(/^\s*\*\s*/gm, '')  // Remove leading asterisks and spaces
        .replace(/@swag/g, '')  // Remove the @swag annotation
        .trim();  // Trim leading/trailing spaces

    const relationsLine = cleanedComment
        .split('\n')  // Split by lines
        .find(line => line.toLowerCase().includes('relations'));  // Find the line with 'description'

    let relations = "";
    if (relationsLine !== undefined) {
        relations = relationsLine
            .replace('relations:', '')  // Remove the 'description:' prefix
            .trim();  // Trim spaces
    }

    return relations;
}

const capitalizeFirstLetter = (str) => {
    if (!str) return str; // Handle empty string or null/undefined
    return str.charAt(0).toUpperCase() + str.slice(1);
}

const transformStr = (input) => {
    const [prefix, suffix] = input.split(':');
    const pascalPrefix = prefix.charAt(0).toUpperCase() + prefix.slice(1);
    const pascalCase = suffix
        ? pascalPrefix + suffix.charAt(0).toUpperCase() + suffix.slice(1)
        : pascalPrefix;

    return { pascalCase, suffix, prefix };
}

module.exports = {
    readFileContent,
    getFileInDirectory,
    getMethodsAndDescriptionFromComment,
    capitalizeFirstLetter,
    transformStr,
    getRelationsFromComment
}