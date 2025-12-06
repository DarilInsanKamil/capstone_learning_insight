const ProgressHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'progress',
    version: '1.0.0',
    register: async (server, { service }) => {
        const progressHandler = new ProgressHandler(service);
        server.route(routes(progressHandler));
    },
};