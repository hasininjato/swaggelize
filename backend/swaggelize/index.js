const utils = require("./utils");
const modelParser = require("./modelParser");

const parser = (modelPath) => {
    const files = utils.getFileInDirectory(modelPath);
    files.forEach((file) => {
        const code = utils.readFileContent(`${modelPath}/${file}`);
        const model = modelParser.modelParser(code);
        // console.log(utils.getMethodsAndDescriptionFromComment(model));
    })
}

parser("./app/models");

module.exports = { parser };