/**
 * create components from Sequelize models
 */
const fs = require('fs');
const path = require('path');

const createSchemas = (code) => {
    let component = {};
    code.forEach(element => {
        const modelName = getModelName(element.filename);
        const modelNameCapitalize = capitalizeFirstLetter(modelName);
        element.swag.forEach((elt) => {
            const fieldName = elt.name;
            const type = elt.value.type.toLowerCase();

            elt.methods.forEach((method) => {
                const componentName = `${modelNameCapitalize}${capitalizeFirstLetter(method)}`;

                // Initialize the component object
                if (!component[componentName]) {
                    component[componentName] = {
                        type: "object",
                        properties: {}
                    };
                }
                component[componentName].properties[fieldName] = {
                    type: type == "decimal" ? "number" : "string",
                    description: elt.description
                };
            });
        });
    });
    return {
        components: {
            schemas: component
        }
    }
}

const create = (code) => {

}

const getModelName = (modelPath) => {
    const filename = modelPath.split('/').pop();
    return filename.replace('.model.js', '');
}

const createComponentDir = () => {
    const docsPath = path.join(__dirname); // Path to the docs folder

    const componentsPath = path.join(docsPath, 'components'); // Path to the components folder

    if (!fs.existsSync(componentsPath)) {
        fs.mkdirSync(componentsPath); // Create the components folder
    } else {
        console.log(`Folder already exists: ${componentsPath}`);
    }
}

const createServicesYamlFile = (modelName) => {
    const docsPath = path.join(__dirname);
    const componentsPath = path.join(docsPath, 'components');
    const modelNameUpperCase = modelName.charAt(0).toUpperCase() + modelName.slice(1);
    fs.writeFile(`${componentsPath}/${modelNameUpperCase}.yaml`, modelNameUpperCase, (err) => {
        if (err) {
            console.error('Error creating file:', err);
        }
    });
}

const capitalizeFirstLetter = (str) => {
    if (!str) return str; // Handle empty string or null/undefined
    return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = { create, createSchemas }