const utils = require("./utils");
const yaml = require('js-yaml');

const servicesParser = (servicePath) => {
    const servicesFile = utils.getFileInDirectory(servicePath);
    servicesFile.forEach((file) => {
        const contentYaml = utils.readFileContent(`${servicePath}/${file}`);
        const parsedYaml = yaml.load(contentYaml);
        console.log(JSON.stringify(parsedYaml, null, 4));
    })
    return servicesFile;
}

module.exports = { servicesParser };