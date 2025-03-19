/**
 * parse the js model
 */
const parser = require('@babel/parser');
const utils = require("./utils");

const parserModel = (modelPath) => {
    const files = utils.getFileInDirectory(modelPath);
    const fields = [];
    files.forEach(file => {
        const filePath = `${modelPath}/${file}`;
        const code = utils.readFileContent(filePath);
        const field = parseCode(code);
        if (field.length > 0) {
            fields.push({
                filename: filePath,
                swag: field
            })
        }
    });
    return fields;
}

const parseCode = (code) => {
    const ast = parser.parse(code, {
        sourceType: 'module'
    });
    const fields = [];

    // Step 1: Loop through the AST to find the fields with `@swag` annotations
    ast.program.body.forEach((body) => {
        if (body.declarations) {
            if (body.declarations[0].init.arguments.length > 1) {
                body.declarations[0].init.arguments[1].properties.forEach((property) => {
                    if (property.leadingComments && property.leadingComments[0].value.includes("@swag")) {
                        // Only get fields with @swag annotation
                        const field = {
                            name: property.key.name,
                            methods: getMethodsAndDescriptionFromComment(property.leadingComments[0].value).methods,
                            description: getMethodsAndDescriptionFromComment(property.leadingComments[0].value).description,
                        };
                        fields.push(field);
                    }
                });
            }
        }
    });

    // Step 2: Create a regex dynamically based on the names in fields[]
    const fieldNames = fields.map(f => f.name).join('|'); // Convert array to "id|amount|description|date"
    const regex = new RegExp(
        `\\b(${fieldNames})\\b\\s*:\\s*(\\{(?:[^{}]*|\\{(?:[^{}]*|\\{[^{}]*\\})*\\})*\\})`,
        'g'
    );

    let match;
    while ((match = regex.exec(code)) !== null) {
        try {
            const mockDataTypes = match[2].replace(/DataTypes\.(\w+)/g, '"$1"');
            const value = eval(`(${mockDataTypes})`);
            const field = fields.find(f => f.name === match[1]);
            if (field) {
                field.value = value;
            }

        } catch (error) {
            console.error(`Error parsing field ${match[1]}:`, error);
        }
    }

    return fields;
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

module.exports = { parserModel }