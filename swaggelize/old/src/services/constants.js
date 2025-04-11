// Pre-compiled regex patterns
const COLLECTION_ROUTE_PATTERN_CACHE = new Map();
const ITEM_ROUTE_PATTERN_CACHE = new Map();
const PATH_PARAM_REGEX = /{([^}]+)}/g;
const INSERT_METHODS = new Set(["post", "put", "patch"]);
const METHOD_RESPONSE_CODES = {
    post: 201,
    get: 200,
    put: 200,
    patch: 200,
    delete: 204
};

// Standard responses definition
const STANDARD_RESPONSES = {
    400: {description: "Bad request"},
    404: {description: "Not found"},
    500: {description: "Internal server error"}
};

module.exports = {
    COLLECTION_ROUTE_PATTERN_CACHE,
    ITEM_ROUTE_PATTERN_CACHE,
    PATH_PARAM_REGEX,
    INSERT_METHODS,
    METHOD_RESPONSE_CODES,
    STANDARD_RESPONSES
}