const utils = require("./utils");
const modelParser = require("./modelParser");
const fs = require("fs");
const componentsCreator = require("./componentCreator");

const parser = (modelPath) => {
    const files = utils.getFileInDirectory(modelPath);
    files.forEach((file) => {
        const code = utils.readFileContent(`${modelPath}/${file}`);
        const model = modelParser.modelParser(code);
        componentsCreator.createSchemas(model);
        // fs.writeFileSync(`${file}.json`, JSON.stringify(model, null, 4))
    })
}

parser("./app/models");

module.exports = { parser };