const utils = require('./utils');

// Constants for schema types and methods
const SCHEMA_TYPES = {
    OBJECT: 'object',
    ARRAY: 'array',
    NUMBER: 'number',
    STRING: 'string'
};

const METHODS = {
    LIST: 'list',
    PUT: 'put',
    POST: 'post'
};

const createSchemas = (code) => {
    const components = {};
    const requiredFields = new Set();

    code.value.forEach(element => {
        if (element.type !== "field") return;
        console.log(element);

        element.comment.methods.forEach(method => {
            const componentName = `${code.sequelizeModel}${utils.capitalizeFirstLetter(method)}`;
            const fieldName = element.field;
            const fieldType = element.object?.type === "decimal" ? SCHEMA_TYPES.NUMBER : SCHEMA_TYPES.STRING;
            const fieldDescription = element.comment.description;

            // Initialize component if it doesn't exist
            if (!components[componentName]) {
                components[componentName] = method === METHODS.LIST
                    ? {
                        type: SCHEMA_TYPES.ARRAY,
                        items: {
                            type: SCHEMA_TYPES.OBJECT,
                            properties: {}
                        }
                    }
                    : {
                        type: SCHEMA_TYPES.OBJECT,
                        properties: {}
                    };
            }

            // Handle field properties
            const targetProperties = method === METHODS.LIST
                ? components[componentName].items.properties
                : components[componentName].properties;

            targetProperties[fieldName] = {
                type: fieldType,
                description: fieldDescription
            };

            // Add to required fields for PUT/POST methods
            if ([METHODS.PUT, METHODS.POST].includes(method)) {
                requiredFields.add(fieldName);
                components[componentName].required = Array.from(requiredFields);
            }
        });
    });

    return components;
};

module.exports = { createSchemas };