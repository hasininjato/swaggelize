/**
 * parse the js model
 */
const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');

const parserModel = (modelPath) => {
    const files = getModelFiles(modelPath)
    const fields = [];
    files.forEach(file => {
        const filePath = `${modelPath}/${file}`;
        const code = readFileContent(filePath);
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

const getModelFiles = (directoryPath) => {
    try {
        return fs.readdirSync(directoryPath)
            .filter(file => fs.statSync(path.join(directoryPath, file)).isFile());
    } catch (err) {
        console.error("Error reading directory:", err.message);
        return [];
    }
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
                            methods: getMethodsFromComment(property.leadingComments[0].value)
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

const readFileContent = (filePath) => {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (err) {
        console.error("Error reading file:", err.message);
        return null;
    }
}

const getMethodsFromComment = (comment) => {
    const methodsArray = comment
        .replace(/^\s*\*\s*/gm, '')  // Remove leading asterisks and spaces
        .replace(/@swag/g, '')  // Remove the @swag annotation
        .trim()  // Trim leading/trailing spaces
        .split('\n')  // Split by lines
        .filter(line => line.toLowerCase().includes('methods'))  // Only keep the lines with 'methods'
        .map(line => line.replace('methods:', '').trim())  // Extract the methods part and clean up
        .join('')  // Join everything back to a single string
        .split(',')  // Split the methods by comma
        .map(method => method.trim());  // Trim spaces around each method

    return methodsArray;
}

module.exports = { parserModel }