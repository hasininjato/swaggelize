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
    console.log(directoryPath)
    try {
        return fs.readdirSync(directoryPath)
            .filter(file => fs.statSync(path.join(directoryPath, file)).isFile());
    } catch (err) {
        console.error("Error reading directory:", err.message);
        return [];
    }
}

module.exports = {
    readFileContent,
    getFileInDirectory
}