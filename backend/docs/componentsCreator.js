/**
 * create components from Sequelize models
 */
const fs = require('fs');
const path = require('path');

const create = (code) => {
    code.forEach(element => {
        // console.log(element)
        // console.log(JSON.stringify(element, null, 2))
        const modelName = getModelName(element.filename);
        // console.log(modelName.charAt(0).toUpperCase() + modelName.slice(1))
        createComponentDir();
        createServicesYamlFile(modelName);
    });
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

module.exports = { create }