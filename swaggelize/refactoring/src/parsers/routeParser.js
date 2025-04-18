const { getVariablesFromPath } = require("../utils/utils");

function parseRouteParams(fullPath) {
    const paths = getVariablesFromPath(fullPath);
    if (!paths) return null; // Handle case where no params exist

    const params = {};
    paths.forEach(path => {
        params[path.lastStaticSegment] = {  // Use the param name as the key
            in: "path",
            name: path.param,
            schema: {
                type: "string"
            },
            required: true,
            description: `${path.lastStaticSegment} ${path.param}`
        };
    });
    return params;
}

module.exports = parseRouteParams