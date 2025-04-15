function parseRoute(routeVariable) {
    const route = routeVariable.replace(/^\//, '');
    const path = route.split('/').map((segment) => {
        if (segment.startsWith(':')) {
            return `{${segment.slice(1)}}`;
        } else if (segment.startsWith('*')) {
            return `*{${segment.slice(1)}}`;
        }
        return segment;
    }).join('/');
    return `/${path}`;
}

module.exports = parseRoute;