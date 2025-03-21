/**
 * create components from Sequelize models
 */
const fs = require('fs');
const { type } = require('os');
const path = require('path');
const utils = require('./utils');

const createSchemas = (code) => {
    let component = {};
    let required = [];
    code.value.forEach(elt => {
        if (elt.type == "field") {
            elt.comment.methods.forEach((method) => {
                let componentName = `${code.sequelizeModel}`;
                componentName += utils.capitalizeFirstLetter(method);
                if (!component[componentName]) {
                    component[componentName] = {
                        type: "object",
                        properties: {}
                    };
                }
                const fieldName = elt.field;
                if (method == "put" || method == "post") {
                    if (!required.includes(fieldName)) {
                        required.push(fieldName);
                    }
                    component[componentName]["required"] = required;
                }
                // console.log(required)
                component[componentName].properties[fieldName] = {
                    type: type == "decimal" ? "number" : "string",
                    description: elt.comment.description
                };
            })
        }
    });
    console.log(JSON.stringify(component, null, 4))
}

module.exports = { createSchemas }