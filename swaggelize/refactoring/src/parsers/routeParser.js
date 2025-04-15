const listEndpoints = require("express-list-endpoints");

function getEndPointsApi(app) {
    return listEndpoints(app)
}

function parseRoute(routeVariable) {
    console.log(getEndPointsApi(routeVariable))
}

module.exports = parseRoute;