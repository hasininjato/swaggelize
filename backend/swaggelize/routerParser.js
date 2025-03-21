const listEndpoints = require('express-list-endpoints');

const getEndPointsApi = (app) => {
    return listEndpoints(app);
}

module.exports = { getEndPointsApi };