const fs = require('fs');
const path = require("path");
const t = require('@babel/types');

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

const getMethodsFromComment = (comment) => {
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
    return methodsArray;
}

const getDescriptionFromComment = (comment) => {
    // Clean up the comment
    const cleanedComment = comment
        .replace(/^\s*\*\s*/gm, '')  // Remove leading asterisks and spaces
        .replace(/@swag/g, '')  // Remove the @swag annotation
        .trim();  // Trim leading/trailing spaces

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
    return description;
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

    return {pascalCase, suffix, prefix};
}

const processValueNode = (node) => {
    if (t.isStringLiteral(node)) return node.value;
    if (t.isNumericLiteral(node)) return node.value;
    if (t.isBooleanLiteral(node)) return node.value;
    if (t.isNullLiteral(node)) return null;
    if (t.isIdentifier(node)) return node.name;
    return undefined;
};

const processObjectExpression = (objectExpression) => {
    return objectExpression.properties.reduce((result, prop) => {
        const key = t.isIdentifier(prop.key) ? prop.key.name :
            t.isStringLiteral(prop.key) ? prop.key.value : null;

        if (!key) return result;

        if (t.isObjectExpression(prop.value)) {
            result[key] = processObjectExpression(prop.value);
        } else {
            const value = processValueNode(prop.value);
            if (value !== undefined) result[key] = value;
        }

        return result;
    }, {});
};

const generateDefaultForeignKey = (targetModelName) => {
    return `${targetModelName.toLowerCase()}Id`;
};

const hasForeignKey = (options) => {
    if (!options) return false;
    if (options.foreignKey) return true;

    return Object.values(options).some(
        val => typeof val === 'object' && val !== null && hasForeignKey(val)
    );
};

const processRelationArguments = (argsNodes) => {
    const args = [];
    let options = {};

    argsNodes.forEach(arg => {
        if (t.isIdentifier(arg)) {
            args.push(arg.name);
        } else if (t.isStringLiteral(arg)) {
            args.push(arg.value);
        } else if (t.isObjectExpression(arg)) {
            options = processObjectExpression(arg);
            args.push(options);
        }
    });

    return {args, options};
};

const createRelationObject = (source, relationType, target, args, options) => {
    if (!hasForeignKey(options)) {
        const defaultForeignKey = generateDefaultForeignKey(target);
        options = {...options, foreignKey: defaultForeignKey};

        if (args.length > 1 && typeof args[1] === 'object') {
            args[1] = options;
        } else {
            args.push(options);
        }
    }

    return {
        type: "relation",
        relation: relationType,
        source,
        target,
        args
    };
};

const returnRelations = (modelDefinition) => {
    const relations = [];
    const modelName = modelDefinition.name;

    const programNode = modelDefinition.astPath.findParent(path =>
        path.isProgram()
    )?.node;

    if (!programNode) return {relations, programNode, modelName};
    return {relations, programNode, modelName};
}

module.exports = {
    readFileContent,
    getFileInDirectory,
    capitalizeFirstLetter,
    transformStr,
    getRelationsFromComment,
    getMethodsFromComment,
    getDescriptionFromComment,
    processValueNode,
    processObjectExpression,
    processRelationArguments,
    createRelationObject,
    generateDefaultForeignKey,
    hasForeignKey,
    returnRelations
}