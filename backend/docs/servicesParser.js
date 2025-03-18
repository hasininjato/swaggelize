/**
 * parse yaml files in docs/services
 */
const fs = require('fs');
const path = require('path');

const getServicesFile = (directoryPath) => {
    try {
        return fs.readdirSync(directoryPath)
            .filter(file => fs.statSync(path.join(directoryPath, file)).isFile());
    } catch (err) {
        console.error("Error reading directory:", err.message);
        return [];
    }
}

module.exports = { getServicesFile }